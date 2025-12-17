import { z } from "zod";

/**
 * Espressione regolare per validare una data/ora
 * nel formato DD/MM/YYYY HH:MM:SS
 */
const timeRegex =/^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{2,4} ([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

/**
 * Validazione dei dati per aggiornare un transito.
 *
 * In questo caso:
 * - è possibile modificare solo la data
 * - non sono ammessi altri campi
 */
export const updateTransitSchema = z
    .object({
    date: z
      .string()
      .regex(timeRegex, "timestamp deve essere nel formato DD/MM/YYYY HH:MM:SS"),
  }).strict(); // vieta qualsiasi altro campo (type, plate, ecc.)
  
export const transitIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

/**
 * Espressione regolare per il formato della targa.
 * Esempi validi:
 * - LL12345
 * - LL123LL
 */
const PLATE_REGEX = /^([A-Z]{2}\d{5}|[A-Z]{2}\d{3}[A-Z]{2})$/;

/**
 * Validazione dei parametri di query per lo storico dei transiti.
 *
 * Permette di filtrare per:
 * - periodo (from / to)
 * - una o più targhe
 * - formato di output (json o pdf)
 */
export const transitHistorySchema = z.object({
  from: z.coerce.date({
    invalid_type_error: "La data di inizio deve essere valida (ISO 8601)",
  }).optional(),

  to: z.coerce.date({
    invalid_type_error: "La data di fine deve essere valida (ISO 8601)",
  }).optional(),

  plates: z
      .union([z.string(), z.array(z.string())])
      .transform((val) =>
        Array.isArray(val)
          ? val.flatMap((p) => p.split(","))
          : val.split(",")
      )
      .transform((arr) => arr.map((p) => p.trim().toUpperCase()).filter(Boolean))
      .refine((arr) => arr.every((p) => PLATE_REGEX.test(p)), {
        message: "Formato targa non valido. Ammessi: LL12345 oppure LL123LL",
      })
      .optional(),

  format: z.enum(['json', 'pdf'], {
    errorMap: () => ({ message: "Il formato deve essere 'json' o 'pdf'" })
  }).optional().default('json'),
})
.refine((data) => !(data.from && data.to) || data.from <= data.to, {
    message: "La data di inizio deve essere precedente o uguale alla data di fine",
    path: ["to"],
});


export type UpdateTransitInput = z.infer<typeof updateTransitSchema>;
export type TransitIdParams = z.infer<typeof transitIdSchema>;
export type TransitQuery = z.infer<typeof transitHistorySchema>;
