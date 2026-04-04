import { Booking } from "../models/booking.model.js";
import { Venue } from "../models/venue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import PDFDocument from "pdfkit";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter.js";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore.js";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const TZ = "Asia/Kolkata";

/*----------------------------------------------
   🧮 Helper - Convert time string to minutes
----------------------------------------------*/
const timeToMinutes = (t) => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
};

/*----------------------------------------------
   🧮 Helper - Check if two time slots overlap
----------------------------------------------*/
const isOverlapping = (s1, e1, s2, e2) => {
    return s1 < e2 && e1 > s2;
};

/*----------------------------------------------
   🧮 Helper - Parse any date format with dayjs
   Works for both ISODate and long string dates
   like "Fri Apr 03 2026 05:30:00 GMT+0530"
----------------------------------------------*/
const parseBookingDate = (raw) => {
    return dayjs(new Date(raw)).tz(TZ);
};

/*----------------------------------------------
   🧮 Helper - Get dayjs range from filter params
   Returns dayjs objects (not .toDate()) so we
   can use isSameOrAfter / isSameOrBefore
----------------------------------------------*/
const getDateRange = (filter, from, to) => {
    let startDate, endDate, label;

    if (filter === "today") {
        startDate = dayjs().tz(TZ).startOf("day");
        endDate   = dayjs().tz(TZ).endOf("day");
        label     = `Today — ${dayjs().tz(TZ).format("DD MMM YYYY")}`;
    }
    else if (filter === "custom" && from && to) {
        startDate = dayjs.tz(from, TZ).startOf("day");
        endDate   = dayjs.tz(to,   TZ).endOf("day");
        label     = `${dayjs.tz(from, TZ).format("DD MMM YYYY")} to ${dayjs.tz(to, TZ).format("DD MMM YYYY")}`;
    }
    else {
        return null;
    }

    return { startDate, endDate, label };
};

/*----------------------------------------------
   🧮 Helper - JS-side date filter
   Works for both string dates and ISODates
   since MongoDB $gte/$lte fails on strings
----------------------------------------------*/
const filterByDateRange = (bookings, startDate, endDate) => {
    return bookings.filter((b) => {
        const d = parseBookingDate(b.date);
        return d.isSameOrAfter(startDate) && d.isSameOrBefore(endDate);
    });
};

/*----------------------------------------------
   🟩 USER — Check Available Venues
----------------------------------------------*/
const getAvailableVenues = asyncHandler(async (req, res) => {
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
        throw new ApiError(400, "Date, startTime and endTime are required");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd   = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    const targetDay    = dayjs.tz(date, TZ).startOf("day");
    const allBookings  = await Booking.find({ status: "confirmed" });

    const unavailableVenueIds = new Set();
    allBookings.forEach((b) => {
        const bookingDay = parseBookingDate(b.date).startOf("day");
        if (!bookingDay.isSame(targetDay, "day")) return;

        const bookStart = timeToMinutes(b.startTime);
        const bookEnd   = timeToMinutes(b.endTime);
        if (isOverlapping(reqStart, reqEnd, bookStart, bookEnd)) {
            unavailableVenueIds.add(b.venue.toString());
        }
    });

    const allVenues       = await Venue.find();
    const availableVenues = allVenues.filter(v => !unavailableVenueIds.has(v._id.toString()));

    return res.status(200).json(
        new ApiResponse(200, { date, startTime, endTime, availableVenues }, "Available venues fetched successfully")
    );
});

/*----------------------------------------------
   🟩 USER — Create Booking (AUTO-CONFIRM)
   Now saves date as proper ISODate
----------------------------------------------*/
const createBooking = asyncHandler(async (req, res) => {
    const { venue, date, startTime, endTime } = req.body;
    const userId = req.user._id;

    if (!venue || !date || !startTime || !endTime) {
        throw new ApiError(400, "All fields are required");
    }

    const venueExists = await Venue.findById(venue);
    if (!venueExists) throw new ApiError(400, "Venue not found");

    const reqStart = timeToMinutes(startTime);
    const reqEnd   = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    // ✅ Save as proper ISODate — fixes all future bookings
    const bookingDate = dayjs.tz(date, TZ).startOf("day").toDate();
    const targetDay   = dayjs.tz(date, TZ).startOf("day");

    // JS-side overlap check — works for both old string and new ISODate docs
    const allConfirmed = await Booking.find({ venue, status: "confirmed" });
    const overlap = allConfirmed.some((b) => {
        const bDay = parseBookingDate(b.date).startOf("day");
        if (!bDay.isSame(targetDay, "day")) return false;
        return isOverlapping(reqStart, reqEnd, timeToMinutes(b.startTime), timeToMinutes(b.endTime));
    });

    if (overlap) {
        throw new ApiError(400, "This venue is already booked for the selected time slot");
    }

    const booking = await Booking.create({
        user: userId,
        venue,
        date: bookingDate,
        startTime,
        endTime,
    });

    return res.status(201).json(new ApiResponse(201, booking, "Booking created successfully"));
});

