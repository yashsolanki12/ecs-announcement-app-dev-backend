import { Schema, model } from "mongoose";
const storeMetricsSchema = new Schema({
    shop: { type: String, required: true, unique: true },
    view_count: { type: Number, default: 0 },
    last_reset_month: { type: String, required: true },
    plan_name: { type: String, default: "No Plan" },
}, {
    collection: "store_metrics",
    timestamps: true,
});
export default model("StoreMetrics", storeMetricsSchema);
//# sourceMappingURL=store-metrics.js.map