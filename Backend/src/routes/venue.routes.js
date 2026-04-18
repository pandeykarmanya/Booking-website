import express from "express";
import { 
    addVenue, 
    getVenues, 
    deleteVenue
 } from "../controllers/venue.controller.js";

const router = express.Router();

router.post("/", addVenue);
router.get("/", getVenues);
router.delete("/:id", deleteVenue);

export default router;
