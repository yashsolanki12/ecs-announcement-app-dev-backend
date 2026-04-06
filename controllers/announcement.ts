import { Request, Response } from "express";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import * as announcementService from "../services/announcement.js";
import shopifySession from "../models/shopify-sessions.js";
import mongoose from "mongoose";
import { AnnouncementNotify } from "../models/announcement.js";

// Get current shopify_session_id
export const getCurrentShopifySessionId = asyncHandler(
  async (req: Request, res: Response) => {
    const shopDomain = req.headers["x-shopify-shop-domain"] as string;
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
    return res.json(
      new ApiResponse(
        true,
        "Shopify session retrieved successfully.",
        sessionDoc,
      ),
    );
  },
);

// Create
export const createAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const {
      announcement_name,
      title,
      subheading,
      shopify_session_id,
      page_display,
      announcement_type,
      icon,
      icon_color,
      marquee_direction,
      marquee_speed,
      cta_type,
      cta_link,
      cta_text,
      start_datetime,
      end_datetime,
      has_end_date,
      position,
      title_size,
      title_color,
      subheading_size,
      subheading_color,
      background_type,
      background_color,
      button_font_size,
      button_text_color,
      button_background_color,
      button_border_style,
      button_border_color,
      gradient_colors,
      template_id,
      background_image,
      announcements,
      arrow_icon_color,
      sticky_bar,
    } = req.body;

    if (!announcement_name || !title || !shopify_session_id) {
      throw new AppError(
        "Announcement name, Title and shopify_session_id is required.",
        StatusCode.BAD_REQUEST,
      );
    }

    const response = await announcementService.createAnnouncement({
      announcement_name,
      title,
      subheading,
      shopify_session_id,
      enabled: true, // Always set to true on creation
      page_display,
      announcement_type,
      icon,
      icon_color,
      marquee_direction,
      marquee_speed,
      cta_type,
      cta_link,
      cta_text,
      start_datetime,
      end_datetime,
      has_end_date,
      position,
      title_size,
      title_color,
      subheading_size,
      subheading_color,
      background_type,
      background_color,
      button_font_size,
      button_text_color,
      button_background_color,
      button_border_style,
      button_border_color,
      gradient_colors,
      template_id,
      background_image,
      announcements,
      arrow_icon_color,
      sticky_bar,
    });

    if (!response) {
      throw new AppError(
        "Failed to create new announcement.",
        StatusCode.BAD_REQUEST,
      );
    }
    if (response) {
      res
        .status(StatusCode.CREATED)
        .json(
          new ApiResponse(true, "Announcement created successfully.", response),
        );
    }
  },
);

// Update
export const updateAnnouncementData = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const {
      announcement_name,
      title,
      subheading,
      enabled,
      page_display,
      announcement_type,
      icon,
      icon_color,
      marquee_direction,
      marquee_speed,
      cta_type,
      cta_link,
      cta_text,
      start_datetime,
      end_datetime,
      has_end_date,
      position,
      title_size,
      title_color,
      subheading_size,
      subheading_color,
      background_type,
      background_color,
      button_font_size,
      button_text_color,
      button_background_color,
      button_border_style,
      button_border_color,
      gradient_colors,
      template_id,
      background_image,
      announcements,
      arrow_icon_color,
      sticky_bar,
    } = req.body;

    if (!announcement_name || !title) {
      throw new AppError(
        "Announcement name, Title is required.",
        StatusCode.BAD_REQUEST,
      );
    }
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }

    const payload = {
      announcement_name: announcement_name,
      title: title,
      subheading: subheading,
      enabled: enabled,
      page_display: page_display,
      announcement_type: announcement_type,
      icon: icon,
      icon_color: icon_color,
      marquee_direction: marquee_direction,
      marquee_speed: marquee_speed,
      cta_type: cta_type,
      cta_link: cta_link,
      cta_text: cta_text,
      start_datetime: start_datetime,
      end_datetime: end_datetime,
      has_end_date: has_end_date,
      position: position,
      title_size: title_size,
      title_color: title_color,
      subheading_size: subheading_size,
      subheading_color: subheading_color,
      background_type: background_type,
      background_color: background_color,
      button_font_size: button_font_size,
      button_text_color: button_text_color,
      button_background_color: button_background_color,
      button_border_style: button_border_style,
      button_border_color: button_border_color,
      gradient_colors: gradient_colors,
      template_id: template_id,
      background_image: background_image,
      announcements: announcements,
      arrow_icon_color: arrow_icon_color,
      sticky_bar: sticky_bar,
    };
    const response = await announcementService.updateAnnouncement(id, payload);

    if (!response) {
      throw new AppError("Announcement not found.", StatusCode.NOT_FOUND);
    }
    if (response) {
      return res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(true, "Announcement updated successfully.", response),
        );
    }
  },
);

