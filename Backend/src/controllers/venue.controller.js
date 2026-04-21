import { Venue } from "../models/venue.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";      
import { ApiResponse } from "../utils/ApiResponse.js"; 

const normalizeVenueStatus = (status) => {
  const statusMap = {
    active: "available",
    available: "available",
    maintenance: "under_maintenance",
    under_maintenance: "under_maintenance",
  };

  return statusMap[status];
};

// Add Venue
const addVenue = async (req, res) => {
  try {
    const { name, location, capacity } = req.body; 

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: "Venue name is required" });
    }

    const existing = await Venue.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ success: false, message: "Venue already exists" });
    }

    const venue = await Venue.create({ 
      name: name.trim(),
      location: location?.trim() || "" ,
      capacity: capacity ? Number(capacity) : 0
    });

    res.status(201).json({ success: true, message: "Venue added successfully", venue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Venues
const getVenues = async (req, res) => {
  try {
    const venues = await Venue.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: venues.length, venues });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Venue
const deleteVenue = async (req, res) => {
  try {
    const { id } = req.params;
    const venue = await Venue.findByIdAndDelete(id);
    if (!venue) {
      return res.status(404).json({ success: false, message: "Venue not found" });
    }
    res.status(200).json({ success: true, message: "Venue deleted successfully", venue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Venue Status (available / under_maintenance)
const updateVenueStatus = asyncHandler(async (req, res) => {
  const { venueId } = req.params;
  const { status, statusReason = "", expectedAvailableDate } = req.body;
  const normalizedStatus = normalizeVenueStatus(status);

  if (!normalizedStatus) {
    throw new ApiError(400, "Invalid status");
  }

  const update = {
    status: normalizedStatus,
    statusUpdatedAt: new Date(),
    statusReason: normalizedStatus === "under_maintenance" ? statusReason.trim() : "",
    expectedAvailableDate:
      normalizedStatus === "under_maintenance" && expectedAvailableDate
        ? expectedAvailableDate
        : null,
  };

  const venue = await Venue.findByIdAndUpdate(venueId, update, {
    new: true,
    runValidators: true,
  });
  if (!venue) throw new ApiError(404, "Venue not found");

  return res.status(200).json(
    new ApiResponse(200, venue, "Venue status updated successfully")
  );
});

export { 
  addVenue, 
  getVenues, 
  deleteVenue, 
  updateVenueStatus 
};
