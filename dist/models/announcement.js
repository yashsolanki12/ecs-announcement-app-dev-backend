import { Schema, model } from "mongoose";
const announcementSchema = new Schema({
    announcement_name: { type: String, required: true },
    title: { type: String, required: true },
    subheading: { type: String, required: false },
    enabled: { type: Boolean, default: true },
    page_display: { type: [String], default: ["all"] },
    shopify_session_id: {
        type: Schema.Types.ObjectId,
        ref: "ShopifySession",
        required: true,
    },
}, { timestamps: true });
export const AnnouncementNotify = model("AnnouncementNotify", announcementSchema);
//# sourceMappingURL=announcement.js.map