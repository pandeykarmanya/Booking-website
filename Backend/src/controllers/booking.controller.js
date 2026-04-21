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
import { sendBookingConfirmation, sendBookingCancellation } from '../services/email.service.js';

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
   🧮 Helper - Parse date to dayjs (works with Date objects)
----------------------------------------------*/
const parseBookingDate = (raw) => {
    return dayjs(raw).tz(TZ);
};

/*----------------------------------------------
   🧮 Helper - Get dayjs range from filter params
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

    const targetDay = dayjs.tz(date, TZ).startOf("day").toDate();
    const nextDay = dayjs.tz(date, TZ).add(1, 'day').startOf("day").toDate();

    // ✅ Query with Date range
    const allBookings = await Booking.find({ 
        date: { $gte: targetDay, $lt: nextDay },
        status: { $in: ["pending", "confirmed"] }
    });

    const unavailableVenueIds = new Set();
    allBookings.forEach((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd   = timeToMinutes(b.endTime);
        if (isOverlapping(reqStart, reqEnd, bookStart, bookEnd)) {
            unavailableVenueIds.add(b.venue.toString());
        }
    });

    const allVenues = await Venue.find({ status: "available" });
    const availableVenues = allVenues.filter(v => !unavailableVenueIds.has(v._id.toString()));

    return res.status(200).json(
        new ApiResponse(200, { date, startTime, endTime, availableVenues }, "Available venues fetched successfully")
    );
});

/*----------------------------------------------
   🟩 USER — Create Booking
----------------------------------------------*/
const createBooking = asyncHandler(async (req, res) => {
    const { venue, date, startTime, endTime, numberOfPeople, totalAmount, specialRequests } = req.body;
    const userId = req.user._id;

    if (!venue || !date || !startTime || !endTime) {
        throw new ApiError(400, "Venue, date, startTime and endTime are required");
    }

    const venueExists = await Venue.findById(venue);
    if (!venueExists) throw new ApiError(404, "Venue not found");
    if (venueExists.status !== "available") {
        throw new ApiError(400, "This venue is currently under maintenance and cannot be booked");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd   = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
        throw new ApiError(400, "Invalid time format. Use HH:MM (e.g., 09:00)");
    }

    // ✅ Convert to Date object
    const bookingDate = dayjs.tz(date, TZ).startOf("day").toDate();
    
    // Validate date is not in the past
    const today = dayjs().tz(TZ).startOf("day").toDate();
    if (bookingDate < today) {
        throw new ApiError(400, "Cannot book dates in the past");
    }

    // Check for conflicts using static method
    const conflicts = await Booking.findConflicts(venue, bookingDate, startTime, endTime);
    
    if (conflicts.length > 0) {
        throw new ApiError(400, "This venue is already booked for the selected time slot");
    }

    const booking = await Booking.create({
        user: userId,
        venue,
        date: bookingDate,
        startTime,
        endTime,
        numberOfPeople: numberOfPeople || 1,
        totalAmount: totalAmount || 0,
        specialRequests: specialRequests || '',
        status: 'confirmed' // Auto-confirm for simplicity; can be changed to 'pending' if admin approval is needed
    });

    const populatedBooking = await Booking.findById(booking._id)
    .populate("user", "name email")
    .populate("venue", "name location capacity pricePerHour");

// ✅ Send confirmation email
await sendBookingConfirmation(populatedBooking, populatedBooking.user);

return res.status(201).json(
    new ApiResponse(201, populatedBooking, "Booking created successfully. Confirmation email sent!")
);
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

    // Check if already cancelled
    if (booking.status === "cancelled") {
        throw new ApiError(400, "Booking is already cancelled");
    }

    if (booking.isOngoing()) {
        throw new ApiError(400, "Cannot cancel a booking that is already in progress");
    }

    // Check if booking is in the past or already completed
    if (booking.status === "completed" || booking.isPast()) {
        throw new ApiError(400, "Cannot cancel past bookings");
    }

    booking.status = "cancelled";
await booking.save();

// ✅ Populate booking data before sending email
const populatedBooking = await Booking.findById(booking._id)
    .populate("user", "name email")
    .populate("venue", "name location");

// Send cancellation email
const user = req.user.role === "admin" ? populatedBooking.user : req.user;
await sendBookingCancellation(populatedBooking, populatedBooking.user);

return res.status(200).json(
    new ApiResponse(200, populatedBooking, "Booking cancelled successfully. Cancellation email sent!")
);
});

