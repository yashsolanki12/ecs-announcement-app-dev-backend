import { Router } from "express";
import { announcementValidationSchema } from "../validation/announcement.js";
import { validate } from "../middleware/validate.js";
import { validateShopifyHeader } from "../middleware/auth.js";
import {
  createAnnouncement,
  deleteAnnouncementData,
  getAnnouncementById,
  getCurrentShopifySessionId,
  listAnnouncement,
  updateAnnouncementData,
} from "../controllers/announcement.js";

const router = Router();

router.use(validateShopifyHeader);

// Shopify session
router.get("/session/current_shop", getCurrentShopifySessionId);

// Create
router.post("/add", validate(announcementValidationSchema), createAnnouncement);

// Update
router.put(
  "/:id",
  validate(announcementValidationSchema),
  updateAnnouncementData,
);

// List
router.get("/", listAnnouncement);

// Detail
router.get("/:id", getAnnouncementById);

// Delete
router.delete("/:id", deleteAnnouncementData);

export default router;
