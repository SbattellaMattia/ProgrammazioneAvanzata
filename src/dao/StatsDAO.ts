// src/dao/StatsDAO.ts
import { InvoiceDAO } from './InvoiceDAO';
import { TransitDAO } from './TransitDAO';
import { ParkingDAO } from './ParkingDAO';
import { Invoice } from '../models/Invoice';
import { Op } from 'sequelize';

/**
   * Implementazione del Data Access Object (DAO) per le statistiche.
   * Utilizza altri DAO per recuperare i dati necessari.
   * @class StatsDAO
   * @extends DAO<Stats>
   * @implements IStatsDAO
  */
export class StatsDAO {
  private invoiceDAO = new InvoiceDAO();
  private transitDAO = new TransitDAO();
  private parkingDAO = new ParkingDAO();

  /**
   * Ottiene tutte le fatture per un parcheggio in un intervallo di date.
   * @param parkingId - L'ID del parcheggio.
   * @param from - Data di inizio.
   * @param to - Data di fine.
   * @returns Una lista di fatture.
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
   * Ottiene tutte le fatture in un intervallo di date.
   * @param from - Data di inizio.
   * @param to - Data di fine.
   * @returns Una lista di fatture.
   */
  async findInDateRange(from: Date, to: Date): Promise<Invoice[]> {
    return this.invoiceDAO.findAll({
      where: {
        createdAt: { [Op.gte]: from, [Op.lte]: to }
      }
    });
  }
}
