import storeMetricsSchema from "../models/store-metrics.js";

export const getStoreMetrics = async (shop: string) => {
  return storeMetricsSchema.findOne({ shop: shop });
};
