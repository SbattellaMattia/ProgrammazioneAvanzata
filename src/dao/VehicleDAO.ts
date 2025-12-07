// src/dao/VehicleDAO.ts
import { Vehicle } from '../models/Vehicle';
import { DAO } from './DAO';

export interface IVehicleDAO {
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByOwner(userId: string): Promise<Vehicle[]>;
}

/**
 * DAO per gestione veicoli
 * Ottiene automaticamente tutti i metodi CRUD da BaseDAO
 */
export class VehicleDAO extends DAO<Vehicle> implements IVehicleDAO {
  
  constructor() {
    super(Vehicle);
  }

  /**
   * Metodo specifico per Vehicle: trova per targa
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.executeQuery(
      async () => await this.findOne({ targa: plate } as any),
      'findByPlate'
    );
  }

  /**
   * Metodo specifico per Vehicle: trova veicoli per proprietario
   */
  async findByOwner(userId: string): Promise<Vehicle[]> {
    return this.executeQuery(
      async () => await this.findAll({ where: { user_id: userId } }),
      'findByOwner'
    );
  }
}
