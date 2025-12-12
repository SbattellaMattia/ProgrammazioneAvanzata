// src/validation/GateValidation.ts
import { z } from "zod";

/**
 * Validazione parametro :id nella rotta
 */
export const invoiceIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

export type InvoiceIdParams = z.infer<typeof invoiceIdSchema>;