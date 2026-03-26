import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as announcementService from "../services/announcement.js";
import shopifySession from "../models/shopify-sessions.js";
import mongoose from "mongoose";
// Get current shopify_session_id
export const getCurrentShopifySessionId = asyncHandler(async (req, res) => {
    const shopDomain = req.headers["x-shopify-shop-domain"];
    console.log("🔑 getCurrentShopifySessionId - Shop domain:", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    console.log("🔍 Session document found:", sessionDoc ? "Yes" : "No");
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    console.log("✅ Session found successfully");
    return res.json(new ApiResponse(true, "Shopify session retrieved successfully.", sessionDoc));
});
// Create
export const createAnnouncement = asyncHandler(async (req, res) => {
    const { announcement_name, title, subheading, shopify_session_id } = req.body;
    if (!announcement_name || !title || !shopify_session_id) {
        throw new AppError("Announcement name, Title and shopify_session_id is required.", StatusCode.BAD_REQUEST);
    }
    const response = await announcementService.createAnnouncement({
        announcement_name,
        title,
        subheading,
        shopify_session_id,
    });
    if (!response) {
        throw new AppError("Failed to create new announcement.", StatusCode.BAD_REQUEST);
    }
    if (response) {
        res
            .status(StatusCode.CREATED)
            .json(new ApiResponse(true, "Announcement created successfully.", response));
    }
});
// Update
export const updateAnnouncementData = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const { announcement_name, title, subheading } = req.body;
    if (!announcement_name || !title) {
        throw new AppError("Announcement name, Title is required.", StatusCode.BAD_REQUEST);
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }
    const payload = {
        announcement_name: announcement_name,
        title: title,
        subheading: subheading,
    };
    const response = await announcementService.updateAnnouncement(id, payload);
    if (!response) {
        throw new AppError("Announcement not found.", StatusCode.NOT_FOUND);
    }
    if (response) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Announcement updated successfully.", response));
    }
});
// List
export const listAnnouncement = asyncHandler(async (_req, res) => {
    const shopDomain = res.req.headers["x-shopify-shop-domain"];
    console.log("📱 Get all usp slider - Shop Domain", shopDomain);
    if (!shopDomain) {
        throw new AppError("Missing shop domain header.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop: shopDomain });
    console.log("Session found for all USP Bar 🔎", sessionDoc ? "Yes" : "No");
    if (!sessionDoc || !sessionDoc._id) {
        throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }
    const response = await announcementService.getAllAnnouncement({
        shopify_session_id: sessionDoc._id,
    });
    if (!response || response.length === 0) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(false, "No announcement found.", []));
    }
    if (response) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Announcement retrieved successfully.", response));
    }
});
// Detail
export const getAnnouncementById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }
    const response = await announcementService.getAnnouncementById(id);
    if (!response) {
        throw new AppError("Announcement not found.", StatusCode.NOT_FOUND);
    }
    if (response) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Announcement retrieved successfully", response));
    }
});
// Delete
export const deleteAnnouncementData = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }
    const response = await announcementService.deleteAnnouncement(id);
    if (!response) {
        throw new AppError("Announcement not found.", StatusCode.NOT_FOUND);
    }
    if (response) {
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Announcement deleted successfully.", response));
    }
});
// Handle GET, POST, DELETE for /api/phone/offline_{shop}
export const handleOfflineSession = asyncHandler(async (req, res) => {
    const shopParam = Array.isArray(req.params.shop)
        ? req.params.shop[0]
        : req.params.shop;
    const shop = shopParam?.replace(/^offline_/, "");
    if (!shop) {
        throw new AppError("Missing shop domain in URL.", StatusCode.BAD_REQUEST);
    }
    if (req.method === "GET") {
        // Find session by shop domain
        const session = await shopifySession.findOne({ shop });
        if (!session) {
            throw new AppError("Session not found.", StatusCode.NOT_FOUND);
        }
        return res.status(StatusCode.OK).json(session);
    }
    else if (req.method === "POST") {
        // Upsert session by shop domain
        const data = req.body;
        if (!data || !data.id || !data.shop) {
            throw new AppError("Missing session data (id, shop).", StatusCode.BAD_REQUEST);
        }
        const updated = await shopifySession.findOneAndUpdate({ shop: data.shop }, { $set: data }, { upsert: true, returnDocument: "after" });
        return res.status(StatusCode.OK).json(updated);
    }
    else if (req.method === "DELETE") {
        // Delete session by shop domain
        const deleted = await shopifySession.findOneAndDelete({ shop });
        if (!deleted) {
            throw new AppError("Session not found to delete.", StatusCode.NOT_FOUND);
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Session deleted.", deleted));
    }
    else {
        throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
});
// Handle GET, POST, DELETE for /api/phone/:id (Shopify session storage)
export const handleSessionById = asyncHandler(async (req, res) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    // Only handle if id is NOT a valid ObjectId (to avoid conflict with phone routes)
    if (mongoose.Types.ObjectId.isValid(id)) {
        throw new AppError("Not a session id route.", StatusCode.BAD_REQUEST);
    }
    if (req.method === "GET") {
        const session = await shopifySession.findOne({ id });
        if (!session) {
            throw new AppError("Session not found.", StatusCode.NOT_FOUND);
        }
        return res.status(StatusCode.OK).json(session);
    }
    else if (req.method === "POST") {
        const data = req.body;
        if (!data || !data.id || !data.shop) {
            throw new AppError("Missing session data (id, shop).", StatusCode.BAD_REQUEST);
        }
        const updated = await shopifySession.findOneAndUpdate({ id: data.id }, { $set: data }, { upsert: true, returnDocument: "after" });
        return res.status(StatusCode.OK).json(updated);
    }
    else if (req.method === "DELETE") {
        const deleted = await shopifySession.findOneAndDelete({ id });
        if (!deleted) {
            throw new AppError("Session not found to delete.", StatusCode.NOT_FOUND);
        }
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "Session deleted.", deleted));
    }
    else {
        throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
});
// This function runs in the background and only needs the 'shop' domain.
export const uninstallCleanupBackground = async (shop) => {
    try {
        // No apiKey check needed here as it's an internal background process.
        if (!shop) {
            console.warn("[uninstallCleanupBackground] Missing shop domain.");
            return;
        }
        // Perform your database operations:
        const sessionDoc = await mongoose.connection
            .collection("shopify_sessions")
            .findOne({ shop });
        if (!sessionDoc) {
            console.log(`[uninstallCleanupBackground] No session found for shop: ${shop}`);
            return;
        }
        await mongoose.connection
            .collection("shopify_sessions")
            .updateOne({ shop }, { $set: { accessToken: null } });
        await mongoose.connection.collection("store_metrics").deleteOne({ shop });
        console.log(`[uninstallCleanupBackground] Access token nulled for shop: ${shop}`);
    }
    catch (error) {
        console.error("❌ Error in uninstallCleanupBackground:", error);
    }
};
// Uninstall cleanup: set accessToken to null for a shop instead of deleting records
export const uninstallCleanup = asyncHandler(async (req, res) => {
    const apiKey = req.headers["x-api-key"];
    if (apiKey !== process.env.BACKEND_API_KEY) {
        console.warn("⚠️ Unauthorized uninstallCleanup attempt from IP:", req.ip);
        throw new AppError("Unauthorized", StatusCode.UNAUTHORIZED);
    }
    const { shop } = req.body;
    if (!shop) {
        throw new AppError("Missing shop domain.", StatusCode.BAD_REQUEST);
    }
    // Find the session for this shop
    const sessionDoc = await mongoose.connection
        .collection("shopify_sessions")
        .findOne({ shop });
    if (!sessionDoc) {
        console.log(`[uninstallCleanup] No session found for shop: ${shop}`);
        return res
            .status(StatusCode.OK)
            .json(new ApiResponse(true, "No session to update."));
    }
    // Update only the accessToken to null to persist other data
    await mongoose.connection
        .collection("shopify_sessions")
        .updateOne({ shop }, { $set: { accessToken: null } });
    await mongoose.connection.collection("store_metrics").deleteOne({ shop });
    console.log(`[uninstallCleanup] Access token nulled for shop: ${shop}`);
    return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session access token preserved as null.", sessionDoc));
});
//# sourceMappingURL=announcement.js.map