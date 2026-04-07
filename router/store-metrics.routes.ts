import express from "express";
import { syncStoreMetrics } from "../controllers/store-metrics";

const storeMetricsRouter = express.Router();
storeMetricsRouter.post("/sync", syncStoreMetrics);

export default storeMetricsRouter;
