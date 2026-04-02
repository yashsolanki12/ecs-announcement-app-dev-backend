import { Document, Types } from "mongoose";

export interface Announcement extends Document {
  announcement_name: string;
  title: string;
  subheading: string;
  shopify_session_id?: Types.ObjectId;
  announcement_type: string;
  icon?: string;
  icon_color?: string;
  marquee_direction?: string;
  marquee_speed?: number;
  cta_type?: string; // Call to action
  cta_link?: string;
  cta_text?: string;
  start_datetime?: string;
  end_datetime?: string;
  has_end_date?: boolean;
  position?: string;
  enabled: boolean;
  title_size?: number;
  title_color?: string;
  subheading_size?: number;
  subheading_color?: string;
  background_type?: string;
  background_color?: string;
  button_font_size?: number;
  button_text_color?: string;
  button_background_color?: string;
  button_border_style?: string;
  button_border_color?: string;
  gradient_colors?: string[];
  background_image?: string;
  template_id?: string;
  announcements?: any[];
  arrow_icon_color?: string;
  sticky_bar?: boolean;
  page_display?: string[];
}
