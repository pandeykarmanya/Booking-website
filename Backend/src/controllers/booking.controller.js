import { Booking } from "../models/booking.model.js";
import { Venue } from "../models/venue.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

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
    const { date, startTime, endTime } = req.query;

    if (!date || !startTime || !endTime) {
        throw new ApiError(400, "Date, startTime and endTime are required");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    const bookingDate = new Date(date);

    // Get all confirmed bookings on same date
    const bookings = await Booking.find({
        date: bookingDate,
        status: "confirmed"
    });

    const unavailableVenueIds = new Set();

    bookings.forEach((b) => {
        const bookStart = timeToMinutes(b.startTime);
        const bookEnd = timeToMinutes(b.endTime);

        if (isOverlapping(reqStart, reqEnd, bookStart, bookEnd)) {
            unavailableVenueIds.add(b.venue.toString());
        }
    });

    // Get all venues from DB
    const allVenues = await Venue.find();

    // Filter available venues
    const availableVenues = allVenues.filter(
        v => !unavailableVenueIds.has(v._id.toString())
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            {
                date,
                startTime,
                endTime,
                availableVenues
            },
            "Available venues fetched successfully"
        )
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

    // ✅ Validate venue from DB
    const venueExists = await Venue.findById(venue);
    if (!venueExists) {
        throw new ApiError(400, "Venue not found");
    }

    const reqStart = timeToMinutes(startTime);
    const reqEnd = timeToMinutes(endTime);

    if (reqEnd <= reqStart) {
        throw new ApiError(400, "End time must be greater than start time");
    }

    const bookingDate = new Date(date);

    // Check overlapping bookings
    const exists = await Booking.findOne({
        venue,
        date: bookingDate,
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
        date: bookingDate,
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
    const bookings = await Booking.find()
        .populate("user", "name email")
        .populate("venue", "name location capacity");

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
    })
        .populate("venue", "name location")
        .sort({ date: -1 });

    return res.status(200).json(
        new ApiResponse(200, myBookings, "Your bookings fetched successfully")
    );
});

/*----------------------------------------------
   📤 EXPORT
----------------------------------------------*/
export {
    getAvailableVenues,
    createBooking,
    cancelBooking,
    getAllBookings,
    getMyBookings
};