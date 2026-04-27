import { isNonEmptyString } from "../utils/validation.js";

export const validateVenueCreate = (req) => {
  const { name, capacity } = req.body;

  return [
    !isNonEmptyString(name) && "Venue name is required",
    capacity !== undefined &&
      capacity !== null &&
      (Number.isNaN(Number(capacity)) || Number(capacity) < 0) &&
      "Capacity must be a non-negative number",
  ];
};

export const validateVenueStatusUpdate = (req) => {
  const { status } = req.body;

  return [!isNonEmptyString(status) && "Status is required"];
};
