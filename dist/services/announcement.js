import { AnnouncementNotify } from "../models/announcement.js";
import mongoose from "mongoose";
// Create announcement
export const createAnnouncement = async (data) => {
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
export const getAllAnnouncement = async (filter = {}) => {
    const { search, sortOrder, ...restFilter } = filter;
    const mongoFilter = { ...restFilter };
    if (mongoFilter.shopify_session_id) {
        mongoFilter.shopify_session_id = new mongoose.Types.ObjectId(mongoFilter.shopify_session_id);
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
        }
        else {
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
export const toggleEnabled = async (id) => {
    const item = await AnnouncementNotify.findById(id);
    if (!item)
        return null;
    return await AnnouncementNotify.findByIdAndUpdate(id, { enabled: !item.enabled }, { new: true });
};
// Delete announcement
export const deleteAnnouncement = async (id) => {
    return await AnnouncementNotify.findByIdAndDelete(id);
};
//# sourceMappingURL=announcement.js.map