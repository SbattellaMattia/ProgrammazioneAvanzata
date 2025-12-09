import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import transitDAO from '../dao/TransitDAO';
import vehicleDAO from '../dao/VehicleDAO';
import { TransitType } from "../enum/TransitType";
import { VehicleType } from "../enum/VehicleType";



class StatsService {

    async getGlobalRevenueStats(from: Date | undefined, to: Date | undefined) {
        // 1. Ottieni TUTTI i parcheggi
        const allParkings = await parkingDAO.findAllParking();

        // 2. Ottieni le fatture (Gestione date pulita)
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

            // Se il parcheggio esiste nella mappa (sicurezza)
            if (statsMap.has(pId)) {
                const currentStats = statsMap.get(pId)!;
                const amount = parseFloat(invoice.amount?.toString() || '0'); // Safety cast per float

                // Aggiorna Totale Fatturato (Tutte le fatture emesse)
                currentStats.total += amount;

                // Aggiorna Incassato (Solo quelle pagate)
                // IMPORTANTE: Controlla che lo status matchi il tuo ENUM ('PAID', 'paid', etc.)
                if (invoice.status.toUpperCase() === 'PAID') {
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
                totalRevenue: Number(stats.total.toFixed(2)), // Arrotondamento a 2 decimali
                paidRevenue: Number(stats.paid.toFixed(2))
            };
        });
    }

    async getParkingRevenueStats(parking: { id: string; name: string }, from: Date | undefined, to: Date | undefined) {
      const parkingId = parking.id;

      const startDate = from || new Date(0);
      const endDate = to || new Date();

      const allInvoices = await invoiceDAO.findInDateRange("dueDate", startDate, endDate);

      // 3) Filtro SOLO quelle di questo parcheggio
      const parkingInvoices = allInvoices.filter((inv) => inv.parkingId === parkingId);

      // 4) Aggregazione fatturato
      let total = 0;
      let paid = 0;

      for (const inv of parkingInvoices) {
        const amount = Number(inv.amount ?? 0);
        total += amount;

        if (inv.status.toUpperCase() === "PAID") {
          paid += amount;
        }
      }

      // 5) Transiti per questo parcheggio (già ordinati per data in DAO)
      const allTransitsForParking = await transitDAO.findByParking(parkingId);

      // filtro per range temporale (stesso range delle fatture)
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
        if (vehicle && vehicle.type) {
          plateToType.set(plate, vehicle.type as VehicleType);
        } else {
          plateToType.set(plate, "UNKNOWN");
        }
      }

      // 6) Conteggi per tipo transito, fascia oraria, tipo veicolo
      let totalTransits = 0;
      let inCount = 0;
      let outCount = 0;

      type SlotAgg = { total: number; in: number; out: number };
      const slotMap = new Map<string, SlotAgg>();

      type VehicleTypeAgg = Record<string, number>;
      const vehicleTypeCounts: VehicleTypeAgg = {};

      // 🔥 NUOVA LOGICA FASCE ORARIE
      const getSlot = (d: Date): string => {
        const h = d.getHours();
        // 08:00 - 19:59
        if (h >= 8 && h < 20) return "08-20";
        // 20:00 - 07:59
        return "20-08";
      };

      for (const tr of transitsInRange) {
        totalTransits++;

        // fascia oraria
        const slot = getSlot(tr.date);
        if (!slotMap.has(slot)) {
          slotMap.set(slot, { total: 0, in: 0, out: 0 });
        }
        const agg = slotMap.get(slot)!;
        agg.total++;

        // IN / OUT
        if (tr.type === TransitType.IN) {
          inCount++;
          agg.in++;
        } else if (tr.type === TransitType.OUT) {
          outCount++;
          agg.out++;
        }

        // tipo veicolo
        const vType = plateToType.get(tr.vehicleId) ?? "UNKNOWN";
        vehicleTypeCounts[vType] = (vehicleTypeCounts[vType] || 0) + 1;
      }

      const transitsBySlot = Array.from(slotMap.entries())
        .sort((a, b) => a[0].localeCompare(b[0])) // "08-20" prima di "20-08"
        .map(([slot, agg]) => ({
          slot,
          total: agg.total,
          in: agg.in,
          out: agg.out,
        }));

      // 7) Risultato finale
      return {
        parkingId: parking.id,
        parkingName: parking.name,
        from: startDate,
        to: endDate,
        totalRevenue: Number(total.toFixed(2)),
        paidRevenue: Number(paid.toFixed(2)),
        invoiceCount: parkingInvoices.length,
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
  }
}

export default new StatsService();
