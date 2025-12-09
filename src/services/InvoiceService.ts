import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import userDAO from '../dao/UserDAO';
import { PdfGenerator } from '../utils/PdfGenerator';
import { NotFoundError } from '../errors/CustomErrors'; 
class InvoiceService {


    async getAll() {
        return await invoiceDAO.findAll();
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
        const pdfBuffer = await PdfGenerator.createPaymentSlip({
            userId: invoice.userId,
            user: user ? user.name : 'Utente Sconosciuto',
            invoiceId: invoice.id.toString(),
            amount: amountNumber,
            parkingName: parkingName,
            dueDate: invoice.dueDate
        });

        return pdfBuffer;
    }
}

export default new InvoiceService();
