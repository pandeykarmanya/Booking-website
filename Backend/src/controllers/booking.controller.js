import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { FIXED_VENUES } from "../constants/venues.js";

// USER BOOKS AUDITORIUM (AUTO CONFIRM)
const createBooking = asyncHandler(async (req, res) => {
    const { venue, date, startTime, endTime } = req.body;
    const userId = req.user._id;

    // Validate fields
    if (!venue || !date || !startTime || !endTime) {
        throw new ApiError(400, "All fields are required");
    }

    // Validate venue exists (from FIXED_VENUES list)
    const selectedVenue = FIXED_VENUES.find(v => v.id === venue);
    if (!selectedVenue) {
        throw new ApiError(400, "Invalid venue selected");
    }

    // Check overlapping booking (only for this venue)
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

    // Create booking (AUTO-CONFIRMED)
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


// ADMIN / USER CAN CANCEL
const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

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


// ADMIN GET ALL BOOKINGS
const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate("user", "name email");

    return res.status(200).json(
        new ApiResponse(200, bookings, "All bookings fetched successfully")
    );
});


// USER GET THEIR BOOKINGS
const getMyBookings = asyncHandler(async (req, res) => {
    const myBookings = await Booking.find({
        user: req.user._id
    }).sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, myBookings, "Your bookings fetched successfully")
    );
});


// ✅ EXPORT ALL AT BOTTOM (as you prefer)
export {
    createBooking,
    cancelBooking,
    getAllBookings,
    getMyBookings
};