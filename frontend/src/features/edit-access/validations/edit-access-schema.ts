import { z } from 'zod';

const noHtml = (v: string) => !/<[^>]+>|<\s*script\b|javascript\s*:/i.test(v);

export const requestEditAccessSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(5, 'Reason must be at least 5 characters')
    .max(1000, 'Reason cannot exceed 1000 characters')
    .refine(noHtml, 'HTML tags are not allowed'),
});

export const approveEditAccessSchema = z.object({
  accessUntil: z.date({ message: 'Select until when access is allowed' }).refine((d) => d.getTime() > Date.now(), {
    message: 'End time must be in the future',
  }),
  reviewNote: z.string().trim().max(500, 'Note cannot exceed 500 characters').refine(noHtml, 'HTML tags are not allowed'),
});
