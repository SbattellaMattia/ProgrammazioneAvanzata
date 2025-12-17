import { TransitType } from "../enum/TransitType";
import { VehicleType } from "../enum/VehicleType";
import {
  ValidationError,
  NotFoundError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";

import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { VehicleDAO } from "../dao/VehicleDAO";

/**
 * Sceglie un veicolo a caso tra quelli presenti nel sistema.
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
 * Decide se il prossimo transito deve essere IN o OUT.
 *
 * L'idea è semplice:
 * - guardiamo l’ultimo transito del veicolo
 * - se l’ultima azione era un ingresso, il prossimo deve essere un’uscita (e viceversa)
 * - teniamo anche conto del tipo di varco (solo ingresso / solo uscita / entrambi)
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
 * Controlla se c'è posto nel parcheggio prima di registrare un IN.
 * Se non c'è spazio per quel tipo di veicolo, blocca l'operazione.
 */
export function ensureCapacityForIn(
  parking: any,
  vehicle: any,
  newType: TransitType
) {
  if (newType !== TransitType.IN) return;

  switch (vehicle.type as VehicleType) {
    case VehicleType.CAR:
      if (parking.carCapacityRemain <= 0) {
        throw new OperationNotAllowedError(
          "createRandomTransitForGate",
          "Capacità auto esaurita per questo parcheggio"
        );
      }
      break;

    case VehicleType.MOTORCYCLE:
      if (parking.motorcycleCapacityRemain <= 0) {
        throw new OperationNotAllowedError(
          "createRandomTransitForGate",
          "Capacità moto esaurita per questo parcheggio"
        );
      }
      break;

    case VehicleType.TRUCK:
      if (parking.truckCapacityRemain <= 0) {
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
 * Aggiorna la disponibilità del parcheggio dopo un transito.
 *
 * Regola generale:
 * - IN  => diminuisce di 1 i posti disponibili per quel tipo di veicolo
 * - OUT => aumenta di 1 i posti disponibili per quel tipo di veicolo
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
      payload.carCapacityRemain = parking.carCapacityRemain + delta;
      break;

    case VehicleType.MOTORCYCLE:
      payload.motorcycleCapacityRemain = parking.motorcycleCapacityRemain + delta;
      break;

    case VehicleType.TRUCK:
      payload.truckCapacityRemain = parking.truckCapacityRemain + delta;
      break;

    default:
      break;
  }

  if (Object.keys(payload).length > 0) {
    await parkingDAO.updateCapacity(parking.id, payload);
  }
}
