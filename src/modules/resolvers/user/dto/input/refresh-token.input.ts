import * as z from 'zod';

export const createRefreshTokenSchema = z.object({
  refreshToken: z.string({ required_error: 'Required' }).min(5),
});

export type RefreshTokenInput = z.infer<typeof createRefreshTokenSchema>;
