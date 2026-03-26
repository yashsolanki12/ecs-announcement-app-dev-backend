import { Schema, model } from "mongoose";
import { ShopifySession } from "../types/shopify-session.types.js";

const shopifySessionSchema = new Schema<ShopifySession>(
  {
    id: String,
    shop: String,
    state: String,
    isOnline: String,
    scope: String,
    accessToken: String,
  },
  {
    collection: "shopify_sessions",
  },
);

export default model<ShopifySession>("ShopifySession", shopifySessionSchema);