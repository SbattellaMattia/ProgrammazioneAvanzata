import { z } from "zod";
import { InvoiceStatus } from "../enum/InvoiceStatus";

/**
 * Validazione dell'ID della fattura passato come parametro nella rotta.
 */
export const invoiceIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

/**
 * Validazione dei parametri di query per la ricerca delle fatture.
 *
 * Permette di filtrare per:
 * - intervallo di date
 * - stato della fattura
 */
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