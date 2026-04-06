import { AnnouncementNotify } from "../models/announcement.js";
import { Announcement } from "../types/announcement.types.js";
import mongoose from "mongoose";

// Create announcement
export const createAnnouncement = async (
  data: Pick<
    Announcement,
    | "title"
    | "subheading"
    | "announcement_name"
    | "shopify_session_id"
    | "page_display"
    | "announcement_type"
    | "icon"
    | "marquee_direction"
    | "marquee_speed"
    | "cta_type"
    | "cta_link"
    | "cta_text"
    | "start_datetime"
    | "end_datetime"
    | "has_end_date"
    | "icon_color"
    | "position"
    | "title_size"
    | "title_color"
    | "subheading_size"
    | "subheading_color"
    | "background_type"
    | "background_color"
    | "button_font_size"
    | "button_text_color"
    | "button_background_color"
    | "button_border_style"
    | "button_border_color"
    | "gradient_colors"
    | "template_id"
    | "background_image"
    | "announcements"
    | "arrow_icon_color"
    | "sticky_bar"
  > & {
    enabled?: boolean;
  },
): Promise<Announcement> => {
  return await AnnouncementNotify.create({
    announcement_name: data.announcement_name,
    title: data.title,
    subheading: data.subheading,
    shopify_session_id: data.shopify_session_id,
    enabled: data.enabled ?? true,
    page_display: data.page_display,
    announcement_type: data.announcement_type,
    icon: data.icon,
    marquee_direction: data.marquee_direction,
    marquee_speed: data.marquee_speed,
    cta_type: data.cta_type,
    cta_link: data.cta_link,
    cta_text: data.cta_text,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
    has_end_date: data.has_end_date,
    icon_color: data.icon_color,
    position: data.position,
    title_size: data.title_size,
    title_color: data.title_color,
    subheading_size: data.subheading_size,
    subheading_color: data.subheading_color,
    background_type: data.background_type,
    background_color: data.background_color,
    button_font_size: data.button_font_size,
    button_text_color: data.button_text_color,
    button_background_color: data.button_background_color,
    button_border_style: data.button_border_style,
    button_border_color: data.button_border_color,
    gradient_colors: data.gradient_colors,
    template_id: data.template_id,
    background_image: data.background_image,
    announcements: data.announcements,
    arrow_icon_color: data.arrow_icon_color,
    sticky_bar: data.sticky_bar,
  });
};

// Get all announcement
export const getAllAnnouncement = async (
  filter: Partial<Announcement> & {
    search?: string;
    sortOrder?: "asc" | "desc";
  } = {},
): Promise<Announcement[]> => {
  const { search, sortOrder, ...restFilter } = filter;
  const mongoFilter: any = { ...restFilter };

  if (mongoFilter.shopify_session_id) {
    mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(
      mongoFilter.shopify_session_id as any,
    );
  }
  if (mongoFilter.enabled === true) {
    mongoFilter.$or = [{ enabled: true }, { enabled: { $exists: false } }];
    delete mongoFilter.enabled;
  }

  if (search) {
    const searchCriteria = {
      $or: [
        { announcement_name: { $regex: search, $options: "i" } },
        { title: { $regex: search, $options: "i" } },
      ],
    };

    if (mongoFilter.$or) {
      mongoFilter.$and = [{ $or: mongoFilter.$or }, searchCriteria];
      delete mongoFilter.$or;
    } else {
      Object.assign(mongoFilter, searchCriteria);
    }
  }

  let query = AnnouncementNotify.find(mongoFilter);

  // Sort by createdAt by default - desc = oldest first, asc = newest first
  if (sortOrder === "asc" || sortOrder === "desc") {
    query = query.sort({ createdAt: sortOrder === "desc" ? 1 : -1 });
  }

  return await query;
};

// Get announcement by id;
export const getAnnouncementById = async (
  id: string,
): Promise<Announcement | null> => {
  return await AnnouncementNotify.findById(id);
};

// Update announcement
export const updateAnnouncement = async (
  id: string,
  data: Pick<
    Announcement,
    | "title"
    | "subheading"
    | "announcement_name"
    | "page_display"
    | "announcement_type"
    | "icon"
    | "marquee_direction"
    | "marquee_speed"
    | "cta_type"
    | "cta_link"
    | "cta_text"
    | "start_datetime"
    | "end_datetime"
    | "has_end_date"
    | "icon_color"
    | "position"
    | "title_size"
    | "title_color"
    | "subheading_size"
    | "subheading_color"
    | "background_type"
    | "background_color"
    | "button_font_size"
    | "button_text_color"
    | "button_background_color"
    | "button_border_style"
    | "button_border_color"
    | "gradient_colors"
    | "template_id"
    | "background_image"
    | "announcements"
    | "arrow_icon_color"
    | "sticky_bar"
  > & {
    enabled?: boolean;
  },
): Promise<Announcement | null> => {
  const updateData: any = {
    announcement_name: data.announcement_name,
    title: data.title,
    subheading: data.subheading,
    announcement_type: data.announcement_type,
    icon: data.icon,
    marquee_direction: data.marquee_direction,
    marquee_speed: data.marquee_speed,
    cta_type: data.cta_type,
    cta_link: data.cta_link,
    cta_text: data.cta_text,
    start_datetime: data.start_datetime,
    end_datetime: data.end_datetime,
    has_end_date: data.has_end_date,
    icon_color: data.icon_color,
    position: data.position,
    title_size: data.title_size,
    title_color: data.title_color,
    subheading_size: data.subheading_size,
    subheading_color: data.subheading_color,
    background_type: data.background_type,
    background_color: data.background_color,
    button_font_size: data.button_font_size,
    button_text_color: data.button_text_color,
    button_background_color: data.button_background_color,
    button_border_style: data.button_border_style,
    button_border_color: data.button_border_color,
    gradient_colors: data.gradient_colors,
    template_id: data.template_id,
    background_image: data.background_image,
    announcements: data.announcements,
    arrow_icon_color: data.arrow_icon_color,
    sticky_bar: data.sticky_bar,
  };

  if (data.enabled !== undefined) {
    updateData.enabled = data.enabled;
  }

  if (data.page_display) {
    updateData.page_display = data.page_display;
  }

  return await AnnouncementNotify.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  });
};

// Toggle enabled status
export const toggleEnabled = async (
  id: string,
): Promise<Announcement | null> => {
  const item = await AnnouncementNotify.findById(id);
  if (!item) return null;

  return await AnnouncementNotify.findByIdAndUpdate(
    id,
    { enabled: !item.enabled },
    { new: true },
  );
};

// Update enabled status only
export const updateEnabledStatus = async (
  id: string,
  enabled: boolean,
): Promise<Announcement | null> => {
  return await AnnouncementNotify.findByIdAndUpdate(
    id,
    { enabled },
    { new: true },
  );
};

// Delete announcement
export const deleteAnnouncement = async (
  id: string,
): Promise<Announcement | null> => {
  return await AnnouncementNotify.findByIdAndDelete(id);
};