// List
export const publicListAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const shopParam = Array.isArray(req.params.shop)
      ? req.params.shop[0]
      : req.params.shop;
    let shop = shopParam;
    if (!shop.includes(".myshopify.com")) {
      shop = `${shop}.myshopify.com`;
    }
    const { search, sortOrder } = req.query as any;
    console.log("📱 Get all usp slider - Shop Domain", shopParam);

    // Find the session for this shop
    const sessionDoc = await mongoose.connection
      .collection("shopify_sessions")
      .findOne({ shop });

    console.log("Session found for all USP Bar 🔎", sessionDoc ? "Yes" : "No");

    if (!sessionDoc || !sessionDoc._id) {
      throw new AppError("Session not found.", StatusCode.NOT_FOUND);
    }

    const filter: any = {
      shopify_session_id: sessionDoc._id,
    };

    // Add search if provided
    if (search) {
      filter.search = search as string;
    }
    // sortOrder: "desc" = newest first, "asc" = oldest first (sorts by createdAt)
    if (sortOrder === "desc" || sortOrder === "asc") {
      filter.sortOrder = sortOrder;
    }

    const now = new Date();
    const nowTimestamp = now.getTime();

    let response = await announcementService.getAllAnnouncement(filter);

    // Check and update expired announcements
    for (const announcement of response) {
      if (announcement.has_end_date && announcement.end_datetime) {
        const endTimestamp = new Date(announcement.end_datetime).getTime();
        if (nowTimestamp > endTimestamp && announcement.enabled) {
          await announcementService.updateEnabledStatus(announcement._id.toString(), false);
        }
      }
    }

    // Filter by start_datetime only (don't hide expired ones - they show as enabled:false)
    response = response.filter((announcement) => {
      const start = announcement.start_datetime
        ? new Date(announcement.start_datetime).getTime()
        : null;
      const isValidStart = !start || nowTimestamp >= start;
      return isValidStart;
    });

    if (!response || response.length === 0) {
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(false, "No announcement found.", []));
    }
    if (response) {
      return res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(
            true,
            "Announcement retrieved successfully.",
            response,
          ),
        );
    }
  },
);

// List (for admin dashboard)
export const listAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const shopDomain = res.req.headers["x-shopify-shop-domain"] as string;
    const { search, sortOrder } = req.query as any;
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

    const filter: any = {
      shopify_session_id: sessionDoc._id,
    };

    // Add search if provided
    if (search) {
      filter.search = search as string;
    }
    // sortOrder: "desc" = newest first, "asc" = oldest first (sorts by createdAt)
    if (sortOrder === "desc" || sortOrder === "asc") {
      filter.sortOrder = sortOrder;
    }

    let response = await announcementService.getAllAnnouncement(filter);

    const now = new Date();
    const nowTimestamp = now.getTime();

    // Check and update expired announcements
    for (const announcement of response) {
      if (announcement.has_end_date && announcement.end_datetime) {
        const endTimestamp = new Date(announcement.end_datetime).getTime();
        if (nowTimestamp > endTimestamp && announcement.enabled) {
          await announcementService.updateEnabledStatus(announcement._id.toString(), false);
        }
      }
    }

    // Filter by start_datetime only (don't hide expired ones - they show as enabled:false)
    response = response.filter((announcement) => {
      const start = announcement.start_datetime
        ? new Date(announcement.start_datetime).getTime()
        : null;
      const isValidStart = !start || nowTimestamp >= start;
      return isValidStart;
    });

    if (!response || response.length === 0) {
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(false, "No announcement found.", []));
    }
    if (response) {
      return res
        .status(StatusCode.OK)
        .json(
          new ApiResponse(
            true,
            "Announcement retrieved successfully.",
            response,
          ),
        );
    }
  },
);

