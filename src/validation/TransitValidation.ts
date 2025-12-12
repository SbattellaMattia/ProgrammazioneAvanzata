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
  }).strict(); // vieta qualsiasi altro campo (type, plate, ecc.)
  
export const transitIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

const PLATE_REGEX = /^([A-Z]{2}\d{5}|[A-Z]{2}\d{3}[A-Z]{2})$/;

export const transitHistorySchema = z.object({
  from: z.coerce.date({
    invalid_type_error: "La data di inizio deve essere valida (ISO 8601)",
  }).optional(),

  to: z.coerce.date({
    invalid_type_error: "La data di fine deve essere valida (ISO 8601)",
  }).optional(),

  plates: z
      .union([z.string(), z.array(z.string())])
      .transform((val) =>
        Array.isArray(val)
          ? val.flatMap((p) => p.split(","))
          : val.split(",")
      )
      .transform((arr) => arr.map((p) => p.trim().toUpperCase()).filter(Boolean))
      .refine((arr) => arr.every((p) => PLATE_REGEX.test(p)), {
        message: "Formato targa non valido. Ammessi: LL12345 oppure LL123LL",
      })
      .optional(),

  format: z.enum(['json', 'pdf'], {
    errorMap: () => ({ message: "Il formato deve essere 'json' o 'pdf'" })
  }).optional().default('json'),
})
.refine((data) => !(data.from && data.to) || data.from <= data.to, {
    message: "La data di inizio deve essere precedente o uguale alla data di fine",
    path: ["to"],
});


export type UpdateTransitInput = z.infer<typeof updateTransitSchema>;
export type TransitIdParams = z.infer<typeof transitIdSchema>;
export type TransitQuery = z.infer<typeof transitHistorySchema>;
