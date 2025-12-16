// src/dao/ParkingDAO.ts
import Parking from "../models/Parking";
import { DAO } from "./DAO";

/**
 * Interfaccia per il Data Access Object (DAO) dei parcheggi.
 * Definisce i metodi per interagire con i dati dei parcheggi.
 * @interface IParkingDAO
 * @class ParkingDAO
 */
export interface IParkingDAO {
  existsById(id: string): Promise<boolean>;
  findAllParking(): Promise<Parking[]>;
  getCapacity(id: string): Promise<{ car: number; motorcycle: number; truck: number } | null>;
  updateCapacity(id: string, payload: Partial<Pick<Parking, "carCapacityRemain" | "motorcycleCapacityRemain" | "truckCapacityRemain">>): Promise<Parking | null>;
}

/**
 * Implementazione del Data Access Object (DAO) per i parcheggi.
 * Estende la classe generica DAO e implementa l'interfaccia IParkingDAO.
 * @class ParkingDAO
 * @extends DAO<Parking>
 * @implements IParkingDAO
 */
export class ParkingDAO extends DAO<Parking> implements IParkingDAO {
  constructor() {
    super(Parking);
  }

  /** 
   * Verifica se un parcheggio esiste dato il suo ID. 
   * @param id - L'ID del parcheggio da verificare.
   * @returns True se il parcheggio esiste, altrimenti false.
   */
  async existsById(id: string): Promise<boolean> {
    const p = await this.findById(id);
    return p !== null;
  }

  /** 
   * Restituisce tutti i parcheggi. 
   * @returns Una lista di tutti i parcheggi.
   */
  async findAllParking(): Promise<Parking[]> {
    return this.findAll({ order: [["name", "ASC"]] });
  }

  /** 
   * Restituisce la capacità rimanente di un parcheggio dato il suo ID.
   * @param id - L'ID del parcheggio.
   * @returns Un oggetto con le capacità rimanenti per auto, moto e camion, o null se il parcheggio non esiste.
   */
  async getCapacity(id: string): Promise<{ car: number; motorcycle: number; truck: number } | null> {
    const parking = await this.findById(id);
    if (!parking) return null;
    return {
      car: parking.carCapacityRemain,
      motorcycle: parking.motorcycleCapacityRemain,
      truck: parking.truckCapacityRemain,
    };
  }

  /** 
   * Aggiorna la capacità rimanente di un parcheggio.
   * @param id - L'ID del parcheggio da aggiornare.
   * @param payload - Un oggetto contenente le nuove capacità rimanenti.
   * @returns Il parcheggio aggiornato o null se il parcheggio non esiste.
   */
  async updateCapacity(
    id: string,
    payload: Partial<Pick<Parking, "carCapacityRemain" | "motorcycleCapacityRemain" | "truckCapacityRemain">>
  ): Promise<Parking | null> {
    return this.update(id, payload);
  }

}

export default new ParkingDAO();