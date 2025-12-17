import { z } from "zod";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

/**
 * Validazione di una stringa oraria.
 * L'orario deve essere nel formato HH:MM.
 */
const timeStringSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d$/,
    "L'orario deve essere nel formato HH:MM (es. 09:30)"
  );

/**
 * Validazione dei dati per creare una nuova tariffa.
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
}).strict();

/**
 * Validazione dei dati per aggiornare una tariffa.
 * Tutti i campi sono opzionali.
 */
export const updateRateSchema = z
  .object({
    price: z.number().nonnegative("Il prezzo deve essere >= 0").optional(),
    vehicleType: z.nativeEnum(VehicleType).optional(),
    hourStart: timeStringSchema.optional(),
    hourEnd: timeStringSchema.optional(),
  }).strict(); 

/**
 * Validazione dell'ID della tariffa passato come parametro nella rotta.
 */
export const rateIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type CreateRateInput = z.infer<typeof createRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;
export type RateIdParams = z.infer<typeof rateIdSchema>;