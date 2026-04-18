import { Venue } from "../models/venue.model.js";

const addVenue = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Venue name is required",
      });
    }

    const existing = await Venue.findOne({ name: name.trim() });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: "Venue already exists",
      });
    }

    const venue = await Venue.create({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: "Venue added successfully",
      venue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All Venues
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: venues.length,
      venues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete Venue
const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;

    const venue = await Venue.findByIdAndDelete(id);

    if (!venue) {
      return res.status(404).json({
        success: false,
        message: "Venue not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Venue deleted successfully",
      venue,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addVenue, getVenues, deleteVenue };
