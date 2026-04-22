// @ts-nocheck
import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const uri =
      process.env.MONGODB_URI ||
      process.env.MONGO_URI ||
      process.env.DATABASE_URL;

    if (!uri) {
      throw new Error("MongoDB URI missing");
    }

    await mongoose.connect(uri);

    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};
