import express from "express";
import { addVenue, getVenues } from "../controllers/venue.controller.js";
import { authMiddleware, authorizeRoles } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", authMiddleware, authorizeRoles("admin"), addVenue);
router.get("/", getVenues);

export default router;