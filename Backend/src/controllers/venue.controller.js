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
const addVenue = asyncHandler(async (req, res) => {
  const { name, location, capacity } = req.body;

  const existing = await Venue.findOne({ name: name.trim() });
  if (existing) {
    throw new ApiError(400, "Venue already exists");
  }

  const venue = await Venue.create({
    name: name.trim(),
    location: location?.trim() || "",
    capacity: capacity ? Number(capacity) : 0,
  });

  return res.status(201).json(
    new ApiResponse(201, venue, "Venue added successfully")
  );
});

// Get All Venues
const getVenues = asyncHandler(async (req, res) => {
  const venues = await Venue.find().sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(200, { venues, count: venues.length }, "Venues fetched successfully")
  );
});

// Delete Venue
const deleteVenue = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const venue = await Venue.findByIdAndDelete(id);

  if (!venue) {
    throw new ApiError(404, "Venue not found");
  }

  return res.status(200).json(
    new ApiResponse(200, venue, "Venue deleted successfully")
  );
});

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
