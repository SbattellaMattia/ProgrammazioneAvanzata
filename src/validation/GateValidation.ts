// src/validation/GateValidation.ts
import { z } from "zod";
import { GateType } from "../enum/GateType";
import { GateDirection } from "../enum/GateDirection";

/**
 * Schema Zod per la creazione di un Gate
 */
export const createGateSchema = z.object({
  parkingId: z.string().uuid("parkingId deve essere un UUID valido"),

  type: z.nativeEnum(GateType, {
    errorMap: () => ({ message: "type non valido" }),
  }),

  direction: z.nativeEnum(GateDirection, {
    errorMap: () => ({ message: "direction non valido" }),
  }),
}).strict();

/**
 * Schema Zod per l’update di un Gate
 * - si possono modificare solo type e direction
 * - almeno un campo deve essere presente
 */
export const updateGateSchema = z
  .object({
    type: z.nativeEnum(GateType).optional(),
    direction: z.nativeEnum(GateDirection).optional(),
  }).strict();

/**
 * Validazione parametro :id nella rotta
 */
export const gateIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type CreateGateInput = z.infer<typeof createGateSchema>;
export type UpdateGateInput = z.infer<typeof updateGateSchema>;
export type GateIdParams = z.infer<typeof gateIdSchema>;