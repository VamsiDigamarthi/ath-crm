import { z } from "zod";

export const applicationInvoiceSchema = z.object({
  params: z.object({ applicationId: z.string().uuid("Invalid application id") }),
});