/*----------------------------------------------
   🟥 USER / ADMIN — Cancel Booking
----------------------------------------------*/
const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to cancel this booking");
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json(new ApiResponse(200, booking, "Booking cancelled successfully"));
});

/*----------------------------------------------
   🟥 ADMIN — Delete Booking (Permanently)
----------------------------------------------*/
const deleteBooking = async (req, res) => {
    try {
        const { bookingId } = req.params;
        if (!bookingId) return res.status(400).json({ message: "Booking ID is required" });

        const existingBooking = await Booking.findById(bookingId);
        if (!existingBooking) return res.status(404).json({ message: "Booking not found" });

        const deletedBooking = await Booking.findByIdAndDelete(bookingId);
        res.status(200).json({ message: "Booking deleted successfully", booking: deletedBooking });
    } catch (error) {
        res.status(500).json({ message: error.message || "Failed to delete booking" });
    }
};

/*----------------------------------------------
   🟥 ADMIN — Get All Bookings
----------------------------------------------*/
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find()
        .populate("user", "name email")
        .populate("venue", "name location capacity");

    return res.status(200).json(new ApiResponse(200, bookings, "All bookings fetched successfully"));
});

/*----------------------------------------------
   🟩 USER — Get My Bookings
----------------------------------------------*/
const getMyBookings = asyncHandler(async (req, res) => {
    const myBookings = await Booking.find({ user: req.user._id })
        .populate("venue", "name location")
        .sort({ date: -1 });

    return res.status(200).json(new ApiResponse(200, myBookings, "Your bookings fetched successfully"));
});

/*----------------------------------------------
   🟩 TODAY BOOKINGS
----------------------------------------------*/
export const getTodayBookings = asyncHandler(async (req, res) => {
    const todayStart = dayjs().tz(TZ).startOf("day");
    const todayEnd   = dayjs().tz(TZ).endOf("day");

    const allBookings = await Booking.find({ status: { $ne: "cancelled" } })
        .populate("user", "name")
        .populate("venue", "name");

    const bookings = filterByDateRange(allBookings, todayStart, todayEnd)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));

    return res.status(200).json(new ApiResponse(200, bookings, "Today's bookings fetched successfully"));
});

