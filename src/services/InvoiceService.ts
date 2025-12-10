import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import userDAO from '../dao/UserDAO';
import transitDAO from "../dao/TransitDAO"
import { PdfGenerator } from '../utils/PdfGenerator';
import { NotFoundError } from '../errors/CustomErrors'; 
import rateCalculator from '../utils/Invoice/BillingCalculator';

class InvoiceService {
    /**
     * Recupera tutte le fatture.
     */
    async getAll(){
        return await invoiceDAO.findAll();
    }

    /**
     * Recupera tutte le fatture in un intervallo di date e con uno specifico stato.
     */
    async getAllFrom(from: Date, to: Date, state: string): Promise<any[]> {
        return await invoiceDAO.findInDateRange('dueDate', from, to, { status: state }); //cambiare due date non esiste
    }

    /**
     * Genera il PDF del bollettino per una specifica fattura.
     * Restituisce il Buffer del PDF.
     */
    async generateInvoicePdf(invoiceId: string): Promise<Buffer> {

        // 1. Recupera la fattura
        const invoice = await invoiceDAO.findById(invoiceId);
        if (!invoice) {
            throw new NotFoundError(`Fattura con ID ${invoiceId} non trovata`);
        }

        // 2. Recupera Info Parcheggio (Serve il nome per il PDF)
        // Se la tua invoiceDAO.findById fa già include del Parking, puoi saltare questo step
        const parking = await parkingDAO.findById(invoice.parkingId);
        const user = await userDAO.findById(invoice.userId);
        const parkingName = parking ? parking.name : 'Parcheggio Generico';

        // 3. Normalizza i dati per il generatore PDF
        // Sequelize DECIMAL può tornare stringa, lo convertiamo in numero per toFixed
        const amountNumber = typeof invoice.amount === 'string'
            ? parseFloat(invoice.amount)
            : invoice.amount;

        // 4. Genera il PDF usando l'Utility
        const pdfBuffer = await PdfGenerator.createPayment({
            userId: invoice.userId,
            user: user ? user.name : 'Utente Sconosciuto',
            invoiceId: invoice.id.toString(),
            amount: amountNumber,
            parkingName: parkingName,
            dueDate: invoice.dueDate
        });

        return pdfBuffer;
    }

    async createInvoiceFromTransits(userId: string,parkingId: string,entryTransitId: string,exitTransitId: string) {
        // calcolo amount tramite RateCalculator
        const { amount /*, context */ } = await rateCalculator.calcFromTransits(
            entryTransitId,
            exitTransitId
        );

        // Recupero il transito di uscita
        const exitTransit = await transitDAO.findById(exitTransitId);
        if (!exitTransit) {
            throw new NotFoundError("Transit", exitTransitId);
        }

        // dueDate = data uscita + 24 ore
        const dueDate = new Date(exitTransit.date);
        dueDate.setHours(dueDate.getHours() + 24);
        
        // creo la fattura con quell'importo
        const invoice = await invoiceDAO.create({
            userId,
            parkingId,
            entryTransitId,
            exitTransitId,
            amount,              
            status: "unpaid",
            dueDate: dueDate,
            qrPath: null,
        } as any);

        return invoice;
        }
}

export default new InvoiceService();
