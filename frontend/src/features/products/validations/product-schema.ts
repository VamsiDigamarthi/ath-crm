import { z } from 'zod';

const noHtml = (v: string) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v);

export const productSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Item name must be at least 2 characters')
    .max(100, 'Item name cannot exceed 100 characters')
    .refine(noHtml, 'HTML tags are not allowed'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .refine(noHtml, 'HTML tags are not allowed')
    .optional(),
  price: z.coerce
    .number({ message: 'Enter a valid price' })
    .min(0, 'Price cannot be negative')
    .max(1000000, 'Price cannot exceed 1,000,000')
    .refine((v) => /^\d+(\.\d{1,2})?$/.test(String(v)), 'Price can have at most 2 decimals'),
  unit: z.enum(['PER_RETURN', 'PER_FORM', 'PER_STATE', 'PER_HOUR', 'PER_ITEM', 'FIXED'], { message: 'Select a unit' }),
  taxType: z.enum(['NO_TAX', 'VAT_10'], { message: 'Select a tax option' }),
  status: z.enum(['ACTIVE', 'INACTIVE'], { message: 'Select a status' }),
});

export type ProductSchemaInput = z.input<typeof productSchema>;
export type ProductSchemaOutput = z.output<typeof productSchema>;
