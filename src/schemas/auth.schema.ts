import { z } from 'zod';

export const registerSchema = z.strictObject({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128, 'Password is too long'),
});

export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.strictObject({
  email: z.string().trim().toLowerCase().pipe(z.email('Invalid email address')),
  password: z.string().min(1, 'Password is required').max(128),
});

export type LoginInput = z.infer<typeof loginSchema>;