/*----------------------------------------------
   🟥 ADMIN — Delete Booking (Permanently)
----------------------------------------------*/
const deleteBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;
    
    if (!bookingId) {
        throw new ApiError(400, "Booking ID is required");
    }

    const existingBooking = await Booking.findById(bookingId);
    if (!existingBooking) {
        throw new ApiError(404, "Booking not found");
    }

    const deletedBooking = await Booking.findByIdAndDelete(bookingId);
    
    return res.status(200).json(
        new ApiResponse(200, deletedBooking, "Booking deleted successfully")
    );
});

/*----------------------------------------------
   🟥 ADMIN — Get All Bookings
----------------------------------------------*/
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find()
        .populate("user", "name email")
        .populate("venue", "name location capacity")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, bookings, "All bookings fetched successfully")
    );
});

/*----------------------------------------------
   🟥 ADMIN — Get Upcoming Bookings (Pre-bookings)
----------------------------------------------*/
const getUpcomingBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ 
        date: { $gte: dayjs().tz(TZ).startOf("day").toDate() },
        status: { $ne: 'cancelled' }
    })
    .populate("user", "name email")
    .populate("venue", "name location capacity")
    .sort({ date: 1, startTime: 1 });

    const upcomingBookings = bookings.filter(b => {
        const bookingStart = dayjs.tz(
            `${dayjs(b.date).format("YYYY-MM-DD")} ${b.startTime}`,
            "YYYY-MM-DD HH:mm",
            TZ
        );
        return bookingStart.isAfter(dayjs().tz(TZ));
    });

    return res.status(200).json(         // ← was missing
        new ApiResponse(200, upcomingBookings, "Upcoming bookings fetched successfully")
    );
});        

/*----------------------------------------------
   🟩 USER — Get My Bookings
----------------------------------------------*/
const getMyBookings = asyncHandler(async (req, res) => {
    const myBookings = await Booking.find({ user: req.user._id })
        .populate("venue", "name location capacity pricePerHour images")
        .sort({ date: -1 });

    const now = dayjs().tz(TZ); // ✅ current time, NOT startOf("day")

    const upcomingBookings = myBookings.filter(b => {
        if (b.status === 'cancelled') return false;

        // Combine booking date + startTime → full datetime
        const bookingStart = dayjs.tz(
            `${dayjs(b.date).format("YYYY-MM-DD")} ${b.startTime}`,
            "YYYY-MM-DD HH:mm",
            TZ
        );

        return bookingStart.isAfter(now); // ✅ strictly in the future
    });

    const ongoingBookings = myBookings.filter(b => {
    if (b.status === 'cancelled') return false;
    const bookingStart = dayjs.tz(
        `${dayjs(b.date).format("YYYY-MM-DD")} ${b.startTime}`,
        "YYYY-MM-DD HH:mm", TZ
    );
    const bookingEnd = dayjs.tz(
        `${dayjs(b.date).format("YYYY-MM-DD")} ${b.endTime}`,
        "YYYY-MM-DD HH:mm", TZ
    );
    return bookingStart.isSameOrBefore(now) && bookingEnd.isAfter(now); // in progress
});

    const pastBookings = myBookings.filter(b => {
        if (b.status === 'cancelled') return true;

        // Combine booking date + endTime → full datetime
        const bookingEnd = dayjs.tz(
            `${dayjs(b.date).format("YYYY-MM-DD")} ${b.endTime}`,
            "YYYY-MM-DD HH:mm",
            TZ
        );

        return bookingEnd.isBefore(now) || bookingEnd.isSame(now); // ✅ already ended
    });

    return res.status(200).json(
        new ApiResponse(200, {
            upcoming: upcomingBookings,
            ongoing: ongoingBookings,
            past: pastBookings,
            total: myBookings.length
        }, "Your bookings fetched successfully")
    );
});
/*----------------------------------------------
   🟩 TODAY BOOKINGS
----------------------------------------------*/
 const getTodayBookings = asyncHandler(async (req, res) => {
    const todayStart = dayjs().tz(TZ).startOf("day").toDate();
    const todayEnd = dayjs().tz(TZ).endOf("day").toDate();

    const bookings = await Booking.find({ 
        date: { $gte: todayStart, $lte: todayEnd },
        status: { $ne: "cancelled" }
    })
    .populate("user", "name email")
    .populate("venue", "name location")
    .sort({ startTime: 1 });

    return res.status(200).json(
        new ApiResponse(200, bookings, "Today's bookings fetched successfully")
    );
});

