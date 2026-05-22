import mongoose from "mongoose";
import { env } from "./env";

export async function connectToDatabase() {
  mongoose.set("autoIndex", env.NODE_ENV !== "production");

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      family: 4,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown MongoDB connection failure";
    throw new Error(
      `Failed to connect to MongoDB. Check MONGODB_URI, Atlas Network Access, and database credentials. Original error: ${message}`,
    );
  }
}
