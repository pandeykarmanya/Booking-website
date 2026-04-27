import express from "express";
import { 
    addVenue, 
    getVenues, 
    deleteVenue,
    updateVenueStatus
 } from "../controllers/venue.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";   // ✅ add
import { adminMiddleware } from "../middlewares/admin.middleware.js"; 
import { validateRequest } from "../middlewares/validation.middleware.js";
import {
  validateVenueCreate,
  validateVenueStatusUpdate,
} from "../validators/venue.validators.js";

const router = express.Router();

router.post("/", authMiddleware, adminMiddleware, validateRequest(validateVenueCreate), addVenue);
router.get("/", getVenues);
router.delete("/:id", authMiddleware, adminMiddleware, deleteVenue);
router.patch("/:venueId/status", authMiddleware, adminMiddleware, validateRequest(validateVenueStatusUpdate), updateVenueStatus);

export default router;
