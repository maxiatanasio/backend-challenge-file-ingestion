import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/data-reader";
const MONGO_USER = process.env.MONGO_USER || "data-reader-user";
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || "data-reader-password";
const DB_NAME = process.env.DB_NAME || "data-reader";

console.log("MONGO_URI", MONGO_URI);
console.log("MONGO_USER", MONGO_USER);
console.log("MONGO_PASSWORD", MONGO_PASSWORD);
console.log("DB_NAME", DB_NAME);

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      user: MONGO_USER,
      pass: MONGO_PASSWORD,
      dbName: DB_NAME,
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};
