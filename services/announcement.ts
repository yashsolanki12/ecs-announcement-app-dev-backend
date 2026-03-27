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
  });
};

// Get all announcement
export const getAllAnnouncement = async (
  filter: Partial<Announcement | null> = {},
): Promise<Announcement[]> => {
  const mongoFilter: any = { ...filter };
  if (mongoFilter.shopify_session_id) {
    mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(
      mongoFilter.shopify_session_id as any,
    );
  }
  if (mongoFilter.enabled === true) {
    mongoFilter.$or = [{ enabled: true }, { enabled: { $exists: false } }];
    delete mongoFilter.enabled;
  }

  return await AnnouncementNotify.find(mongoFilter);
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
    "title" | "subheading" | "announcement_name" | "page_display"
  > & {
    enabled?: boolean;
  },
): Promise<Announcement | null> => {
  const updateData: any = {
    announcement_name: data.announcement_name,
    title: data.title,
    subheading: data.subheading,
  };

  if (data.enabled !== undefined) {
    updateData.enabled = data.enabled;
  }

  if (data.page_display) {
    updateData.page_display = data.page_display;
  }

  return await AnnouncementNotify.findByIdAndUpdate(id, updateData, {
    new: true,
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

// Delete announcement
export const deleteAnnouncement = async (
  id: string,
): Promise<Announcement | null> => {
  return await AnnouncementNotify.findByIdAndDelete(id);
};
