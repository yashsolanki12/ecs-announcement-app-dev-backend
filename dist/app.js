import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { homePageHtml } from "./utils/home-page.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import announcementRoutes from "./router/announcement.routes.js";
import cookieParser from "cookie-parser";
import { isAllowedOrigin } from "./utils/allowed-origin.js";
const app = express();
dotenv.config({ path: [".env"] });
app.get("/", (_req, res) => {
    res.send(homePageHtml);
});
app.use((req, _res, next) => {
    console.log(`[Global log] ${req.method} ${req.url}`);
    next();
});
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Cors for Development & Production use
app.use(cors({
    origin: (origin, callback) => {
        const reqMethod = typeof this !== "undefined" &&
            this &&
            this.req &&
            this.req.method
            ? this.req.method
            : undefined;
        if (isAllowedOrigin(origin, reqMethod)) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"), false);
        }
    },
    credentials: true,
    allowedHeaders: [
        "Content-Type",
        "x-shopify-shop-domain",
        "Accept",
        "Origin",
        "X-Requested-With",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
}));
// Announcement routes
app.use("/api/announcement", announcementRoutes);
// Global error handler
app.use(errorHandler);
// Database connection
const mongoDbUrl = process.env.MONGO_URL;
const dbName = process.env.DB_NAME;
if (!mongoDbUrl || !dbName) {
    throw new Error("Missing MongoDB connection environment variables.");
}
connectDB({ url: mongoDbUrl, dbName: dbName });
export default app;
//# sourceMappingURL=app.js.map