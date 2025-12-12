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

    carCapacity: z.number({
        required_error: "La capacità delle macchine è obbligatoria",
        invalid_type_error: "La capacità delle macchinedeve essere un numero"
    }).int("La capacità delle macchine deve essere un numero intero")
        .positive("La capacità delle macchine deve essere maggiore di 0"),

    motorcycleCapacity: z.number({
        required_error: "La capacità delle moto è obbligatoria",
        invalid_type_error: "La capacità delle moto deve essere un numero"
    }).int("La capacità delle moto deve essere un numero intero")
        .positive("La capacità delle moto deve essere maggiore di 0"),

    truckCapacity: z.number({
        required_error: "La capacità dei camion è obbligatoria",
        invalid_type_error: "La capacità dei camion deve essere un numero"
    }).int("La capacità dei camion deve essere un numero intero")
        .positive("La capacità dei camion deve essere maggiore di 0"),
}).strict();


export const updateParkingSchema = z.object({
    name: z.string({
        required_error: "Il nome del parcheggio è obbligatorio",
        invalid_type_error: "Il nome deve essere una stringa"
    }).min(1, "Il nome non può essere vuoto").optional(),

    address: z.string({
        required_error: "L'indirizzo è obbligatorio",
        invalid_type_error: "L'indirizzo deve essere una stringa"
    }).min(1, "L'indirizzo non può essere vuoto").optional(),

    carCapacity: z.number({
        required_error: "La capacità delle macchine è obbligatoria",
        invalid_type_error: "La capacità delle macchinedeve essere un numero"
    }).int("La capacità delle macchine deve essere un numero intero")
        .nonnegative("La capacità delle macchine deve essere maggiore di 0").optional(),

    motorcycleCapacity: z.number({
        required_error: "La capacità delle moto è obbligatoria",
        invalid_type_error: "La capacità delle moto deve essere un numero"
    }).int("La capacità delle moto deve essere un numero intero")
        .nonnegative("La capacità delle moto deve essere maggiore di 0").optional(),

    truckCapacity: z.number({
        required_error: "La capacità dei camion è obbligatoria",
        invalid_type_error: "La capacità dei camion deve essere un numero"
    }).int("La capacità dei camion deve essere un numero intero")
        .nonnegative("La capacità dei camion deve essere maggiore di 0").optional(),
}).strict();

export const parkingIdSchema = z.object({
    id: z.string().uuid("L'ID deve essere un UUID valido"),
});

// Tipi inferiti (opzionale, per tipizzazione forte nel Service/Controller)
export type CreateParkingDTO = z.infer<typeof createParkingSchema>;
export type UpdateParkingDTO = z.infer<typeof updateParkingSchema>;
export type ParkingIdParams = z.infer<typeof parkingIdSchema>;
