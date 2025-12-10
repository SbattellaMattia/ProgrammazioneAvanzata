import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import userDAO from '../dao/UserDAO';
import vehicleDAO from '../dao/VehicleDAO';
import { PdfGenerator } from '../utils/PdfGenerator';
import { ForbiddenError, NotFoundError } from '../errors/CustomErrors';
import { WhereOptions } from 'sequelize/types';
import { Role } from '../enum/Role';
import Invoice from '../models/Invoice';



class InvoiceService {



    async getAllFrom(from?: Date, to?: Date, state?: string): Promise<any[]> {
        return await invoiceDAO.findInDateRange('createdAt', from, to, { status: state });
    }


    /*async getAll(userId: string, userRole: Role.DRIVER | Role.OPERATOR) {
        if (userRole === Role.DRIVER) {
            return await invoiceDAO.findAll({ where: { userId }, order: [['createdAt', 'DESC']] });
        }
        return await invoiceDAO.findAll({ order: [['createdAt', 'DESC']] });
    }*/

    async getById(id: string) {
        return await invoiceDAO.findById(id);
    }


    private async resolveAllowedPlates(userId: string, userRole: Role.DRIVER | Role.OPERATOR, requestedPlates?: string[]) {
        console.log('Resolving allowed plates for user:', userId, 'role:', userRole, 'requestedPlates:', requestedPlates);
        if (userRole === Role.OPERATOR) {
            return requestedPlates || [];
        }
        const myVehicles = await vehicleDAO.findByOwner(userId);
        const myPlates = myVehicles.map(v => v.plate);

        if (requestedPlates && requestedPlates.length > 0) {
            const invalid = requestedPlates.filter(p => !myPlates.includes(p));
            if (invalid.length > 0) {
                throw new ForbiddenError(`Non hai i permessi per le targhe: ${invalid.join(', ')}`);
            }
            return requestedPlates;
        }
        return myPlates;
    }


    async getAll(userId: string, userRole: Role.DRIVER | Role.OPERATOR, from?: Date, to?: Date, additionalWhere : WhereOptions<any> = {}): Promise<any[]> {
    const allowedPlates = await this.resolveAllowedPlates(userId, userRole);
    
    const where: any = { ...additionalWhere };

    userRole === Role.DRIVER? where.userId = userId : null;
    
    return await invoiceDAO.findInDateRange('createdAt', from, to, where);
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
