import { z } from "zod";

const noHtml = (v: string) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v);

export const PRODUCT_UNITS = ["PER_RETURN", "PER_FORM", "PER_STATE", "PER_HOUR", "PER_ITEM", "FIXED"] as const;
export const PRODUCT_TAX_TYPES = ["NO_TAX", "VAT_10"] as const;
export const PRODUCT_STATUSES = ["ACTIVE", "INACTIVE"] as const;

const productBody = z.object({
  name: z
    .string({ message: "Item name is required" })
    .trim()
    .min(2, "Item name must be at least 2 characters")
    .max(100, "Item name cannot exceed 100 characters")
    .refine(noHtml, "HTML tags are not allowed"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .refine(noHtml, "HTML tags are not allowed")
    .optional()
    .nullable(),
  price: z.coerce
    .number({ message: "Price must be a number" })
    .min(0, "Price cannot be negative")
    .max(1000000, "Price cannot exceed 1,000,000")
    .refine((v) => Number.isInteger(Math.round(v * 100)) && Math.abs(v * 100 - Math.round(v * 100)) < 1e-6, "Price can have at most 2 decimals"),
  unit: z.enum(PRODUCT_UNITS, { message: "Select a valid unit" }),
  taxType: z.enum(PRODUCT_TAX_TYPES, { message: "Select a valid tax option" }),
  status: z.enum(PRODUCT_STATUSES, { message: "Select a valid status" }),
});

export const createProductSchema = z.object({
  body: productBody,
});

export const updateProductSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid product id") }),
  body: productBody,
});

export const updateProductStatusSchema = z.object({
  params: z.object({ id: z.string().uuid("Invalid product id") }),
  body: z.object({ status: z.enum(PRODUCT_STATUSES, { message: "Select a valid status" }) }),
});

export const listProductsSchema = z.object({
  query: z.object({
    search: z.string().trim().max(100).optional(),
    status: z.enum([...PRODUCT_STATUSES, "ALL"]).optional(),
    page: z.coerce.number().int().min(1).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
  }),
});

export type ProductInput = z.infer<typeof productBody>;
