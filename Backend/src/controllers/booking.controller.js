import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FIXED_VENUES } from "../constants/venues.js";

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
   🟩 USER — Check Available Venues
----------------------------------------------*/
const getAvailableVenues = asyncHandler(async (req, res) => {
    // Changed from req.body to req.query for GET request
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
        throw new ApiError(400, "Date, startTime and endTime are required");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    // Get all confirmed bookings on the same date
    const bookings = await Booking.find({
        date,
        status: "confirmed"
    });

    const unavailable = new Set();

    bookings.forEach((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd = timeToMinutes(b.endTime);

        if (isOverlapping(reqStart, reqEnd, bookStart, bookEnd)) {
            unavailable.add(b.venue);
        }
    });

    const available = FIXED_VENUES.filter(v => !unavailable.has(v.id));

    return res.status(200).json(
        new ApiResponse(200, {
            date,
            startTime,
            endTime,
            availableVenues: available,
            unavailableVenues: [...unavailable]
        }, "Available venues fetched successfully")
    );
});

/*----------------------------------------------
   🟩 USER — Create Booking (AUTO-CONFIRM)
----------------------------------------------*/
const createBooking = asyncHandler(async (req, res) => {
    const { venue, date, startTime, endTime } = req.body;
    const userId = req.user._id;

    if (!venue || !date || !startTime || !endTime) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate venue exists
    const selectedVenue = FIXED_VENUES.find(v => v.id === venue);
    if (!selectedVenue) {
        throw new ApiError(400, "Invalid venue selected");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);
    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    // Check overlapping bookings
    const exists = await Booking.findOne({
        venue,
        date,
        status: "confirmed",
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    if (exists) {
        throw new ApiError(400, "This venue is already booked for the selected time slot");
    }

    // Create booking
    const booking = await Booking.create({
        user: userId,
        venue,
        date,
        startTime,
        endTime
    });

    return res.status(201).json(
        new ApiResponse(201, booking, "Booking created successfully")
    );
});

/*----------------------------------------------
   🟥 USER / ADMIN — Cancel Booking
----------------------------------------------*/
const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    // Only admin OR owner can cancel
    if (
        req.user.role !== "admin" &&
        booking.user.toString() !== req.user._id.toString()
    ) {
        throw new ApiError(403, "You are not allowed to cancel this booking");
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled successfully")
    );
});

/*----------------------------------------------
   🟥 ADMIN — Get All Bookings
----------------------------------------------*/
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate("user", "name email");

    return res.status(200).json(
        new ApiResponse(200, bookings, "All bookings fetched successfully")
    );
});

/*----------------------------------------------
   🟩 USER — Get My Bookings
----------------------------------------------*/
const getMyBookings = asyncHandler(async (req, res) => {
    const myBookings = await Booking.find({
        user: req.user._id
    }).sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, myBookings, "Your bookings fetched successfully")
    );
});

/*----------------------------------------------
   📤 EXPORT (bottom as you prefer)
----------------------------------------------*/
export {
    getAvailableVenues,
    createBooking,
    cancelBooking,
    getAllBookings,
    getMyBookings
};