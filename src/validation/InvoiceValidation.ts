// src/validation/GateValidation.ts
import { z } from "zod";
import { InvoiceStatus } from "../enum/InvoiceStatus";
/**
 * Validazione parametro :id nella rotta
 */
export const invoiceIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export const invoiceQuerySchema = z.object({
  from: z.coerce.date({
    invalid_type_error: "La data di inizio deve essere valida (ISO 8601)",
  }).optional(),

  to: z.coerce.date({
    invalid_type_error: "La data di fine deve essere valida (ISO 8601)",
  }).optional(),
 
  status: z.nativeEnum(InvoiceStatus, {
      errorMap: () => ({ message: "Stato della fattura non valido" }),
  }).optional(),

}).refine((data) => !(data.from && data.to) || data.from <= data.to, {
    message: "La data di inizio deve essere precedente o uguale alla data di fine",
    path: ["to"],
});

export type InvoiceIdParams = z.infer<typeof invoiceIdSchema>;
export type InvoiceQuery = z.infer<typeof invoiceQuerySchema>;