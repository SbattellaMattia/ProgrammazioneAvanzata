// src/dao/GateDAO.ts
import Gate from "../models/Gate";
import { DAO } from "./DAO";
import { GateType } from "../enum/GateType";
import { GateDirection } from "../enum/GateDirection";

export interface IGateDAO {
  existsById(id: string): Promise<boolean>;
  findByParking(parkingId: string): Promise<Gate[]>;
  findByType(type: GateType): Promise<Gate[]>;
  findByDirection(direction: GateDirection): Promise<Gate[]>;
}

export class GateDAO extends DAO<Gate> implements IGateDAO {
  constructor() {
    super(Gate);
  }

  /**
   * Controlla se un varco esiste.
   */
  async existsById(id: string): Promise<boolean> {
    const gate = await this.findById(id);
    return gate !== null;
  }

  /**
   * Restituisce tutti i varchi di un parcheggio.
   */
  async findByParking(parkingId: string): Promise<Gate[]> {
    return this.findAll({
      where: { parkingId },
      order: [["createdAt", "ASC"]],
    });
  }

  /**
   * Restituisce i varchi filtrati per tipo (standard, smart).
   */
  async findByType(type: GateType): Promise<Gate[]> {
    return this.findAll({
      where: { type },
      order: [["createdAt", "ASC"]],
    });
  }

  /**
   * Restituisce i varchi filtrati per direzione (in/out/bidirezionale).
   */
  async findByDirection(direction: GateDirection): Promise<Gate[]> {
    return this.findAll({
      where: { direction },
      order: [["createdAt", "ASC"]],
    });
  }
}