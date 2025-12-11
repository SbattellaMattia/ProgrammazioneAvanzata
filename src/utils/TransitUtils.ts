import path from "path";
import fs from "fs";

import { TransitType } from "../enum/TransitType";
import { GateType } from "../enum/GateType";
import { VehicleType } from "../enum/VehicleType";
import { ocr } from "../utils/Ocr/OcrService";
import {
  ValidationError,
  NotFoundError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";

import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { VehicleDAO } from "../dao/VehicleDAO";

/**
 * Restituisce il parcheggio completo oppure lancia NotFoundError.
 */
export async function getParkingOrThrow(
  parkingDAO: ParkingDAO,
  parkingId: string
) {
  const parking = await parkingDAO.findById(parkingId);
  if (!parking) {
    throw new NotFoundError("Parking", parkingId);
  }
  return parking;
}

/**
 * Restituisce un veicolo random tra TUTTI i veicoli.
 */
export async function pickRandomVehicle(vehicleDAO: VehicleDAO) {
  const vehicles = await vehicleDAO.findAllVehicles();
  if (!vehicles || vehicles.length === 0) {
    throw new ValidationError("Nessun veicolo disponibile");
  }

  const index = Math.floor(Math.random() * vehicles.length);
  return vehicles[index];
}

/**
 * Determina IN/OUT in base allo storico per (parkingId, vehicleId).
 */
export async function determineTransitTypeForGate(
  transitDAO: TransitDAO,
  parkingId: string,
  vehicleId: string,
  gateDirection: "in" | "out" | "bidirectional"
): Promise<TransitType> {
  // 1. Prendo TUTTI i transiti del veicolo (tutti i parcheggi)
  const allForVehicle = await transitDAO.findByVehicle(vehicleId);
  const sorted = allForVehicle.sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );
  const last = sorted[sorted.length - 1];

  // --- CASO: nessun transito per il veicolo ---
  if (!last) {
    if (gateDirection === "out") {
      // non posso fare un'uscita senza mai essere entrato
      throw new ValidationError(
        "Non puoi registrare un'uscita: nessun ingresso precedente per questo veicolo"
      );
    }

    // gate "in" o "bidirectional" → primo transito sarà un IN
    return TransitType.IN;
  }

  // --- CASO: l'ultimo transito globale è IN → veicolo attualmente DENTRO ---
  if (last.type === TransitType.IN) {
    // il veicolo risulta dentro nel parcheggio last.parkingId
    const insideParkingId = last.parkingId;

    // se sto cercando di lavorare da un altro parking → ERRORE
    if (insideParkingId !== parkingId) {
      throw new ValidationError(
        "Il veicolo risulta già all'interno di un altro parcheggio: può uscire solo da quel parcheggio"
      );
    }

    // se il gate è SOLO IN → non posso fare un altro IN
    if (gateDirection === "in") {
      throw new ValidationError(
        "Veicolo già dentro in questo parcheggio: impossibile registrare un altro ingresso"
      );
    }

    // se il gate è OUT o BIDIRECTIONAL → deve essere un'uscita
    return TransitType.OUT;
  }

  // --- CASO: l'ultimo transito globale è OUT → veicolo attualmente FUORI ---
  if (last.type === TransitType.OUT) {
    // se il gate è SOLO OUT → non posso fare due OUT di fila
    if (gateDirection === "out") {
      throw new ValidationError(
        "Non puoi registrare due uscite consecutive per questo veicolo"
      );
    }

    // gate "in" o "bidirectional" → prossimo sarà un IN
    return TransitType.IN;
  }

  // fallback teorico (non dovrebbe mai arrivarci)
  throw new ValidationError("Tipo di transito non valido");
}

/**
 * Verifica la capacità del parcheggio prima di un transito IN.
 */
export function ensureCapacityForIn(
  parking: any,
  vehicle: any,
  newType: TransitType
) {
  if (newType !== TransitType.IN) return;

  switch (vehicle.type as VehicleType) {
    case VehicleType.CAR:
      if (parking.carCapacity <= 0) {
        throw new OperationNotAllowedError(
          "createRandomTransitForGate",
          "Capacità auto esaurita per questo parcheggio"
        );
      }
      break;

    case VehicleType.MOTORCYCLE:
      if (parking.motorcycleCapacity <= 0) {
        throw new OperationNotAllowedError(
          "createRandomTransitForGate",
          "Capacità moto esaurita per questo parcheggio"
        );
      }
      break;

    case VehicleType.TRUCK:
      if (parking.truckCapacity <= 0) {
        throw new OperationNotAllowedError(
          "createRandomTransitForGate",
          "Capacità camion esaurita per questo parcheggio"
        );
      }
      break;

    default:
      break;
  }
}

/**
 * Aggiorna la capacità del parcheggio dopo il transito:
 * - IN  => decrementa la capacity del tipo veicolo
 * - OUT => incrementa la capacity del tipo veicolo
 */
export async function updateParkingCapacityAfterTransit(
  parkingDAO: ParkingDAO,
  parking: any,
  vehicle: any,
  newType: TransitType
) {
  const delta = newType === TransitType.IN ? -1 : 1;

  const payload: any = {};

  switch (vehicle.type as VehicleType) {
    case VehicleType.CAR:
      payload.carCapacity = parking.carCapacity + delta;
      break;

    case VehicleType.MOTORCYCLE:
      payload.motorcycleCapacity = parking.motorcycleCapacity + delta;
      break;

    case VehicleType.TRUCK:
      payload.truckCapacity = parking.truckCapacity + delta;
      break;

    default:
      break;
  }

  if (Object.keys(payload).length > 0) {
    await parkingDAO.updateCapacity(parking.id, payload);
  }
}
