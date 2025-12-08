// src/dao/ParkingDAO.ts
import Parking from "../models/Parking";
import { DAO } from "./DAO";

export interface IParkingDAO {
  existsById(id: string): Promise<boolean>;
  findAllParking(): Promise<Parking[]>;
  getCapacity(id: string): Promise<{ car: number; motorcycle: number; truck: number } | null>;
}

export class ParkingDAO extends DAO<Parking> implements IParkingDAO {
  constructor() {
    super(Parking);
  }

  /** 
   * Verifica l'esistenza di un parcheggio per ID. 
   */
  async existsById(id: string): Promise<boolean> {
    const p = await this.findById(id);
    return p !== null;
  }

  /** 
   * Restituisce tutti i parcheggi ordinati per nome. 
   */
  async findAllParking(): Promise<Parking[]> {
    return this.findAll({ order: [["name", "ASC"]] });
  }

  /** 
   * Restituisce la capacità del parcheggio per tipo veicolo. 
   */
  async getCapacity(id: string): Promise<{ car: number; motorcycle: number; truck: number } | null> {
    const parking = await this.findById(id);
    if (!parking) return null;
    return {
      car: parking.carCapacity,
      motorcycle: parking.motorcycleCapacity,
      truck: parking.truckCapacity,
    };
  }
}

export default new ParkingDAO();