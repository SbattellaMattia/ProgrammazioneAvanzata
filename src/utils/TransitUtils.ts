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
  const all = await transitDAO.findByParking(parkingId);

  const filtered = all
    .filter((t) => t.vehicleId === vehicleId)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  const last = filtered[filtered.length - 1];

  // ---- GATE SOLO IN ----
  // - se non c'è storico => IN
  // - se ultimo è IN     => ERRORE (già dentro)
  // - se ultimo è OUT    => IN
  if (gateDirection === "in") {
    if (!last) {
      return TransitType.IN;
    }

    if (last.type === TransitType.IN) {
      throw new ValidationError(
        "Veicolo già dentro: impossibile registrare un altro ingresso su un gate di ENTRATA"
      );
    }

    return TransitType.IN;
  }

  // ---- GATE SOLO OUT ----
  // - se non c'è storico => ERRORE
  // - se ultimo è OUT    => ERRORE (già fuori)
  // - se ultimo è IN     => OUT
  if (gateDirection === "out") {
    if (!last) {
      throw new ValidationError(
        "Non puoi registrare un'uscita: nessun ingresso precedente per questo veicolo"
      );
    }

    if (last.type === TransitType.OUT) {
      throw new ValidationError(
        "Non puoi registrare due uscite consecutive su un gate di USCITA"
      );
    }

    return TransitType.OUT;
  }

  // ---- GATE BIDIRECTIONAL ----
  // - se non c'è storico => IN
  // - se ultimo è OUT    => IN
  // - se ultimo è IN     => OUT
  if (!last) {
    return TransitType.IN;
  }

  return last.type === TransitType.OUT ? TransitType.IN : TransitType.OUT;
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
