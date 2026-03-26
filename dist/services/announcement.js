import { AnnouncementNotify } from "../models/announcement.js";
import mongoose from "mongoose";
// Create announcement
export const createAnnouncement = async (data) => {
    return await AnnouncementNotify.create({
        announcement_name: data.announcement_name,
        title: data.title,
        subheading: data.subheading,
        shopify_session_id: data.shopify_session_id,
    });
};
// Get all announcement
export const getAllAnnouncement = async (filter = {}) => {
    const mongoFilter = { ...filter };
    if (mongoFilter.shopify_session_id) {
        mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id);
    }
    return await AnnouncementNotify.find(mongoFilter);
};
// Get announcement by id;
export const getAnnouncementById = async (id) => {
    return await AnnouncementNotify.findById(id);
};
// Update announcement
export const updateAnnouncement = async (id, data) => {
    const updateData = {
        announcement_name: data.announcement_name,
        title: data.title,
        subheading: data.subheading,
    };
    return await AnnouncementNotify.findByIdAndUpdate(id, updateData, {
        new: true,
    });
};
// Delete announcement
export const deleteAnnouncement = async (id) => {
    return await AnnouncementNotify.findByIdAndDelete(id);
};
//# sourceMappingURL=announcement.js.map