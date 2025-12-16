import Invoice from "../models/Invoice";
import { DAO } from "./DAO";
import { InvoiceStatus } from "../enum/InvoiceStatus";

/**
 * Interfaccia per il Data Access Object (DAO) delle fatture.
 * Definisce i metodi per interagire con i dati delle fatture.
 * @interface IInvoiceDAO
 * @class InvoiceDAO
 */
export interface IInvoiceDAO {
  existsById(id: string): Promise<boolean>;
  pay(id: string): Promise<void>;
  findForUser(userId: string): Promise<Invoice[]>;
  findForParking(parkingId: string, from: Date, to: Date): Promise<Invoice[]>;
}

/**
 * Implementazione del Data Access Object (DAO) per le fatture.
 * Estende la classe generica DAO e implementa l'interfaccia IInvoiceDAO.
 * @class InvoiceDAO
 * @extends DAO<Invoice>
 * @implements IInvoiceDAO
 */
export class InvoiceDAO extends DAO<Invoice> implements IInvoiceDAO {
  constructor() {
    super(Invoice);
  }

  /**
   * Verifica se una fattura esiste dato il suo ID.
   * @param id - L'ID della fattura da verificare.
   * @returns True se la fattura esiste, altrimenti false.
   */
  async existsById(id: string): Promise<boolean> {
    const invoice = await this.findById(id);
    return invoice !== null;
  }

  /**
   * Segna una fattura come pagata dato il suo ID.
   * @param id - L'ID della fattura da pagare.
   */
  async pay(id: string): Promise<void> {
    const invoice = await this.findById(id);
    if (invoice) {
      await invoice.update({ status: InvoiceStatus.PAID });
    }
  }

  /**
   * Restituisce tutte le fatture di un utente.
   * @param userId - L'ID dell'utente.  
   * @returns Una lista di fatture associate all'utente.
   */
  async findForUser(userId: string): Promise<Invoice[]> {
    return this.findAll({where: { userId },order: [["createdAt", "DESC"]],});}

  /**
   * Restituisce le fatture di un parcheggio in un intervallo di date.
   * @param parkingId - L'ID del parcheggio.
   * @param from - Data di inizio dell'intervallo.
   * @param to - Data di fine dell'intervallo.
   * @returns Una lista di fatture associate al parcheggio nell'intervallo specificato.
   */
  async findForParking(parkingId: string, from: Date, to: Date): Promise<Invoice[]> {
    return this.findAll({where: { parkingId, createdAt: { $gte: from, $lte: to } },order: [["createdAt", "DESC"]],});
  }
}

export default new InvoiceDAO();