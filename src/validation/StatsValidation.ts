import { z } from 'zod';

/**
 * Validazione dei parametri di query per le statistiche.
 *
 * Permette di:
 * - filtrare per periodo (from / to)
 * - scegliere il formato di risposta (json o pdf)
 */
export const statsQuerySchema = z.object({
  from: z.coerce.date({
    invalid_type_error: "La data di inizio deve essere valida (ISO 8601)",
  }).optional(), 

  to: z.coerce.date({
    invalid_type_error: "La data di fine deve essere valida (ISO 8601)",
  }).optional(),

  format: z.enum(['json', 'pdf'], {
    errorMap: () => ({ message: "Il formato deve essere 'json' o 'pdf'" })
  }).optional().default('json'),
})
.refine((data) => !(data.from && data.to) || data.from <= data.to, {
    message: "La data di inizio deve essere precedente o uguale alla data di fine",
    path: ["to"],
});

export type StatsQueryDTO = z.infer<typeof statsQuerySchema>;
