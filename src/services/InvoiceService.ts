import invoiceDAO from '../dao/InvoiceDAO';
import parkingDAO from '../dao/ParkingDAO';
import userDAO from '../dao/UserDAO';
import vehicleDAO from '../dao/VehicleDAO';
import transitDAO from '../dao/TransitDAO';
import { PdfGenerator } from '../utils/PdfGenerator';
import { ForbiddenError, NotFoundError } from '../errors/CustomErrors';
import { WhereOptions } from 'sequelize/types';
import { Role } from '../enum/Role';
import rateCalculator from '../utils/Invoice/BillingCalculator';
import { InvoiceStatus } from '../enum/InvoiceStatus';


/**
 * @class InvoiceService
 * @description Servizio di business logic per gestione fatture parcheggio.
 * Gestisce creazione automatica fatture da transiti ingresso/uscita, generazione PDF bollettini
 * con QR code pagamento, controlli autorizzazioni RBAC (Role-Based Access Control) e stato pagamenti.
 * Implementa requisiti: pagamento entro 24h da uscita, QR "userId:id:importo".
 * 
 */
class InvoiceService {

    /**
   * @private
   * @method resolveAllowedPlates
   * @description Risolve le targhe autorizzate per l'utente basandosi sul ruolo.
   * OPERATOR: tutte le targhe richieste
   * DRIVER: solo targhe dei propri veicoli
   * 
   * @param userId - ID utente richiedente
   * @param userRole - Ruolo (DRIVER|OPERATOR)
   * @param requestedPlates - Targhe opzionali richieste
   * @returns Promise<string[]> - Targhe autorizzate
   * @throws ForbiddenError - Driver richiede targhe non proprie
   */
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

    /**
   * Recupera fatture con filtri temporali e condizioni aggiuntive.
   * DRIVER vede solo proprie fatture, OPERATOR vede tutto.
   * 
   * @param userId - ID utente autenticato
   * @param userRole - Ruolo utente
   * @param from - Data inizio (opzionale)
   * @param to - Data fine (opzionale)
   * @param additionalWhere - Clausole WHERE Sequelize aggiuntive
   * @returns Promise<any[]> - Array fatture
   */
    async getAll(userId: string, userRole: Role.DRIVER | Role.OPERATOR, from?: Date, to?: Date, additionalWhere: WhereOptions<any> = {}): Promise<any[]> {
        const where: any = { ...additionalWhere };
        userRole === Role.DRIVER ? where.userId = userId : null;
        return await invoiceDAO.findInDateRange('createdAt', from, to, where);
    }

    /**
  * Recupera singola fattura per ID.
  * 
  * @param id - ID fattura
  * @returns Promise<any | null> - Fattura o null
  */
    async getById(id: string) {
        return await invoiceDAO.findById(id);
    }

    /**
   * Recupera fattura verificando autorizzazioni utente.
   * DRIVER accede solo alle proprie fatture.
   * 
   * @param invoiceId - ID fattura
   * @param userId - ID utente richiedente
   * @returns Promise<any> - Fattura autorizzata
   * @throws NotFoundError - Fattura o utente non trovato
   * @throws ForbiddenError - Driver non autorizzato
   */
    async getByUserId(invoiceId: string, userId: string) {
        const invoice = await invoiceDAO.findById(invoiceId);
        if (!invoice) {
            throw new NotFoundError("Fattura", invoiceId);
        }

        const user = await userDAO.findById(invoice.userId);
        const searcher = await userDAO.findById(userId);
        if (!user) { throw new NotFoundError(`Nessun utente associato alla fattura con ID ${invoiceId}`); }
        if (!searcher) { throw new NotFoundError("Utente", userId); }

        if (searcher.role === Role.DRIVER && user.id !== searcher.id) {
            throw new ForbiddenError('Non sei autorizzato a vedere o pagare questa fattura');
        }
        return invoice;

    }


    /**
   * Genera PDF bollettino pagamento con QR code.
   * QR contiene: "userId:id:importo" come specificato nelle specifiche.
   * 
   * @param invoiceId - ID fattura
   * @param userId - ID utente autorizzato
   * @returns Promise<Buffer> - Buffer PDF generato
   * @throws NotFoundError - Fattura non trovata
   * @throws ForbiddenError - Utente non autorizzato
   */
    async generateInvoicePdf(invoiceId: string, userId: string): Promise<Buffer> {

        // 1. Recupera la fattura
        const invoice = await this.getByUserId(invoiceId, userId);
        if (!invoice) {
            throw new NotFoundError("Fattura", invoiceId);
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


    /**
   * Crea fattura automatica da transiti ingresso/uscita.
   * Chiamata dal System all'uscita veicolo (generazione automatica).
   * 
   * @param userId - Proprietario veicolo
   * @param parkingId - Parcheggio
   * @param entryTransitId - Transito ingresso
   * @param exitTransitId - Transito uscita
   * @returns Promise<any> - Fattura creata
   * @throws NotFoundError - Transito non trovato
   */
    async createInvoiceFromTransits(userId: string, parkingId: string, entryTransitId: string, exitTransitId: string) {
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
        } as any);

        return invoice;
    }


    /**
   * Segna fattura come pagata (logica pagamento non implementata).
   * Controlli: non già pagata, non scaduta.
   * 
   * @param invoiceId - ID fattura
   * @param userId - Utente pagante
   * @throws ForbiddenError - Già pagata o scaduta
   */
    async pay(invoiceId: string, userId: string) {
        const invoice = await this.getByUserId(invoiceId, userId);
        // Se è già pagata, niente da fare
        if (invoice.status === InvoiceStatus.PAID) {
            throw new ForbiddenError('La fattura risulta già pagata');
        }

        // Controllo scadenza
        if (invoice.dueDate && invoice.dueDate < new Date()) {
            throw new ForbiddenError('La fattura è scaduta e non può essere pagata');
        }
        invoice.status = InvoiceStatus.PAID;
        await invoice.save();
    }
}

export default new InvoiceService();
