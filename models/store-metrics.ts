import { Schema, model } from "mongoose";
import { StoreMetrics } from "../types/store-metrics.types";

const storeMetricsSchema = new Schema<StoreMetrics>(
  {
    shop: { type: String, required: true, unique: true },
    view_count: { type: Number, default: 0 },
    last_reset_month: { type: String, required: true },
    plan_name: { type: String, default: "Free" },
  },
  {
    collection: "store_metrics",
    timestamps: true,
  },
);

export default model<StoreMetrics>("StoreMetrics", storeMetricsSchema);
