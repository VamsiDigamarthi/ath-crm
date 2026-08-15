import { z } from "zod";

export const registerAdminSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email format").optional(),
    mobile: z.string().regex(/^[0-9]{10,15}$/, "Invalid mobile number format").optional(),
  }).refine((data) => data.email || data.mobile, {
    message: "Either email or mobile number must be provided",
    path: ["email"],
  }),
});
