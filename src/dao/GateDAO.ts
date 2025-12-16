// src/dao/GateDAO.ts
import Gate from "../models/Gate";
import { DAO } from "./DAO";
import { GateType } from "../enum/GateType";
import { GateDirection } from "../enum/GateDirection";

/**
 * Interfaccia per il Data Access Object (DAO) dei varchi.
 * Definisce i metodi per interagire con i dati dei varchi.
 * @interface IGateDAO
 * @class GateDAO
 */
export interface IGateDAO {
  existsById(id: string): Promise<boolean>;
  findByParking(parkingId: string): Promise<Gate[]>;
  findByType(type: GateType): Promise<Gate[]>;
  findByDirection(direction: GateDirection): Promise<Gate[]>;
}

/**
 * Implementazione del Data Access Object (DAO) per i varchi.
 * Estende la classe generica DAO e implementa l'interfaccia IGateDAO.
 * @class GateDAO
 * @extends DAO<Gate>
 * @implements IGateDAO
 */
export class GateDAO extends DAO<Gate> implements IGateDAO {
  constructor() {
    super(Gate);
  }

  /**
   * Verifica se un varco esiste dato il suo ID.
   * @param id - L'ID del varco da verificare.
   * @returns True se il varco esiste, altrimenti false.
   */
  async existsById(id: string): Promise<boolean> {
    const gate = await this.findById(id);
    return gate !== null;
  }

  /**
   * Restituisce i varchi associati a un determinato parcheggio.
   * @param parkingId - L'ID del parcheggio.
   * @returns Una lista di varchi associati al parcheggio.
   */
  async findByParking(parkingId: string): Promise<Gate[]> {
    return this.findAll({
      where: { parkingId },
      order: [["createdAt", "ASC"]],
    });
  }

  /**
   * Restituisce i varchi filtrati per tipo (ingresso/uscita/bidirezionale).
   * @param type - Il tipo di varco.
   * @returns Una lista di varchi del tipo specificato.
   */
  async findByType(type: GateType): Promise<Gate[]> {
    return this.findAll({
      where: { type },
      order: [["createdAt", "ASC"]],
    });
  }

  /**
   * Restituisce i varchi filtrati per direzione (entrata/uscita).
   * @param direction - La direzione del varco.
   * @returns Una lista di varchi della direzione specificata.
   */
  async findByDirection(direction: GateDirection): Promise<Gate[]> {
    return this.findAll({
      where: { direction },
      order: [["createdAt", "ASC"]],
    });
  }
}