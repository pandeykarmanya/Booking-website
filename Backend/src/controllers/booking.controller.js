import { Booking } from "../models/booking.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// USER BOOKS AUDITORIUM
export const createBooking = asyncHandler(async (req, res) => {
    const { date, startTime, endTime } = req.body;
    const userId = req.user._id;

    if (!date || !startTime || !endTime) {
        throw new ApiError(400, "All fields are required");
    }

    // Check overlapping booking
    const exists = await Booking.findOne({
        date,
        status: "booked",
        $or: [
            { startTime: { $lt: endTime }, endTime: { $gt: startTime } }
        ]
    });

    if (exists) {
        throw new ApiError(400, "Auditorium already booked for this time slot");
    }

    const booking = await Booking.create({
        user: userId,
        date,
        startTime,
        endTime
    });

    return res.status(201).json(
        new ApiResponse(201, booking, "Auditorium booked successfully")
    );
});

// ADMIN / USER CAN CANCEL
export const cancelBooking = asyncHandler(async (req, res) => {
    const { bookingId } = req.params;

    const booking = await Booking.findById(bookingId);
    if (!booking) throw new ApiError(404, "Booking not found");

    // Users can cancel only their own booking
    // Admin can cancel anything
    if (req.user.role !== "admin" && booking.user.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not allowed to cancel this booking");
    }

    booking.status = "cancelled";
    await booking.save();

    return res.status(200).json(
        new ApiResponse(200, booking, "Booking cancelled")
    );
});

// ADMIN GET ALL BOOKINGS
export const getAllBookings = asyncHandler(async (req, res) => {
    const bookings = await Booking.find().populate("user", "name email");
    return res.status(200).json(
        new ApiResponse(200, bookings, "All bookings fetched")
    );
});

// USER GET THEIR BOOKINGS
export const getMyBookings = asyncHandler(async (req, res) => {
    const myBookings = await Booking.find({ user: req.user._id });
    return res.status(200).json(
        new ApiResponse(200, myBookings, "Your bookings fetched")
    );
});