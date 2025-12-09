// src/dao/InvoiceDAO.ts
import { Op } from "sequelize";
import Invoice from "../models/Invoice";
import { DAO } from "./DAO";

export interface IInvoiceDAO {
  existsById(id: string): Promise<boolean>;
  findForUser(userId: string): Promise<Invoice[]>;
  findForParking(parkingId: string, from: Date, to: Date): Promise<Invoice[]>;
}

export class InvoiceDAO extends DAO<Invoice> implements IInvoiceDAO {
  constructor() {
    super(Invoice);
  }

  /**
   * Controlla se una fattura esiste
   */
  async existsById(id: string): Promise<boolean> {
    const invoice = await this.findById(id);
    return invoice !== null;
  }

  /**
   * Restituisce tutte le fatture associate a un utente 
   */
  async findForUser(userId: string): Promise<Invoice[]> {
    return this.findAll({where: { userId },order: [["createdAt", "DESC"]],});}

  /**
   * Restituisce tutte le fatture di un parcheggio 
   */
  async findForParking(parkingId: string, from: Date, to: Date): Promise<Invoice[]> {
    return this.findAll({where: { parkingId, createdAt: { $gte: from, $lte: to } },order: [["createdAt", "DESC"]],});
  }
}
export default new InvoiceDAO();