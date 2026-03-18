import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import connectDB from "../config/db.js";
import Admin from "../models/Admin.js";

const seedAdmin = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({ username: process.env.ADMIN_USERNAME });

    if (existing) {
      console.log("Admin already exists");
      await mongoose.connection.close();
      process.exit(0);
    }

    await Admin.create({
      name: process.env.ADMIN_NAME,
      username: process.env.ADMIN_USERNAME,
      password: process.env.ADMIN_PASSWORD,
    });

    console.log("Admin seeded successfully");
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
};

seedAdmin();