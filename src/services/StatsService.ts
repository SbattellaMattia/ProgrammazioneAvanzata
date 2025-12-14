import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import transitDAO from '../dao/TransitDAO';
import vehicleDAO from '../dao/VehicleDAO';
import { TransitType } from "../enum/TransitType";
import { VehicleType } from "../enum/VehicleType";
import { ParkingStatsDTO } from '../dto/StatsDTO';
import { GlobalParkingStatsDTO } from '../dto/StatsDTO';
import { AvgFreeSlotsDTO } from '../dto/StatsDTO';
import { InvoiceStatus } from '../enum/InvoiceStatus';
import { calculateAvgFreeSlotsTotal } from '../utils/HelperAvgSlot';

class StatsService {

  async getGlobalParkingStats(from: Date | undefined, to: Date | undefined): Promise<GlobalParkingStatsDTO[]> {
    const startDate = from || new Date(0);
    const endDate = to || new Date();
    const allParkings = await parkingDAO.findAllParking();
    const allInvoices = await invoiceDAO.findInDateRange("createdAt", startDate, endDate);
    const results: GlobalParkingStatsDTO[] = [];

    for (const park of allParkings) {
      const parkingId = park.id.toString();

      const parkingInvoices = allInvoices.filter(inv => inv.parkingId.toString() === parkingId);

      let totalRevenue = 0;
      let paidRevenue = 0;

      for (const inv of parkingInvoices) {
        const amount = Number(inv.amount ?? 0);
        totalRevenue += amount;
        if (inv.status === InvoiceStatus.PAID) paidRevenue += amount;
      }

      const totalCapacity =
        Number(park.carCapacity ?? 0) +
        Number(park.motorcycleCapacity ?? 0) +
        Number(park.truckCapacity ?? 0);

      const allTransitsForParking = await transitDAO.findByParking(parkingId);

      const transitsInRange = allTransitsForParking.filter(t => {
        const d = t.date;
        return d >= startDate && d <= endDate;
      });

      // --- AVG FREE SLOTS (TOT) per slot ---
      const avgFreeSlots: AvgFreeSlotsDTO = calculateAvgFreeSlotsTotal({
        transits: transitsInRange.map(t => ({
          date: t.date,
          type: t.type === TransitType.IN ? "in" : "out",
        })),
        totalCapacity,
        startDate,
        endDate,
      });

      results.push({
        parkingId: park.id,
        parkingName: park.name,
        from: startDate,
        to: endDate,
        totalRevenue: Number(totalRevenue.toFixed(2)),
        paidRevenue: Number(paidRevenue.toFixed(2)),
        capacity: { total: totalCapacity },
        avgFreeSlots,
      });
    }

    return results;
  }

  // Ottieni statistiche di un singolo parcheggio
  async getParkingRevenueStats(
    parking: { id: string; name: string },
    from: Date | undefined,
    to: Date | undefined
  ): Promise<ParkingStatsDTO> {
    const parkingId = parking.id;

    const startDate = from || new Date(0);
    const endDate = to || new Date();

    const allInvoices = await invoiceDAO.findInDateRange("createdAt", startDate, endDate);
    const parkingInvoices = allInvoices.filter((inv) => inv.parkingId === parkingId);

    let total = 0;
    let paidAmount = 0;
    let paidCount = 0;
    let unpaidCount = 0;
    let expiredCount = 0;

    for (const inv of parkingInvoices) {
      const amount = Number(inv.amount ?? 0);
      total += amount;

      if (inv.status === InvoiceStatus.PAID) {
        paidAmount += amount;
        paidCount++;
      } else if (inv.status === InvoiceStatus.UNPAID) {
        unpaidCount++;
      } else if (inv.status === InvoiceStatus.EXPIRED) {
        expiredCount++;
      }
    }

    const allTransitsForParking = await transitDAO.findByParking(parkingId);

    const transitsInRange = allTransitsForParking.filter((t) => {
      const d = t.date;
      return d >= startDate && d <= endDate;
    });

    const uniquePlates = Array.from(
      new Set(transitsInRange.map((t) => t.vehicleId))
    );
    const plateToType = new Map<string, VehicleType | "UNKNOWN">();

    for (const plate of uniquePlates) {
      const vehicle = await vehicleDAO.findByPlate(plate);
      if (vehicle && (vehicle as any).type) {
        plateToType.set(plate, (vehicle as any).type as VehicleType);
      } else {
        plateToType.set(plate, "UNKNOWN");
      }
    }

    let totalTransits = 0;
    let inCount = 0;
    let outCount = 0;

    const slotMap = new Map<string, { total: number; in: number; out: number }>();
    const vehicleTypeCounts: Record<string, number> = {};

    const getSlot = (d: Date): string => {
      const h = d.getHours();
      const startHour = Math.floor(h / 2) * 2;
      const endHour = startHour + 2;

      const pad = (n: number) => n.toString().padStart(2, "0");

      return `${pad(startHour)}-${pad(endHour)}`;
    };

    for (const tr of transitsInRange) {
      totalTransits++;

      const slot = getSlot(tr.date);
      if (!slotMap.has(slot)) {
        slotMap.set(slot, { total: 0, in: 0, out: 0 });
      }
      const agg = slotMap.get(slot)!;
      agg.total++;

      if (tr.type === TransitType.IN) {
        inCount++;
        agg.in++;
      } else if (tr.type === TransitType.OUT) {
        outCount++;
        agg.out++;
      }

      const vType = plateToType.get(tr.vehicleId) ?? "UNKNOWN";
      vehicleTypeCounts[vType] = (vehicleTypeCounts[vType] || 0) + 1;
    }

    const transitsBySlot = Array.from(slotMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([slot, agg]) => ({
        slot,
        total: agg.total,
        in: agg.in,
        out: agg.out,
      }));


    const result: ParkingStatsDTO = {
      parkingId: parking.id,
      parkingName: parking.name,
      from: startDate,
      to: endDate,
      totalRevenue: Number(total.toFixed(2)),
      paidRevenue: Number(paidAmount.toFixed(2)),
      invoiceCount: parkingInvoices.length,
      invoiceCountByStatus: {
        paid: paidCount,
        unpaid: unpaidCount,
        expired: expiredCount,
      },
      transits: {
        total: totalTransits,
        byType: {
          in: inCount,
          out: outCount,
        },
        byVehicleType: vehicleTypeCounts,
        bySlot: transitsBySlot,
        list: transitsInRange,
      },
    };

    return result;
  }
}

export default new StatsService();
