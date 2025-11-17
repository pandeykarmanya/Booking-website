// src/middlewares/auth.middleware.js
import jwt from "jsonwebtoken";

// Auth middleware (already defined)
export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ message: "No Authorization header provided" });

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer")
      return res.status(401).json({ message: "Invalid Authorization header format. Use: Bearer <token>" });

    const token = parts[1];
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    req.user = decoded; // Attach user info (id, role, etc.)
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return res.status(401).json({ message: "Token has expired. Please login again." });
    if (err.name === "JsonWebTokenError")
      return res.status(401).json({ message: "Invalid token. Please login again." });

    return res.status(500).json({ message: "Server error verifying token", error: err.message });
  }
};

// New: Role-based authorization middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user)
      return res.status(401).json({ message: "Unauthorized. No user info found." });

    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden. You don't have permission to access this resource." });

    next();
  };
};