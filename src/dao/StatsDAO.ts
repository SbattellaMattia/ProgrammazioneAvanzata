// src/dao/StatsDAO.ts
import { InvoiceDAO } from './InvoiceDAO';
import { TransitDAO } from './TransitDAO';
import { ParkingDAO } from './ParkingDAO';
import { Invoice } from '../models/Invoice';
import { Op } from 'sequelize';

export class StatsDAO {
  private invoiceDAO = new InvoiceDAO();
  private transitDAO = new TransitDAO();
  private parkingDAO = new ParkingDAO();

  /**
   * Ottiene il fatturato per ogni parcheggio.
   * Logica:
   * 1. Recupera lista parcheggi (per avere i nomi).
   * 2. Recupera fatturati aggregati.
   * 3. Unisce i dati.
   */
  async findForParking(parkingId: string, from: Date, to: Date): Promise<Invoice[]> {
    return this.invoiceDAO.findAll({
      where: { 
        parkingId, 
        // Nota: Assumo tu usi Sequelize operators (Op.gte) e non sintassi Mongo ($gte)
        createdAt: { [Op.gte]: from, [Op.lte]: to } 
      },
      order: [["createdAt", "DESC"]],
    });
  }

  /**
   * NUOVO: Ottiene tutte le fatture in un range temporale (senza filtrare per parcheggio)
   * Fondamentale per evitare il loop nel Service.
   */
  async findInDateRange(from: Date, to: Date): Promise<Invoice[]> {
    return this.invoiceDAO.findAll({
      where: {
        createdAt: { [Op.gte]: from, [Op.lte]: to }
      }
    });
  }
}
