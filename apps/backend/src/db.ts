import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/cross_brand";
export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI);
    console.log(`[DATABASE] MongoDB Conectat: ${conn.connection.host}`);
  } catch (error) {
    console.error(
      `[DATABASE] Eroare de conectare: ${error instanceof Error ? error.message : "Eroare necunoscută"}`,
    );
    process.exit(1);
  }
};
