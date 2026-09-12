import { z } from 'zod';

export const emailTemplateFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Template name is required')
    .max(120, 'Template name must be under 120 characters'),
  roles: z
    .array(z.string())
    .min(1, 'Please select at least one target role'),
  subject: z
    .string()
    .min(1, 'Email subject is required')
    .max(200, 'Subject line must be under 200 characters'),
  body: z
    .string()
    .min(1, 'Email body content cannot be empty'),
  isActive: z.boolean().optional().default(true),
});

export type EmailTemplateFormValues = z.infer<typeof emailTemplateFormSchema>;
