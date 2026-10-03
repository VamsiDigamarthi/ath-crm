import { z } from "zod";

const applicationParam = z.object({ applicationId: z.string().uuid("Invalid application id") });
const itemParams = applicationParam.extend({ itemId: z.string().uuid("Invalid item id") });

const price = z.coerce
  .number({ message: "Price must be a number" })
  .min(0, "Price cannot be negative")
  .max(1000000, "Price cannot exceed 1,000,000")
  .refine((v) => Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Price can have at most 2 decimals");

const quantity = z.coerce
  .number({ message: "Quantity must be a number" })
  .int("Quantity must be a whole number")
  .min(1, "Quantity must be at least 1")
  .max(999, "Quantity cannot exceed 999");

export const listReturnItemsSchema = z.object({ params: applicationParam });

export const addReturnItemSchema = z.object({
  params: applicationParam,
  body: z.object({
    productId: z.string().uuid("Select an item"),
    quantity: quantity.optional(),
  }),
});

export const updateReturnItemSchema = z.object({
  params: itemParams,
  body: z
    .object({ quantity: quantity.optional(), unitPrice: price.optional() })
    .refine((b) => b.quantity !== undefined || b.unitPrice !== undefined, "Nothing to update"),
});

export const deleteReturnItemSchema = z.object({ params: itemParams });
