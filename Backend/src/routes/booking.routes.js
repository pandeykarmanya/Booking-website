import express from "express";
import {
    getAvailableVenues,
    createBooking,
    cancelBooking,
    getAllBookings,
    getMyBookings
} from "../controllers/booking.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

// USER ROUTES
router.get("/check-availability", authMiddleware, getAvailableVenues); // Changed to GET
router.post("/create", authMiddleware, createBooking);
router.get("/my-bookings", authMiddleware, getMyBookings);
router.put("/cancel/:bookingId", authMiddleware, cancelBooking); // Changed to PUT

// ADMIN ROUTES
router.get("/all", authMiddleware, adminMiddleware, getAllBookings);

export default router;