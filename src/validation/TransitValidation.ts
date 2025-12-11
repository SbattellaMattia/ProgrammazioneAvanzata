// src/validation/TransitValidation.ts
import { z } from "zod";

const timeRegex =/^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2,4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

/**
 * Zod schema per update Transito
 * tutti i campi sono opzionali, ma almeno uno deve essere presente
 */
export const updateTransitSchema = z
    .object({
    date: z
      .string()
      .regex(timeRegex, "timestamp deve essere nel formato DD/MM/YYYY HH:MM:SS"),
  })
  .strict(); // vieta qualsiasi altro campo (type, plate, ecc.)
  
export const transitIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type UpdateTransitInput = z.infer<typeof updateTransitSchema>;
export type TransitIdParams = z.infer<typeof transitIdSchema>;