// Detail
export const getAnnouncementById = asyncHandler(
  async (req: Request, res: Response) => {
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
        .json(
          new ApiResponse(
            true,
            "Announcement retrieved successfully",
            response,
          ),
        );
    }
  },
);

// Delete
export const deleteAnnouncementData = asyncHandler(
  async (req: Request, res: Response) => {
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
        .json(
          new ApiResponse(true, "Announcement deleted successfully.", response),
        );
    }
  },
);

// Toggle enabled status
export const toggleAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }

    const response = await announcementService.toggleEnabled(id);

    if (!response) {
      throw new AppError("Announcement not found.", StatusCode.NOT_FOUND);
    }

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          `Announcement ${response.enabled ? "enabled" : "disabled"} successfully.`,
          response,
        ),
      );
  },
);

// Duplicate data api
export const duplicateAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid id format.", StatusCode.BAD_REQUEST);
    }

    const originalItem = await announcementService.getAnnouncementById(id);
    if (!originalItem) {
      throw new AppError("Announcement not found.", StatusCode.BAD_REQUEST);
    }

    // Convert this mongoose document to plain js object
    const newItemData = originalItem.toObject();

    // Get the shopify_session_id from the original item
    if (!originalItem.shopify_session_id) {
      throw new AppError(
        "Shopify session ID not found.",
        StatusCode.BAD_REQUEST,
      );
    }
    const shopify_session_id = originalItem.shopify_session_id.toString();

    // Limit check - block duplicates if already at 10 or more bars (for ALL users)
    const count = await AnnouncementNotify.countDocuments({
      shopify_session_id: new mongoose.Types.ObjectId(shopify_session_id),
    });
    console.log(
      `🔍 Duplicate check: Current count is ${count} for session ${shopify_session_id}`,
    );

    if (count >= 10) {
      console.log(
        `🚫 BLOCKING duplicate creation - limit of 10 announcement reached (current: ${count})`,
      );
      throw new AppError(
        "Limit of 10 announcement reached. You cannot create more than 10 announcement.",
        StatusCode.FORBIDDEN,
      );
    }

    // Remove the _id field to allow MongoDB to generate a new one
    delete newItemData._id;
    delete newItemData.__v;

    // Modify other fields for the duplicate
    newItemData.announcement_name = `Copy of ${newItemData.announcement_name}`;
    newItemData.enabled = true;

    // Create a new Mongoose model instance with the new data
    const duplicatedItem = await AnnouncementNotify.create(newItemData);

    return res
      .status(StatusCode.CREATED)
      .json(
        new ApiResponse(
          true,
          "Announcement duplicated successfully.",
          duplicatedItem,
        ),
      );
  },
);

// Bulk delete USP bars
export const bulkDeleteAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError(
        "No IDs provided for deletion.",
        StatusCode.BAD_REQUEST,
      );
    }

    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(
        `Invalid IDs: ${invalidIds.join(", ")}`,
        StatusCode.BAD_REQUEST,
      );
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const result = await AnnouncementNotify.deleteMany({
      _id: { $in: objectIds },
    });

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          `${result.deletedCount} Announcement(s) deleted successfully.`,
          { deletedCount: result.deletedCount },
        ),
      );
  },
);

