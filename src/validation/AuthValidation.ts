import { z } from 'zod';

/**
 * Schema di validazione per il login
 */
export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email richiesta' })
    .email('Formato email non valido'),
  
  password: z
    .string({ required_error: 'Password richiesta' }),
});

export type LoginInput = z.infer<typeof loginSchema>;
