import { ApiError } from "../utils/ApiError.js";

export const validateRequest = (validator) => {
  return (req, res, next) => {
    const errors = validator(req).filter(Boolean);

    if (errors.length > 0) {
      return next(new ApiError(400, "Validation failed", errors));
    }

    return next();
  };
};