/*----------------------------------------------
   ✅ FIXED: FILTER BOOKINGS
   Uses JS-side filtering — works for both
   old string dates and new ISODates
----------------------------------------------*/
const getFilteredBookings = async (req, res) => {
    try {
        const { filter, from, to } = req.query;

        const range = getDateRange(filter, from, to);
        if (!range) {
            return res.status(400).json({ success: false, message: "Invalid filter params." });
        }

        const { startDate, endDate } = range;

        const allBookings = await Booking.find()
            .populate("user", "name email")
            .populate("venue", "name location");

        const bookings = filterByDateRange(allBookings, startDate, endDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        res.status(200).json({
            success: true,
            count: bookings.length,
            bookings,
        });

    } catch (err) {
        console.error("getFilteredBookings error:", err);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

/*----------------------------------------------
   ✅ FIXED: DOWNLOAD PDF
   JS-side filtering + full PDF generation
----------------------------------------------*/
const downloadBookingsPDF = async (req, res) => {
    try {
        const { filter, from, to } = req.query;

        const range = getDateRange(filter, from, to);
        if (!range) {
            return res.status(400).json({ success: false, message: "Invalid filter params." });
        }

        const { startDate, endDate, label } = range;

        const allBookings = await Booking.find()
            .populate("user", "name email")
            .populate("venue", "name location");

        const bookings = filterByDateRange(allBookings, startDate, endDate)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        // ── Build PDF ──────────────────────────
        const doc = new PDFDocument({ margin: 40, size: "A4" });

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            `attachment; filename="bookings-${filter === "today" ? "today" : `${from}_to_${to}`}.pdf"`
        );
        doc.pipe(res);

        // Header band
        doc.rect(0, 0, doc.page.width, 70).fill("#7a1c2e");
        doc.fillColor("#ffffff").fontSize(20).font("Helvetica-Bold")
           .text("Booking Report", 40, 20);
        doc.fontSize(10).font("Helvetica")
           .text(`Period: ${label}`, 40, 46);

        // Summary
        doc.fillColor("#7a1c2e").fontSize(11).font("Helvetica-Bold")
           .text(`Total Bookings: ${bookings.length}`, 40, 85);

        // Table columns
        const tableTop = 110;
        const col = { date: 40, user: 160, venue: 300, time: 420, status: 520 };

        const drawTableHeader = (y) => {
            doc.rect(40, y, doc.page.width - 80, 22).fill("#f3e8eb");
            doc.fillColor("#7a1c2e").fontSize(9).font("Helvetica-Bold");
            doc.text("Date",   col.date,   y + 6);
            doc.text("User",   col.user,   y + 6);
            doc.text("Venue",  col.venue,  y + 6);
            doc.text("Time",   col.time,   y + 6);
            doc.text("Status", col.status, y + 6);
        };

        drawTableHeader(tableTop);

        let y      = tableTop + 26;
        const rowH = 22;
        let rowIdx = 0;

        const truncate = (str, max) =>
            str && str.length > max ? str.slice(0, max) + "…" : str || "—";

        for (const b of bookings) {
            if (y + rowH > doc.page.height - 60) {
                doc.addPage();
                drawTableHeader(40);
                y = 66;
                rowIdx = 0;
            }

            doc.rect(40, y, doc.page.width - 80, rowH)
               .fill(rowIdx % 2 === 0 ? "#fdf6f7" : "#ffffff");

            const dateStr = b.date
                ? parseBookingDate(b.date).format("DD MMM YYYY")
                : "—";
            const timeStr = b.startTime && b.endTime
                ? `${b.startTime} - ${b.endTime}`
                : "—";
            const statusColor =
                b.status === "confirmed" ? "#166534" :
                b.status === "cancelled" ? "#991b1b" : "#92400e";

            doc.fillColor("#1a1a1a").fontSize(8.5).font("Helvetica");
            doc.text(dateStr,                       col.date,   y + 6, { width: 110 });
            doc.text(truncate(b.user?.name,  14),   col.user,   y + 6, { width: 130 });
            doc.text(truncate(b.venue?.name, 14),   col.venue,  y + 6, { width: 110 });
            doc.text(timeStr,                       col.time,   y + 6, { width: 90  });
            doc.fillColor(statusColor)
               .text((b.status || "pending").toUpperCase(), col.status, y + 6, { width: 70 });

            doc.rect(40, y, doc.page.width - 80, rowH)
               .strokeColor("#e5e7eb").lineWidth(0.5).stroke();

            y += rowH;
            rowIdx++;
        }

        if (bookings.length === 0) {
            doc.fillColor("#6b7280").fontSize(11).font("Helvetica")
               .text("No bookings found for the selected period.", 40, tableTop + 40, { align: "center" });
        }

        // Footer
        const footerY = doc.page.height - 40;
        doc.rect(0, footerY - 8, doc.page.width, 48).fill("#f9fafb");
        doc.fillColor("#9ca3af").fontSize(8).font("Helvetica")
           .text(
               `Generated on ${dayjs().tz(TZ).format("DD MMM YYYY, hh:mm A")} · Admin Portal`,
               40, footerY,
               { align: "center", width: doc.page.width - 80 }
           );

        doc.end();

    } catch (err) {
        console.error("downloadBookingsPDF error:", err);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: "PDF generation failed." });
        }
    }
};

/*----------------------------------------------
   📤 EXPORT
----------------------------------------------*/
export {
    getAvailableVenues,
    createBooking,
    cancelBooking,
    deleteBooking,
    getAllBookings,
    getMyBookings,
    getFilteredBookings,
    downloadBookingsPDF,
};