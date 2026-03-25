import express from "express";
import dotenv from "dotenv";
import { homePageHtml } from "./utils/home-page.js";
import { connectDB } from "./config/db.js";
const app = express();
dotenv.config({ path: [".env"] });
app.get("/", (_req, res) => {
    res.send(homePageHtml);
});
// Database connection
const mongoDbUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
if (!mongoDbUrl || !dbName) {
    throw new Error("Missing MongoDB connection environment variables.");
}
connectDB({ url: mongoDbUrl, dbName: dbName });
export default app;
//# sourceMappingURL=app.js.map