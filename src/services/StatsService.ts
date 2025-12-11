import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import transitDAO from '../dao/TransitDAO';
import vehicleDAO from '../dao/VehicleDAO';
import { TransitType } from "../enum/TransitType";
import { VehicleType } from "../enum/VehicleType";
import { ParkingStatsDTO } from '../dto/ParkingStatsDTO';
import { InvoiceStatus } from '../enum/InvoiceStatus';

class StatsService {

    async getGlobalRevenueStats(from: Date | undefined, to: Date | undefined) {
        // 1. Ottieni TUTTI i parcheggi
        const allParkings = await parkingDAO.findAllParking();

        // 2. Ottieni le fatture
        const startDate = from || new Date(0); // Epoch se undefined
        const endDate = to || new Date();      // Oggi se undefined
        const allInvoices = await invoiceDAO.findInDateRange("dueDate",startDate, endDate);

        // 3. Aggregazione in Memoria
        // Usiamo una Mappa che tiene un OGGETTO con entrambi i contatori
        const statsMap = new Map<string, { total: number; paid: number }>();

        // Inizializza tutto a 0
        allParkings.forEach(p => {
            statsMap.set(p.id.toString(), { total: 0, paid: 0 });
        });

        // Ciclo unico di accumulo
        allInvoices.forEach(invoice => {
            const pId = invoice.parkingId.toString();

            // Se il parcheggio esiste nella mappa
            if (statsMap.has(pId)) {
                const currentStats = statsMap.get(pId)!;
                const amount = parseFloat(invoice.amount?.toString() || '0'); 

                // Aggiorna Totale Fatturato (Tutte le fatture emesse)
                currentStats.total += amount;

                // Aggiorna Incassato (Solo quelle pagate)
                if (invoice.status === InvoiceStatus.PAID) {
                    currentStats.paid += amount;
                }
            }
        });

        // 4. Costruisci il risultato finale
        return allParkings.map(park => {
            const stats = statsMap.get(park.id.toString())!;
            return {
                parkingId: park.id,
                parkingName: park.name,     
                totalRevenue: Number(stats.total.toFixed(2)),
                paidRevenue: Number(stats.paid.toFixed(2))
            };
        });
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

        const allInvoices = await invoiceDAO.findInDateRange("dueDate",startDate,endDate);

        const parkingInvoices = allInvoices.filter((inv) => inv.parkingId === parkingId);

        let total = 0;
        let paidAmount = 0;
        let paidCount = 0;
        let unpaidCount = 0;
        let expiredCount = 0;

        for (const inv of parkingInvoices) {
          const amount = Number(inv.amount ?? 0);
          total += amount;

          const status = (inv.status || "").toUpperCase();

          if (status === "PAID") {
            paidAmount += amount;
            paidCount++;
          } else if (status === "UNPAID") {
            unpaidCount++;
          } else if (status === "EXPIRED") {
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

        type SlotAgg = { total: number; in: number; out: number };
        const slotMap = new Map<string, SlotAgg>();

        type VehicleTypeAgg = Record<string, number>;
        const vehicleTypeCounts: VehicleTypeAgg = {};

        const getSlot = (d: Date): string => {
          const h = d.getHours();
          if (h >= 8 && h < 20) return "08-20";
          return "20-08";
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
