// src/dao/VehicleDAO.ts
import { Vehicle } from "../models/Vehicle";
import { DAO } from "./DAO";
import { VehicleType } from "../enum/VehicleType";
import { Op } from "sequelize";

export interface IVehicleDAO {
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByOwner(ownerId: string): Promise<Vehicle[]>;
  existsByPlate(plate: string): Promise<boolean>;
  findByType(type: VehicleType): Promise<Vehicle[]>;
}

export class VehicleDAO extends DAO<Vehicle> implements IVehicleDAO {
  constructor() {
    super(Vehicle);
  }

  /**
   * Trova un veicolo per targa.
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.executeQuery(
      async () => await this.findOne({ where: { plate } }),
      "findByPlate"
    );
  }

  /**
   * Restituisce true se la targa esiste nel DB.
   */

  // da capire se usare o no 
  async existsByPlate(plate: string): Promise<boolean> {
    const v = await this.findByPlate(plate);
    return v !== null;
  }

  /**
   * Restituisce i veicoli di un proprietario.
   */
  async findByOwner(ownerId: string): Promise<Vehicle[]> {
    return this.executeQuery(
      async () => await this.findAll({ where: { ownerId } }),
      "findByOwner"
    );
  }

  /**
   * Trova tutti i veicoli di un certo tipo.
   */
  async findByType(type: VehicleType): Promise<Vehicle[]> {
    return this.executeQuery(
      async () => await this.findAll({ where: { type } }),
      "findByType"
    );
  }
}