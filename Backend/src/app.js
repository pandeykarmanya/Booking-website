import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();

// ✅ CORS (VERY IMPORTANT FOR COOKIES)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173" || "http://pandeykarmanya-booking-website69.vercel.app", 
    credentials: true, 
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  })
);

// ✅ Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser()); // ⭐ REQUIRED FOR READING COOKIES

// ✅ Routes
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import bookingRoutes from "./routes/booking.routes.js";
import venueRoutes from "./routes/venue.routes.js";


app.use("/api/v1/booking", bookingRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/venues", venueRoutes);

app.use(errorHandler);

export default app;
