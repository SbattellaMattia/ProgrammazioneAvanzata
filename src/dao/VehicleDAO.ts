// src/dao/VehicleDAO.ts
import { Vehicle } from "../models/Vehicle";
import { DAO } from "./DAO";
import { VehicleType } from "../enum/VehicleType";

export interface IVehicleDAO {
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByOwner(ownerId: string): Promise<Vehicle[]>;
  existsByPlate(plate: string): Promise<boolean>;
  findByType(type: VehicleType): Promise<Vehicle[]>;
  findAllVehicles(): Promise<Vehicle[]>;
}

export class VehicleDAO extends DAO<Vehicle> implements IVehicleDAO {
  constructor() {
    super(Vehicle);
  }

  /**
   * Trova un veicolo per targa.
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.findOne({ plate });  
}

  /**
   * Restituisce true se la targa esiste nel DB.
   */
  async existsByPlate(plate: string): Promise<boolean> {
    return (await this.findByPlate(plate)) !== null;
  }

  /**
   * Restituisce i veicoli di un proprietario.
   */
  async findByOwner(ownerId: string): Promise<Vehicle[]> {
    return this.findAll({ where: { ownerId } });
  }

  /**
   * Trova tutti i veicoli di un certo tipo.
   */
  async findByType(type: VehicleType): Promise<Vehicle[]> {
    return this.findAll({ where: { type } });
  }

  /**
   * Restituisce tutti i veicoli.
   */
  async findAllVehicles(): Promise<Vehicle[]> {
    return this.findAll();
  }
}

export default new VehicleDAO();