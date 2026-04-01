import { z } from "zod";
export const announcementValidationSchema = z.object({
    body: z.object({
        announcement_name: z
            .string()
            .min(1, { message: "Announcement name is required." })
            .max(30, {
            message: "Announcement name must be 30 characters or less.",
        }),
        title: z
            .string()
            .min(1, { message: "Title is required." }),
        // .max(30, { message: "Title must be 30 characters or less." }),
        subheading: z.string().optional(),
    }),
});
//# sourceMappingURL=announcement.js.map