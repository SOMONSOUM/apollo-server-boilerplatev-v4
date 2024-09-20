import * as z from 'zod';

export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(5),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
