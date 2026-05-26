import express from "express";
import { getSyncStoreMetrics, syncStoreMetrics } from "../controllers/store-metrics.js";

const storeMetricsRouter = express.Router();

// Create store metrics
storeMetricsRouter.post("/sync", syncStoreMetrics);

// Get store metrics
storeMetricsRouter.get("/sync-metrics/:shop", getSyncStoreMetrics);

export default storeMetricsRouter;
