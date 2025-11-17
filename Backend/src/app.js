import express from 'express'; 
import cors from 'cors';

const app = express();
app.use(cors(
    {
    origin: process.env.CORS_ORIGIN
}
)); // enable CORS for all routes

app.use(express.json())
app.use(express.urlencoded({ extended: true, limit: '16kb' }))
app.use(express.static('public'))

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import adminRoutes from "./routes/admin.routes.js";
import bookingRoutes from "./routes/booking.routes.js";

app.use("/api/v1/bookings", bookingRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/admin", adminRoutes);
app.use("/api/v1/users", userRoutes); 

export default app;