/*----------------------------------------------
   🟥 ADMIN — Get Filtered Bookings
----------------------------------------------*/
const getFilteredBookings = asyncHandler(async (req, res) => {
    const { filter, from, to } = req.query;

    const range = getDateRange(filter, from, to);
    if (!range) {
        throw new ApiError(400, "Invalid filter params");
    }

    const { startDate, endDate } = range;

    const bookings = await Booking.find({
        date: { 
            $gte: startDate.toDate(), 
            $lte: endDate.toDate() 
        }
    })
    .populate("user", "name email")
    .populate("venue", "name location")
    .sort({ date: -1, startTime: 1 });

    return res.status(200).json(
        new ApiResponse(200, {
            count: bookings.length,
            bookings
        }, "Filtered bookings fetched successfully")
    );
});

/*----------------------------------------------
   🟥 ADMIN — Get Venue Availability
----------------------------------------------*/
const getVenueAvailability = asyncHandler(async (req, res) => {
    const { venueId, date } = req.query;

    if (!venueId || !date) {
        throw new ApiError(400, "Venue ID and date are required");
    }

    const searchDate = dayjs.tz(date, TZ).startOf("day").toDate();
    const nextDay = dayjs.tz(date, TZ).add(1, 'day').startOf("day").toDate();
    
    const bookings = await Booking.find({
        venue: venueId,
        date: { $gte: searchDate, $lt: nextDay },
        status: { $in: ['pending', 'confirmed'] }
    }).select('startTime endTime status');

    const bookedSlots = bookings.map(b => ({
        startTime: b.startTime,
        endTime: b.endTime,
        status: b.status
    }));

    return res.status(200).json(
        new ApiResponse(200, {
            date,
            bookedSlots
        }, "Venue availability fetched successfully")
    );
});

