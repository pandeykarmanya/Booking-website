import express from "express";
import {
    getAdminRequests,
    handleAdminRequest,
} from "../controllers/admin.controller.js";
import { 
    getFilteredBookings,
    downloadBookingsPDF
 } from "../controllers/booking.controller.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/requests", authMiddleware, authorizeRoles("admin"), getAdminRequests);
router.get("/bookings", authMiddleware, authorizeRoles("admin"), getFilteredBookings);
router.get("/bookings/download-pdf", authMiddleware, authorizeRoles("admin"), downloadBookingsPDF);
router.post("/handle-request/:userId",
    authMiddleware,
    authorizeRoles("admin"),
    handleAdminRequest
);

export default router;
