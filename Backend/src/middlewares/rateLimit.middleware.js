import { ApiError } from "../utils/ApiError.js";

const stores = new Map();

export const createRateLimiter = ({ keyPrefix, windowMs, maxRequests, message }) => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || "unknown";
    const key = `${keyPrefix}:${ip}`;
    const now = Date.now();

    const current = stores.get(key);
    if (!current || current.expiresAt <= now) {
      stores.set(key, {
        count: 1,
        expiresAt: now + windowMs,
      });
      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      return next(new ApiError(429, message));
    }

    return next();
  };
};
