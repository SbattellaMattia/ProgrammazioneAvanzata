import { z } from "zod";
import { GateType } from "../enum/GateType";
import { GateDirection } from "../enum/GateDirection";

/**
 * Validazione dei dati per creare un nuovo Gate.
 * Controlla che i campi obbligatori siano presenti e corretti.
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
 * Validazione dei dati per aggiornare un Gate.
 *
 * In questo caso:
 * - nessun campo è obbligatorio
 * - si possono modificare solo type e direction
 */
export const updateGateSchema = z
  .object({
    type: z.nativeEnum(GateType).optional(),
    direction: z.nativeEnum(GateDirection).optional(),
  }).strict();

/**
 * Validazione dell'ID del Gate passato come parametro nella rotta.
 */
export const gateIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type CreateGateInput = z.infer<typeof createGateSchema>;
export type UpdateGateInput = z.infer<typeof updateGateSchema>;
export type GateIdParams = z.infer<typeof gateIdSchema>;