import { Document, Types } from "mongoose";

export interface Announcement extends Document {
  announcement_name: string;
  title: string;
  subheading: string;
  shopify_session_id?: Types.ObjectId;
  enabled: boolean;
  page_display?: string[];
}
