import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import crypto from "crypto";
import mongoose from "mongoose";
import announcementRoutes from "./router/announcement.routes.js";
import shopifyAuthRoutes from "./router/shopify-auth.routes.js";
import cookieParser from "cookie-parser";
import { homePageHtml } from "./utils/home-page.js";
import { connectDB } from "./config/db.js";
import { errorHandler } from "./middleware/error-handler.js";
import { isAllowedOrigin } from "./utils/allowed-origin.js";
import { uninstallCleanup } from "./controllers/announcement.js";
import { StatusCode } from "./utils/status-code.js";
import { ApiResponse } from "./utils/api-response.js";

const app = express();
dotenv.config({ path: [".env"] });

app.get("/", (_req, res) => {
  res.send(homePageHtml);
});

app.use((req: any, _res, next) => {
  console.log(`[Global log] ${req.method} ${req.url}`);
  next();
});

// Generate HMAC which use when submit the app
app.post(
  "/api/utils/generate-hmac",
  express.raw({ type: "application/json" }),
  (req, res) => {
    const secret = process.env.SHOPIFY_API_SECRET?.trim();
    if (!secret) {
      return res
        .status(StatusCode.UNAUTHORIZED)
        .json(new ApiResponse(false, "Webhook HMAC validation failed"));
    }
    const body = req.body; // This is a Buffer, just like in /api/shopify/webhook
    const digest = crypto
      .createHmac("sha256", secret)
      .update(body, "utf8")
      .digest("base64");
    res.json({ hmac: digest });
  },
);

// Use this while Automated checks for common errors for HMAC and Uninstallation of App(✔)
app.post(
  "/api/shopify/webhook",
  express.raw({ type: "*/*" }), // Capture EVERYTHING to be safe
  async (req: any, res, next) => {
    const topic = req.get("X-Shopify-Topic");
    const hmacHeader = req.get("X-Shopify-Hmac-Sha256");
    const shopHeader = req.get("X-Shopify-Shop-Domain");

    console.log(`[Webhook] Topic: ${topic}, Shop: ${shopHeader}`);

    const rawSecret = process.env.SHOPIFY_API_SECRET?.trim() || "";
    // Remove literal quotes if present
    const cleanSecret = rawSecret.replace(/^["']|["']$/g, "");

    if (!cleanSecret) {
      console.error("[Webhook] SHOPIFY_API_SECRET is missing!");
      return res
        .status(500)
        .json({ success: false, message: "Missing Secret" });
    }

    const body = req.body;
    if (!body || body.length === 0) {
      console.error("[Webhook] Body length is 0. Middleware issue?");
      return res.status(400).json({ success: false, message: "Empty Body" });
    }

    // Diagnostics: Log secret structure
    const maskedSecret =
      cleanSecret.substring(0, 15) +
      "..." +
      cleanSecret.substring(cleanSecret.length - 4);
    console.log(
      `[Webhook] Secret Structure: "${maskedSecret}" (Length: ${cleanSecret.length})`,
    );

    // Check for common typo (Index 17 is the 18th character)
    if (cleanSecret.length >= 18 && cleanSecret[17] === "0") {
      console.warn(
        "[Webhook] ⚠️ WARNING: 18th character is '0'. Typo check needed!",
      );
    }

    // Try all possible interpretations
    const variants = [
      cleanSecret, // Exact
      cleanSecret.replace("shpss_", ""), // No prefix
    ];

    let verified = false;
    // let fallbackHmac = "";

    for (const secret of variants) {
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("base64");
      if (hmac === hmacHeader) {
        verified = true;
        break;
      }
      // fallbackHmac = hmac;
    }

    if (!verified) {
      console.error(`[Webhook] HMAC MISMATCH!`);
      console.error(
        `[Webhook] Calculated 1 (Exact): ${crypto.createHmac("sha256", cleanSecret).update(body).digest("base64")}`,
      );
      console.error(`[Webhook] Received Header: ${hmacHeader}`);
      return res
        .status(401)
        .json(new ApiResponse(false, "HMAC validation failed"));
    }

    console.log("[Webhook] ✅ HMAC Verified Successfully!");

    try {
      const payload = JSON.parse(body.toString());
      const shop = shopHeader || payload.myshopify_domain || payload.shop;

      if (topic === "app/uninstalled") {
        console.log(`[Webhook] Processing uninstall for: ${shop}`);
        req.headers["x-api-key"] = process.env.BACKEND_API_KEY;
        req.body = { shop };
        await uninstallCleanup(req, res, next);
        return;
      }
    } catch (e) {
      console.error("[Webhook] Parse error:", e);
    }
    res.status(StatusCode.OK).json(new ApiResponse(true, "Received"));
  },
);

app.use(cookieParser());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true }));

// Cors for Development & Production use
app.use(
  cors({
    origin: (origin, callback) => {
      const reqMethod =
        typeof this !== "undefined" &&
        this &&
        (this as any).req &&
        (this as any).req.method
          ? (this as any).req.method
          : undefined;
      if (isAllowedOrigin(origin, reqMethod)) {
        callback(null, true);
      } else {
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
  }),
);

// Announcement routes
app.use("/api/announcement", announcementRoutes);

// Cron job to disable announcements when end_datetime passes
const checkAndDisableExpiredAnnouncements = async () => {
  try {
    const now = new Date();
    const result = await mongoose.connection
      .collection("announcement_notifies")
      .updateMany(
        {
          has_end_date: true,
          enabled: true,
          $and: [
            { end_datetime: { $exists: true, $ne: "" } },
            { end_datetime: { $lt: now.toISOString() } },
          ],
        },
        { $set: { enabled: false } },
      );
    if (result.modifiedCount > 0) {
      console.log(
        `[Cron] Disabled ${result.modifiedCount} expired announcement(s)`,
      );
    }
  } catch (error) {
    console.error("[Cron] Error disabling expired announcements:", error);
  }
};

// Run every minute
setInterval(checkAndDisableExpiredAnnouncements, 60 * 1000);

// Routes for shopify authentication
app.use("/api/shopify", shopifyAuthRoutes);

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
