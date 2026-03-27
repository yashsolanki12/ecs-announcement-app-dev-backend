import { Router } from "express";
import { announcementValidationSchema } from "../validation/announcement.js";
import { validate } from "../middleware/validate.js";
import { validateShopifyHeader } from "../middleware/auth.js";
import { bulkDeleteAnnouncement, bulkToggleAnnouncement, createAnnouncement, deleteAnnouncementData, duplicateAnnouncement, getAnnouncementById, getCurrentShopifySessionId, listAnnouncement, toggleAnnouncement, updateAnnouncementData, } from "../controllers/announcement.js";
const router = Router();
router.use(validateShopifyHeader);
// Shopify session
router.get("/session/current_shop", getCurrentShopifySessionId);
// Create
router.post("/add", validate(announcementValidationSchema), createAnnouncement);
// Update
router.put("/:id", validate(announcementValidationSchema), updateAnnouncementData);
// List
router.get("/", listAnnouncement);
// Detail
router.get("/:id", getAnnouncementById);
// Delete
router.delete("/:id", deleteAnnouncementData);
// Toggle announcement
router.patch("/toggle/:id", toggleAnnouncement);
// Duplicate announcement
router.post("/duplicate/:id", duplicateAnnouncement);
// Bulk operations
router.post("/bulk-delete", bulkDeleteAnnouncement);
router.post("/bulk-toggle", bulkToggleAnnouncement);
export default router;
//# sourceMappingURL=announcement.routes.js.map