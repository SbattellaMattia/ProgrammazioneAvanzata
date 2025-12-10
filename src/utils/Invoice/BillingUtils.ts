// src/utils/BillingUtils.ts
import { Transit } from "../../models/Transit";
import { Vehicle } from "../../models/Vehicle";
import { VehicleType } from "../../enum/VehicleType";
import { DayType } from "../../enum/DayType";
import { Rate } from "../../models/Rate";
import { TransitDAO } from "../../dao/TransitDAO";
import { VehicleDAO } from "../../dao/VehicleDAO";
import { ValidationError, NotFoundError } from "../../errors/CustomErrors";

export interface BillingContext {
  parkingId: string;
  vehiclePlate: string;
  vehicleType: VehicleType;
  entryDate: Date;
  exitDate: Date;
  dayType: DayType;
}

export function getDay(date: Date): DayType {
  const day = date.getDay(); // 0 domenica, 6 sabato
  return day === 0 || day === 6 ? DayType.WEEKEND : DayType.WEEKDAY;
}

export function timeToMinutes(value: string | Date): number {
  if (value instanceof Date) {
    return value.getHours() * 60 + value.getMinutes();
  }
  const [hStr, mStr = "0"] = value.split(":");
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  return h * 60 + m;
}

/**
 * Fascia oraria [hourStart, hourEnd) su 24h, con supporto a 20–08
 */
export function isInRange(date: Date, rate: Rate): boolean {
  const t = timeToMinutes(date);
  const start = timeToMinutes(rate.hourStart as any);
  const end = timeToMinutes(rate.hourEnd as any);

  if (start < end) {
    // es: 08–20
    return t >= start && t < end;
  }
  // fascia che passa la mezzanotte: es 20–08
  return t >= start || t < end;
}

export function buildBillingContext(
  entryTransit: Transit,
  exitTransit: Transit,
  vehicle: Vehicle
): BillingContext {
  if (entryTransit.parkingId !== exitTransit.parkingId) {
    throw new ValidationError("I transiti appartengono a parcheggi diversi");
  }
  if (entryTransit.vehicleId !== exitTransit.vehicleId) {
    throw new ValidationError("I transiti appartengono a veicoli diversi");
  }

  const entryDate = new Date(entryTransit.date);
  const exitDate = new Date(exitTransit.date);

  if (entryDate >= exitDate) {
    throw new ValidationError("L'ingresso deve essere precedente all'uscita");
  }

  const dayType = getDay(entryDate);

  return {
    parkingId: entryTransit.parkingId,
    vehiclePlate: vehicle.plate,
    vehicleType: vehicle.type,
    entryDate,
    exitDate,
    dayType,
  };
}

export async function loadBillingContext(
  entryTransitId: string,
  exitTransitId: string,
  transitDAO: TransitDAO,
  vehicleDAO: VehicleDAO
): Promise<BillingContext> {
  const entryTransit = await transitDAO.findById(entryTransitId);
  const exitTransit = await transitDAO.findById(exitTransitId);

  if (!entryTransit) {
    throw new NotFoundError("Transit", entryTransitId);
  }
  if (!exitTransit) {
    throw new NotFoundError("Transit", exitTransitId);
  }

  const plate = entryTransit.vehicleId;
  const vehicle = await vehicleDAO.findByPlate(plate);

  if (!vehicle) {
    throw new NotFoundError("Vehicle", plate);
  }

  return buildBillingContext(entryTransit, exitTransit, vehicle);
}