// src/validation/RateValidation.ts
import { z } from "zod";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

/**
 * La stringa deve essere nel formato HH:MM
 */
const timeStringSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "L'orario deve essere nel formato HH:MM (es. 09:30)"
  );

/**
 * Zod schema per creare tariffa
 */
export const createRateSchema = z.object({
  parkingId: z.string().uuid("parkingId deve essere un UUID valido"),
  vehicleType: z.nativeEnum(VehicleType, {
    errorMap: () => ({ message: "vehicleType non valido" }),
  }),
  dayType: z.nativeEnum(DayType, {
    errorMap: () => ({ message: "dayType non valido" }),
  }),
  price: z
    .number({ required_error: "price è obbligatorio" })
    .nonnegative("Il prezzo deve essere >= 0"),
  hourStart: timeStringSchema,
  hourEnd: timeStringSchema,
});

/**
 * Zod schema per update tariffa
 * tutti i campi sono opzionali, ma almeno uno deve essere presente
 * (price, hourStart, hourEnd)
 */
const updateRateBaseSchema = z
  .object({
    price: z.number().nonnegative("Il prezzo deve essere >= 0").optional(),
    hourStart: timeStringSchema.optional(),
    hourEnd: timeStringSchema.optional(),
  })
  .strict(); 

export const updateRateSchema = updateRateBaseSchema.refine(
  (data) =>
    data.price !== undefined ||
    data.hourStart !== undefined ||
    data.hourEnd !== undefined,
  {
    message: "Deve essere fornito almeno un campo tra price, hourStart e hourEnd",
  }
);

/**
 * Schema per validare l'ID della tariffa (parametro di path)
 */
export const rateIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

// Tipi TypeScript inferiti dagli schemi
export type CreateRateInput = z.infer<typeof createRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;
export type RateIdParams = z.infer<typeof rateIdSchema>;