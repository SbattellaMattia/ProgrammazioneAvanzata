import { z } from 'zod';

export const createParkingSchema = z.object({
  name: z.string({
    required_error: "Il nome del parcheggio è obbligatorio",
    invalid_type_error: "Il nome deve essere una stringa"
  }).min(1, "Il nome non può essere vuoto"),
  
  address: z.string({
    required_error: "L'indirizzo è obbligatorio",
    invalid_type_error: "L'indirizzo deve essere una stringa"
  }).min(1, "L'indirizzo non può essere vuoto"),

  capacity: z.number({
    required_error: "La capacità è obbligatoria",
    invalid_type_error: "La capacità deve essere un numero"
  }).int("La capacità deve essere un numero intero")
    .positive("La capacità deve essere maggiore di 0"),
});

export const updateParkingSchema = createParkingSchema.partial();

export const parkingIdSchema = z.object({
  id: z.string().uuid("L'ID deve essere un UUID valido"),
});

// Tipi inferiti (opzionale, per tipizzazione forte nel Service/Controller)
export type CreateParkingDTO = z.infer<typeof createParkingSchema>;
export type UpdateParkingDTO = z.infer<typeof updateParkingSchema>;
export type ParkingIdParams = z.infer<typeof parkingIdSchema>;
