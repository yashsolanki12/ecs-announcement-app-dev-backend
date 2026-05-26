import storeMetricsSchema from "../models/store-metrics.js";
export const getStoreMetrics = async (shop) => {
    return storeMetricsSchema.findOne({ shop: shop });
};
//# sourceMappingURL=store-metrics.js.map