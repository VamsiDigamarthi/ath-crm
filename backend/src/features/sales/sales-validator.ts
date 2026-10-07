import { z } from "zod";

const optionalEmail = z.string().trim().email("Enter a valid email address").max(254).optional().or(z.literal(""));

export const sendForm8879Schema = z.object({
  params: z.object({ id: z.string().uuid("Invalid application id") }),
  body: z.object({
    primaryEmail: optionalEmail,
    secondaryEmail: optionalEmail,
    sendToPrimary: z.boolean().optional(),
    sendToSecondary: z.boolean().optional(),
    emailedByStaff: z.boolean().optional(),
  }),
});
