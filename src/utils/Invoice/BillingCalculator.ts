
import { RateDAO } from "../../dao/RateDAO";
import { TransitDAO } from "../../dao/TransitDAO";
import { VehicleDAO } from "../../dao/VehicleDAO";
import { Rate } from "../../models/Rate";
import { DayType } from "../../enum/DayType";
import { RateDAO as RateDAOClass } from "../../dao/RateDAO";
import { TransitDAO as TransitDAOClass } from "../../dao/TransitDAO";
import { VehicleDAO as VehicleDAOClass } from "../../dao/VehicleDAO";

import {
  timeToMinutes,
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
   * Calcola l'importo totale partendo dai transiti di ingresso e uscita.
   *
   * Recupera tutte le informazioni necessarie (date, veicolo, parcheggio)
   * e poi delega il calcolo vero e proprio.
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
   * Calcola l'importo usando un BillingContext.
   *
   * Se la sosta dura più giorni, il calcolo viene fatto
   * un giorno alla volta.
   */
  private async calcForContext(ctx: BillingContext): Promise<number> {
    let total = 0;

    // "cursor" avanza progressivamente dalla data di ingresso fino a quella di uscita.
    // Spezzettiamo per giornata.
    let cursor = new Date(ctx.entryDate);
    const end = new Date(ctx.exitDate);

    while (cursor < end) {

      /** Identificazione di
       * - dayStart = mezzanotte del giorno di "cursor"
       * - dayEnd   = mezzanotte del giorno successivo
       *
       * In questo modo possiamo calcolare l'intervallo effettivo della sosta dentro quel giorno:
       * [intervalStart, intervalEnd]
       */
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
   * Calcola l’importo relativo a un sotto-intervallo all’interno di una singola giornata:
   *
   * Le Tariffe hanno:
   * - hourStart / hourEnd (es. "08:00:00" -> "20:00:00")
   * - price inteso come €/ora
   *
   * Caso semplice:
   * - fasce "normali" con start < end (es. 08:00-20:00)
   *
   * Caso particolare:
   * - fasce che attraversano la mezzanotte (es. 20:00-08:00)
   *   In questo caso la fascia viene spezzata in due pezzi nella stessa giornata:
   *   - 00:00 -> 08:00
   *   - 20:00 -> 24:00
   */
  private calcForInterval(intervalStart: Date, intervalEnd: Date, rates: Rate[]): number {
  const dayStart = new Date(intervalStart);
  dayStart.setHours(0, 0, 0, 0);

  const dayEnd = new Date(dayStart);
  dayEnd.setDate(dayEnd.getDate() + 1);

  const clamp = (d: Date) =>
    new Date(Math.max(dayStart.getTime(), Math.min(dayEnd.getTime(), d.getTime())));

  const isect = (a0: Date, a1: Date, b0: Date, b1: Date) => {
    const s = new Date(Math.max(a0.getTime(), b0.getTime()));
    const e = new Date(Math.min(a1.getTime(), b1.getTime()));
    return e > s ? [s, e] as const : null;
  };

  const minutesBetween = (a: Date, b: Date) => (b.getTime() - a.getTime()) / 60000;

  let partial = 0;
  const a0 = clamp(intervalStart);
  const a1 = clamp(intervalEnd);

  for (const rate of rates) {
    const startMin = timeToMinutes(rate.hourStart as any); // "20:00:00" -> 1200
    const endMin   = timeToMinutes(rate.hourEnd as any);   // "08:00:00" -> 480

    const makeTime = (min: number) => {
      const d = new Date(dayStart);
      d.setMinutes(min, 0, 0);
      return d;
    };

    if (startMin < endMin) {
      // es 08-20
      const b0 = makeTime(startMin);
      const b1 = makeTime(endMin);
      const ov = isect(a0, a1, b0, b1);
      if (ov) partial += (minutesBetween(ov[0], ov[1]) / 60) * rate.price;
    } else {
      // es 20-08 -> due pezzi: 00-08 e 20-24
      const b0a = makeTime(0);
      const b1a = makeTime(endMin);
      const ovA = isect(a0, a1, b0a, b1a);
      if (ovA) partial += (minutesBetween(ovA[0], ovA[1]) / 60) * rate.price;

      const b0b = makeTime(startMin);
      const b1b = new Date(dayEnd);
      const ovB = isect(a0, a1, b0b, b1b);
      if (ovB) partial += (minutesBetween(ovB[0], ovB[1]) / 60) * rate.price;
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