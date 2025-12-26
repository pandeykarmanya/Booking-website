// src/seed/seedVenues.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { Venue } from "../models/venue.model.js";
import { FIXED_VENUES } from "../constants/venues.js";

dotenv.config({ path: path.resolve("../../.env") });

const seedVenues = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✅ MongoDB connected");

    for (const venue of FIXED_VENUES) {
      await Venue.updateOne(
        { name: venue.name },
        { $setOnInsert: venue },
        { upsert: true }
      );
    }

    console.log("✅ Venues seeded successfully");
    process.exit();
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
};

seedVenues();