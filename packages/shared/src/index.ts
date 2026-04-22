import { z } from 'zod';

export * from './schemas.ts';

// Schema comună veche (opțional, o putem păstra sau șterge)
export const UserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export type User = z.infer<typeof UserSchema>;