/*----------------------------------------------
   📥 DOWNLOAD PDF
----------------------------------------------*/
const downloadBookingsPDF = asyncHandler(async (req, res) => {
    const { filter, from, to } = req.query;

    const range = getDateRange(filter, from, to);
    if (!range) {
        throw new ApiError(400, "Invalid filter params");
    }

    const { startDate, endDate, label } = range;

    const bookings = await Booking.find({
        date: { 
            $gte: startDate.toDate(), 
            $lte: endDate.toDate() 
        }
    })
    .populate("user", "name email")
    .populate("venue", "name location")
    .sort({ date: -1, startTime: 1 });

    // ✅ Landscape + better margins
    const doc = new PDFDocument({ margin: 30, size: "A4", layout: "landscape" });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        `attachment; filename="bookings-${filter === "today" ? "today" : `${from}_to_${to}`}.pdf"`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ── Header ──────────────────────────
    doc.rect(0, 0, doc.page.width, 70).fill("#7a1c2e");

    doc.fillColor("#ffffff")
        .fontSize(20)
        .font("Helvetica-Bold")
        .text("Booking Report", 30, 20);

    doc.fontSize(10)
        .font("Helvetica")
        .text(`Period: ${label}`, 30, 46);

    // ── Summary ─────────────────────────
    doc.fillColor("#7a1c2e")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Total Bookings: ${bookings.length}`, 30, 85);

    // ── Table Layout ────────────────────
    const tableTop = 110;

    const col = {
        date: 30,
        user: 160,
        venue: 330,
        time: 560,
        status: 700
    };

    const drawTableHeader = (y) => {
        doc.rect(30, y, pageWidth, 24).fill("#f3e8eb");

        doc.fillColor("#7a1c2e")
            .fontSize(10)
            .font("Helvetica-Bold");

        doc.text("Date", col.date, y + 7);
        doc.text("User", col.user, y + 7);
        doc.text("Venue", col.venue, y + 7);
        doc.text("Time", col.time, y + 7);
        doc.text("Status", col.status, y + 7, { width: 90, align: "right" });
    };

    drawTableHeader(tableTop);

    let y = tableTop + 28;
    const rowH = 24;
    let rowIdx = 0;

    const truncate = (str, max) =>
        str && str.length > max ? str.slice(0, max) + "…" : str || "—";

    for (const b of bookings) {
        if (y + rowH > doc.page.height - 60) {
            doc.addPage();
            drawTableHeader(40);
            y = 68;
            rowIdx = 0;
        }

        // Row background
        doc.rect(30, y, pageWidth, rowH)
            .fill(rowIdx % 2 === 0 ? "#fdf6f7" : "#ffffff");

        const dateStr = parseBookingDate(b.date).format("DD MMM YYYY");
        const timeStr = `${b.startTime} - ${b.endTime}`;

        const statusColor =
            b.status === "confirmed" ? "#166534" :
            b.status === "cancelled" ? "#991b1b" :
            b.status === "completed" ? "#1e40af" : "#92400e";

        const statusText = truncate((b.status || "pending").toUpperCase(), 12);

        doc.fillColor("#1a1a1a")
            .fontSize(9)
            .font("Helvetica");

        doc.text(dateStr, col.date, y + 7, { width: 120 });
        doc.text(truncate(b.user?.name, 20), col.user, y + 7, { width: 150 });
        doc.text(truncate(b.venue?.name, 25), col.venue, y + 7, { width: 200 });
        doc.text(timeStr, col.time, y + 7, { width: 120 });

        doc.fillColor(statusColor).text(
            statusText,
            col.status,
            y + 7,
            { width: 90, align: "right" }
        );

        // Border
        doc.rect(30, y, pageWidth, rowH)
            .strokeColor("#e5e7eb")
            .lineWidth(0.5)
            .stroke();

        y += rowH;
        rowIdx++;
    }

    // Empty state
    if (bookings.length === 0) {
        doc.fillColor("#6b7280")
            .fontSize(11)
            .font("Helvetica")
            .text(
                "No bookings found for the selected period.",
                30,
                tableTop + 40,
                { align: "center", width: pageWidth }
            );
    }

    // ── Footer ─────────────────────────
    const footerY = doc.page.height - 40;

    doc.rect(0, footerY - 8, doc.page.width, 48).fill("#f9fafb");

    doc.fillColor("#9ca3af")
        .fontSize(8)
        .font("Helvetica")
        .text(
            `Generated on ${dayjs().tz(TZ).format("DD MMM YYYY, hh:mm A")} · Admin Portal`,
            30,
            footerY,
            { align: "center", width: pageWidth }
        );

    doc.end();
});

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
    getUpcomingBookings,
    getVenueAvailability,
    getTodayBookings
};
