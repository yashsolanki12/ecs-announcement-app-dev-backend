import { Announcement } from "../types/announcement.types.js";
import { Schema, model } from "mongoose";

const announcementSchema = new Schema<Announcement>({
  announcement_name: { type: String, required: true },
  title: { type: String, required: true },
  subheading: { type: String, required: false },
  shopify_session_id: {
    type: Schema.Types.ObjectId,
    ref: "ShopifySession",
    required: true,
  },
});

export const AnnouncementNotify = model<Announcement>(
  "AnnouncementNotify",
  announcementSchema,
);
