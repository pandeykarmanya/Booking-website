import { isNonEmptyString, isValidObjectId, isValidTime } from "../utils/validation.js";

export const validateAvailabilityQuery = (req) => {
  const { date, startTime, endTime } = req.query;

  return [
    !isNonEmptyString(date) && "Date is required",
    !isValidTime(startTime) && "startTime must be in HH:MM format",
    !isValidTime(endTime) && "endTime must be in HH:MM format",
  ];
};

export const validateCreateBooking = (req) => {
  const { venue, date, startTime, endTime } = req.body;

  return [
    !isValidObjectId(venue) && "Valid venue id is required",
    !isNonEmptyString(date) && "Date is required",
    !isValidTime(startTime) && "startTime must be in HH:MM format",
    !isValidTime(endTime) && "endTime must be in HH:MM format",
  ];
};
