import mongoose from "mongoose";
import { MongoDBConnectionProps } from "../types/db.types.js";

export async function connectDB(config: MongoDBConnectionProps): Promise<void> {
  try {
    const response = await mongoose.connect(config.url, {
      dbName: config.dbName,
    });
    if (response) {
      console.log("Connected with MongoDB 🛢️");
    }
  } catch (error: any) {
    console.log("Failed to connect with MongoDB", error);
    process.exit(1);
  }
}
