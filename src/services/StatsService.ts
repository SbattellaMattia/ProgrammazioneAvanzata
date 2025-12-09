import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';

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
}

export default new StatsService();
