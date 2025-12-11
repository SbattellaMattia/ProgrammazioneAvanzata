// src/dao/TransitDAO.ts
import { Op } from "sequelize";
import { Transit } from "../models/Transit";
import { DAO } from "./DAO";

export interface ITransitDAO {
  existsById(id: string): Promise<boolean>;
  findByGate(gateId: string): Promise<Transit[]>;
  findByParking(parkingId: string): Promise<Transit[]>;
  findByVehicle(plate: string): Promise<Transit[]>;
  findByPeriod(from: Date, to: Date): Promise<Transit[]>;
}

export class TransitDAO extends DAO<Transit> implements ITransitDAO {
  constructor() {
    super(Transit);
  }

  /** 
   * Verifica l'esistenza di un transito per ID.
   */
  async existsById(id: string): Promise<boolean> {
    const t = await this.findById(id);
    return t !== null;
  }

  /** 
   * Restituisce i transiti filtrati per varco.
   */
  async findByGate(gateId: string): Promise<Transit[]> {
    return this.findAll({where: { gateId }, order: [["date", "ASC"]],});
  }

  /** 
   * Restituisce i transiti filtrati per parcheggio.
   */
  async findByParking(parkingId: string): Promise<Transit[]> {
    return this.findAll({where: { parkingId }, order: [["date", "ASC"]],
    });
  }

  /** 
   * Restituisce i transiti filtrati per targa.
   */
  async findByVehicle(plate: string): Promise<Transit[]> {
    return this.findAll({where: { detectedPlate: plate }, order: [["date", "ASC"]],});
  }

  /** 
   * Restituisce i transiti filtrati per intervallo di tempo.
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