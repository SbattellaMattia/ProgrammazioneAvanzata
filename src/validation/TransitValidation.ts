// src/validation/TransitValidation.ts
import { z } from "zod";
import { TransitType } from "../enum/TransitType";

const plateRegex = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
const timeRegex =/^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2,4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;
/**
 * Zod schema per creare transito
 */
export const createTransitSchema = z.object({
  parkingId: z
    .string({ required_error: "parkingId obbligatorio" })
    .uuid("parkingId deve essere un UUID valido"),

  gateId: z
    .string({ required_error: "gateId obbligatorio" })
    .uuid("gateId deve essere un UUID valido"),

  vehicleId: z
    .string({ required_error: "vehicleId (targa) obbligatorio" })
    .regex(plateRegex, "Formato targa non valido (es. AA123BB)"),

  type: z.nativeEnum(TransitType, {
    errorMap: () => ({ message: "type non valido, usare 'in' o 'out'" }),
  }),

  date: z.string().regex(timeRegex,"timestamp deve essere nel formato DD/MM/YYYY HH:MM:SS"),

  imageData: z.string().nullable().optional(),

  detectedPlate: z
    .string()
    .regex(plateRegex, "Formato targa rilevata non valido (es. AA123BB)")
    .nullable()
    .optional(),
});

/**
 * Zod schema per update Transito
 * tutti i campi sono opzionali, ma almeno uno deve essere presente
 */
export const updateTransitSchema = z
.object({
  type: z.nativeEnum(TransitType).optional(),

  date: z.string().regex(timeRegex,"timestamp deve essere nel formato DD/MM/YYYY HH:MM:SS").optional(),

  imageData: z.string().nullable().optional(),

  detectedPlate: z
    .string()
    .regex(plateRegex, "Formato targa rilevata non valido (es. AA123BB)")
    .nullable()
    .optional(), 
  })
  .refine(
    (data) =>
      data.type !== undefined ||
      data.date !== undefined ||
      data.imageData !== undefined ||
      data.detectedPlate !== undefined ,
    {
      message: "Deve essere fornito almeno un campo da aggiornare",
    }
  );

export const transitIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type CreateTransitInput = z.infer<typeof createTransitSchema>;
export type UpdateTransitInput = z.infer<typeof updateTransitSchema>;
export type TransitIdParams = z.infer<typeof transitIdSchema>;