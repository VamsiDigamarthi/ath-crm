import { z } from 'zod';

export const registerAdminSchema = z.object({
  email: z.string().email('Please enter a valid email address').optional(),
  mobile: z.string().regex(/^[0-9]{10,15}$/, 'Please enter a valid phone number (10-15 digits)').optional(),
}).refine((data) => data.email || data.mobile, {
  message: 'Either email or phone number must be provided',
  path: ['email'],
});

export type RegisterAdminInput = z.infer<typeof registerAdminSchema>;
