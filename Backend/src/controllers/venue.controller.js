import { Venue } from "../models/venue.model.js";

// ➕ Add Venue (Admin only)
export const addVenue = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Venue name is required"
      });
    }

    // 🚫 Prevent duplicate
    const existing = await Venue.findOne({ name });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Venue already exists"
      });
    }

    const venue = await Venue.create({ name });

    res.status(201).json({
      success: true,
      message: "Venue added successfully",
      venue
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// 📥 Get All Venues
export const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: venues.length,
      venues
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};