import { asyncHandler } from "../utils/async-handler.js";
import { AppError } from "../utils/app-error.js";
import { StatusCode } from "../utils/status-code.js";
import { ApiResponse } from "../utils/api-response.js";
import StoreMetrics from "../models/store-metrics.js";
import mongoose from "mongoose";
import * as storeMetricsService from "../services/store-metrics.js";
// Fetch or Update Store Metrics
export const syncStoreMetrics = asyncHandler(async (req, res) => {
    const { shop, plan_name } = req.body;
    if (!shop || !plan_name) {
        throw new AppError("Shop and planName are required.", StatusCode.BAD_REQUEST);
    }
    const currentMonth = new Date().toISOString().slice(0, 7); // e.g., 2026-03
    let metrics = await StoreMetrics.findOne({ shop });
    if (!metrics) {
        metrics = new StoreMetrics({
            shop,
            // view_count: 0,
            last_reset_month: currentMonth,
            plan_name,
        });
        await metrics.save();
    }
    else {
        let changed = false;
        // Reset if it's a new month
        if (metrics.last_reset_month !== currentMonth) {
            // metrics.view_count = 0;
            metrics.last_reset_month = currentMonth;
            changed = true;
        }
        // Update planName if it has changed
        if (metrics.plan_name !== plan_name) {
            metrics.plan_name = plan_name;
            changed = true;
        }
        if (changed) {
            await metrics.save();
        }
    }
    // Calculate limit based on plan name
    let limit = 1000;
    if (metrics.plan_name.toLowerCase().includes("plan 1")) {
        limit = 2500;
    }
    else if (metrics.plan_name.toLowerCase().includes("standard plan")) {
        limit = -1; // Unlimited
    }
    else {
        limit = 1000;
    }
    if (limit !== -1 && metrics.view_count >= limit) {
        throw new AppError(`You have reached the ${limit} monthly view limit for ${plan_name} plan. Please upgrade your plan to continue.`, StatusCode.TOO_MANY_REQUESTS);
    }
    return res.status(StatusCode.OK).json(new ApiResponse(true, "Store metrics retrieved.", {
        shop: metrics.shop,
        views_count: metrics.view_count,
        last_reset_month: metrics.last_reset_month,
        plan_name: metrics.plan_name,
        limit,
    }));
});
// Get current plan
export const getSyncStoreMetrics = asyncHandler(async (_req, res, next) => {
    try {
        // Get shop domain header
        const shopDomain = res.req.headers["x-shopify-shop-domain"];
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
        const getSyncData = await storeMetricsService.getStoreMetrics(shopDomain);
        if (!getSyncData) {
            return res
                .status(StatusCode.NOT_FOUND)
                .json(new ApiResponse(false, "No store metrics found."));
        }
        if (getSyncData) {
            return res
                .status(StatusCode.OK)
                .json(new ApiResponse(true, "Sync store metrics fetched successfully", getSyncData));
        }
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=store-metrics.js.map