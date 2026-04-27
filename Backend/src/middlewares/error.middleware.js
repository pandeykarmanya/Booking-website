import { ApiError } from "../utils/ApiError.js";

export const errorHandler = (err, req, res, next) => {
  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  const message =
    statusCode >= 500 ? "Internal server error" : err.message || "Request failed";

  if (statusCode >= 500) {
    console.error("Unhandled error:", err);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.error || [],
  });
};
