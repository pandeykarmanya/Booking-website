import express from "express";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";
import { createBooking, cancelBooking, getAllBookings, getMyBookings } from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/book", authMiddleware, createBooking);
router.get("/my-bookings", authMiddleware, getMyBookings);

router.delete("/cancel/:bookingId", authMiddleware, cancelBooking);

router.get("/all", authMiddleware, authorizeRoles("admin"), getAllBookings);

export default router;