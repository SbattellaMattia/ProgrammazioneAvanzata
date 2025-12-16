// src/dao/TransitDAO.ts
import { Op } from "sequelize";
import { Transit } from "../models/Transit";
import { DAO } from "./DAO";

/**
 * DAO per gestione transiti
 * Estende DAO per avere CRUD automatico
 * @interface ITransitDAO
 * @class TransitDAO
 */
export interface ITransitDAO {
  existsById(id: string): Promise<boolean>;
  findByGate(gateId: string): Promise<Transit[]>;
  findByParking(parkingId: string): Promise<Transit[]>;
  findByVehicle(plate: string): Promise<Transit[]>;
  findByPeriod(from: Date, to: Date): Promise<Transit[]>;
}

/**
 * DAO per gestione transiti
 * Estende DAO per avere CRUD automatico
 * @class TransitDAO
 * @extends DAO<Transit>
 * @implements ITransitDAO
 */
export class TransitDAO extends DAO<Transit> implements ITransitDAO {
  constructor() {
    super(Transit);
  }

  /** 
   * Verifica se un transito esiste dato il suo ID.
   * @param id - L'ID del transito da verificare.
   * @returns True se il transito esiste, altrimenti false.
   */
  async existsById(id: string): Promise<boolean> {
    const t = await this.findById(id);
    return t !== null;
  }

  /** 
   * Restituisce i transiti filtrati per gate.
   * @param gateId - L'ID del gate.
   * @returns Una lista di transiti associati al gate specificato.
   */
  async findByGate(gateId: string): Promise<Transit[]> {
    return this.findAll({where: { gateId }, order: [["date", "ASC"]],});
  }

  /** 
   * Restituisce i transiti filtrati per parcheggio.
   * @param parkingId - L'ID del parcheggio.
   * @returns Una lista di transiti associati al parcheggio specificato.
   */
  async findByParking(parkingId: string): Promise<Transit[]> {
    return this.findAll({where: { parkingId }, order: [["date", "ASC"]],
    });
  }

  /** 
   * Restituisce i transiti filtrati per veicolo (targa).
   * @param plate - La targa del veicolo.
   * @returns Una lista di transiti associati al veicolo specificato.
   */
  async findByVehicle(plate: string): Promise<Transit[]> {
    return this.findAll({where: { detectedPlate: plate }, order: [["date", "ASC"]],});
  }

  /** 
   * Restituisce i transiti in un intervallo di date.
   * @param from - Data di inizio intervallo.
   * @param to - Data di fine intervallo.
   * @returns Una lista di transiti nell'intervallo specificato.
   */
  async findByPeriod(from: Date, to: Date): Promise<Transit[]> {
    return this.findAll({
      where: {
        date: {
          [Op.between]: [from, to],
        },
      },
      order: [["date", "ASC"]],
    });
  }
}

export default new TransitDAO();