// Bulk toggle USP bars (enable or disable)
export const bulkToggleAnnouncement = asyncHandler(
  async (req: Request, res: Response) => {
    const { ids, enabled } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      throw new AppError("No IDs provided for toggle.", StatusCode.BAD_REQUEST);
    }

    if (typeof enabled !== "boolean") {
      throw new AppError(
        "Enabled status must be a boolean.",
        StatusCode.BAD_REQUEST,
      );
    }

    // Validate all IDs
    const invalidIds = ids.filter((id) => !mongoose.Types.ObjectId.isValid(id));
    if (invalidIds.length > 0) {
      throw new AppError(
        `Invalid IDs: ${invalidIds.join(", ")}`,
        StatusCode.BAD_REQUEST,
      );
    }

    const objectIds = ids.map((id) => new mongoose.Types.ObjectId(id));
    const result = await AnnouncementNotify.updateMany(
      { _id: { $in: objectIds } },
      { $set: { enabled } },
    );

    return res
      .status(StatusCode.OK)
      .json(
        new ApiResponse(
          true,
          `${result.modifiedCount} Announcement(s) ${enabled ? "enabled" : "disabled"} successfully.`,
          { modifiedCount: result.modifiedCount },
        ),
      );
  },
);

// Handle GET, POST, DELETE for /api/phone/offline_{shop}
export const handleOfflineSession = asyncHandler(
  async (req: Request, res: Response) => {
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
    } else if (req.method === "POST") {
      // Upsert session by shop domain
      const data = req.body;
      if (!data || !data.id || !data.shop) {
        throw new AppError(
          "Missing session data (id, shop).",
          StatusCode.BAD_REQUEST,
        );
      }
      const updated = await shopifySession.findOneAndUpdate(
        { shop: data.shop },
        { $set: data },
        { upsert: true, returnDocument: "after" },
      );
      return res.status(StatusCode.OK).json(updated);
    } else if (req.method === "DELETE") {
      // Delete session by shop domain
      const deleted = await shopifySession.findOneAndDelete({ shop });
      if (!deleted) {
        throw new AppError(
          "Session not found to delete.",
          StatusCode.NOT_FOUND,
        );
      }
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session deleted.", deleted));
    } else {
      throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
  },
);

// Handle GET, POST, DELETE for /api/phone/:id (Shopify session storage)
export const handleSessionById = asyncHandler(
  async (req: Request, res: Response) => {
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
    } else if (req.method === "POST") {
      const data = req.body;
      if (!data || !data.id || !data.shop) {
        throw new AppError(
          "Missing session data (id, shop).",
          StatusCode.BAD_REQUEST,
        );
      }
      const updated = await shopifySession.findOneAndUpdate(
        { id: data.id },
        { $set: data },
        { upsert: true, returnDocument: "after" },
      );
      return res.status(StatusCode.OK).json(updated);
    } else if (req.method === "DELETE") {
      const deleted = await shopifySession.findOneAndDelete({ id });
      if (!deleted) {
        throw new AppError(
          "Session not found to delete.",
          StatusCode.NOT_FOUND,
        );
      }
      return res
        .status(StatusCode.OK)
        .json(new ApiResponse(true, "Session deleted.", deleted));
    } else {
      throw new AppError("Unsupported method.", StatusCode.BAD_REQUEST);
    }
  },
);

// This function runs in the background and only needs the 'shop' domain.
export const uninstallCleanupBackground = async (shop: any) => {
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
      console.log(
        `[uninstallCleanupBackground] No session found for shop: ${shop}`,
      );
      return;
    }
    await mongoose.connection
      .collection("shopify_sessions")
      .updateOne({ shop }, { $set: { accessToken: null } });
    await mongoose.connection.collection("store_metrics").deleteOne({ shop });
    console.log(
      `[uninstallCleanupBackground] Access token nulled for shop: ${shop}`,
    );
  } catch (error) {
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
    .json(
      new ApiResponse(
        true,
        "Session access token preserved as null.",
        sessionDoc,
      ),
    );
});
