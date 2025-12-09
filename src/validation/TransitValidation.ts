// src/validation/TransitValidation.ts
import { z } from "zod";
import { TransitType } from "../enum/TransitType";

const plateRegex = /^[A-Z]{2}\d{3}[A-Z]{2}$/;
const timeRegex =/^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2,4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

/**
 * Zod schema per update Transito
 * tutti i campi sono opzionali, ma almeno uno deve essere presente
 */
export const updateTransitSchema = z
.object({
  type: z.nativeEnum(TransitType).optional(),

  date: z.string().regex(timeRegex,"timestamp deve essere nel formato DD/MM/YYYY HH:MM:SS").optional(),

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
      data.detectedPlate !== undefined ,
    {
      message: "Deve essere fornito almeno un campo da aggiornare",
    }
  );

export const transitIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type UpdateTransitInput = z.infer<typeof updateTransitSchema>;
export type TransitIdParams = z.infer<typeof transitIdSchema>;