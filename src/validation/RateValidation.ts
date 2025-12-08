import { z } from "zod";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

/**
 * La stringa deve essere nel formato HH:MM o HH:MM:SS
 */
const timeStringSchema = z
  .string()
  .regex(
    /^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/,
    "Deve essere nel formato HH:MM o HH:MM:SS"
  );

/**
 * Schema per create tariffa
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
 */
export const updateRateSchema = z
  .object({
    vehicleType: z.nativeEnum(VehicleType).optional(),
    dayType: z.nativeEnum(DayType).optional(),
    price: z.number().nonnegative("Il prezzo deve essere >= 0").optional(),
    hourStart: timeStringSchema.optional(),
    hourEnd: timeStringSchema.optional(),
  })
  .refine(
    (data) =>
      data.vehicleType !== undefined ||
      data.dayType !== undefined ||
      data.price !== undefined ||
      data.hourStart !== undefined ||
      data.hourEnd !== undefined,
    {
      message: "Deve essere fornito almeno un campo da aggiornare",
    }
  );

export type CreateRateInput = z.infer<typeof createRateSchema>;
export type UpdateRateInput = z.infer<typeof updateRateSchema>;