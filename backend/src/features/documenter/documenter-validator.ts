import { z } from "zod";

export const changeTaxYearSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid application id") }),
  body: z.object({
    taxYear: z.coerce
      .number({ message: "Tax year must be a number" })
      .int("Tax year must be a whole number")
      .min(2000, "Tax year is too old")
      .max(new Date().getFullYear() + 2, "Tax year is too far in the future"),
  }),
});
