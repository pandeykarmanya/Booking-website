import express from "express";
import {
    getAvailableVenues,
    createBooking,
    cancelBooking,
    getAllBookings,
    getMyBookings,
    getTodayBookings,
    getUpcomingBookings,
} from "../controllers/booking.controller.js";

import { authMiddleware } from "../middlewares/auth.middleware.js";
import { adminMiddleware } from "../middlewares/admin.middleware.js";

const router = express.Router();

// USER ROUTES
router.get("/check-availability", authMiddleware, getAvailableVenues); 
router.post("/create", authMiddleware, createBooking);
router.get("/my-bookings", authMiddleware, getMyBookings);
router.patch("/cancel/:bookingId", authMiddleware, cancelBooking); 
router.delete("/delete/:bookingId", authMiddleware, cancelBooking);
router.get("/today", authMiddleware, getTodayBookings);

// ADMIN ROUTES
router.get("/all", authMiddleware, adminMiddleware, getAllBookings);
router.get("/upcoming", getUpcomingBookings);

export default router;