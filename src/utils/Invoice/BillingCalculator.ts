
import { RateDAO } from "../../dao/RateDAO";
import { TransitDAO } from "../../dao/TransitDAO";
import { VehicleDAO } from "../../dao/VehicleDAO";
import { Rate } from "../../models/Rate";
import { DayType } from "../../enum/DayType";
import { RateDAO as RateDAOClass } from "../../dao/RateDAO";
import { TransitDAO as TransitDAOClass } from "../../dao/TransitDAO";
import { VehicleDAO as VehicleDAOClass } from "../../dao/VehicleDAO";

import {
  BillingContext,
  loadBillingContext,
  getDay,
} from "./BillingUtils";

export class RateCalculator {
  constructor(
    private rateDAO: RateDAO,
    private transitDAO: TransitDAO,
    private vehicleDAO: VehicleDAO
  ) {}

  /**
   * API principale: dati due transitId (entry/exit) calcola l'importo totale.
   */
  async calcFromTransits(
    entryTransitId: string,
    exitTransitId: string
  ): Promise<{ amount: number; context: BillingContext }> {
    const ctx = await loadBillingContext(
      entryTransitId,
      exitTransitId,
      this.transitDAO,
      this.vehicleDAO
    );

    const amount = await this.calcForContext(ctx);

    return {
      amount: Number(amount.toFixed(2)),
      context: ctx,
    };
  }

  /**
   * Calcola l'importo su un BillingContext generico.
   * Supporta soste su più giorni e fasce orarie.
   */
  private async calcForContext(ctx: BillingContext): Promise<number> {
    let total = 0;

    let cursor = new Date(ctx.entryDate);
    const end = new Date(ctx.exitDate);

    while (cursor < end) {
      // inizio/fine giorno corrente
      const dayStart = new Date(cursor);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const intervalStart = cursor;
      const intervalEnd = end < dayEnd ? end : dayEnd;

      const dayType: DayType = getDay(intervalStart);

      // Tariffe per quel giorno / parcheggio / tipo veicolo
      const dayRates = await this.rateDAO.findAll({
        where: {
          parkingId: ctx.parkingId,
          vehicleType: ctx.vehicleType,
          dayType,
        },
        order: [["hourStart", "ASC"]],
      });

      total += this.calcForInterval(intervalStart, intervalEnd, dayRates);

      cursor = intervalEnd;
    }

    return total;
  }

  /**
   * Calcola l’importo in un sotto-intervallo [intervalStart, intervalEnd]
   * usando le Rate che coprono la giornata.
   * Ogni Rate ha price = €/ora.
   */
  private calcForInterval(intervalStart: Date,intervalEnd: Date,rates: Rate[]): number {
    let partial = 0;

    for (const rate of rates) {
      // Costruisco l’intervallo orario della Rate
      const slotStart = new Date(intervalStart);
      const [sh, sm] = String(rate.hourStart).split(":").map(Number);
      slotStart.setHours(sh, sm || 0, 0, 0);

      let slotEnd = new Date(slotStart);
      const [eh, em] = String(rate.hourEnd).split(":").map(Number);
      slotEnd.setHours(eh, em || 0, 0, 0);

      // fascia che passa la mezzanotte (es: 20:00 → 08:00)
      if (slotEnd <= slotStart) {
        slotEnd.setDate(slotEnd.getDate() + 1);
      }

      // overlap tra [intervalStart, intervalEnd] e [slotStart, slotEnd]
      const overlapStart = new Date(
        Math.max(intervalStart.getTime(), slotStart.getTime())
      );
      const overlapEnd = new Date(
        Math.min(intervalEnd.getTime(), slotEnd.getTime())
      );

      if (overlapEnd > overlapStart) {
        const minutes =
          (overlapEnd.getTime() - overlapStart.getTime()) / 60000;
        const hours = minutes / 60;
        partial += hours * rate.price;
      }
    }

    return partial;
  }
}

const rateDAO = new RateDAOClass();
const transitDAO = new TransitDAOClass();
const vehicleDAO = new VehicleDAOClass();

const rateCalculator = new RateCalculator(rateDAO, transitDAO, vehicleDAO);

export default rateCalculator;