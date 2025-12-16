// src/dao/VehicleDAO.ts
import { Vehicle } from "../models/Vehicle";
import { DAO } from "./DAO";
import { VehicleType } from "../enum/VehicleType";

/**
 * Interfaccia per il DAO dei veicoli.
 * Contiene i metodi specifici per la gestione dei veicoli.
 * @interface IVehicleDAO
 * @class VehicleDAO
 */
export interface IVehicleDAO {
  findByPlate(plate: string): Promise<Vehicle | null>;
  findByOwner(ownerId: string): Promise<Vehicle[]>;
  existsByPlate(plate: string): Promise<boolean>;
  findByType(type: VehicleType): Promise<Vehicle[]>;
  findAllVehicles(): Promise<Vehicle[]>;
}

/**
 * Classe DAO per la gestione dei veicoli.
 * Estende la classe generica DAO e implementa l'interfaccia IVehicleDAO.
 * @class VehicleDAO
 * @extends DAO<Vehicle>
 * @implements IVehicleDAO
 */
export class VehicleDAO extends DAO<Vehicle> implements IVehicleDAO {
  constructor() {
    super(Vehicle);
  }

  /**
   * Trova un veicolo in base alla targa.
   * @param plate La targa del veicolo.
   * @returns Il veicolo trovato o null se non esiste.
   */
  async findByPlate(plate: string): Promise<Vehicle | null> {
    return this.findOne({ plate });  
}

  /**
   * Verifica se un veicolo esiste in base alla targa.
   * @param plate La targa del veicolo.
   * @returns True se il veicolo esiste, false altrimenti.
   */
  async existsByPlate(plate: string): Promise<boolean> {
    return (await this.findByPlate(plate)) !== null;
  }

  /**
   * Trova tutti i veicoli di un certo proprietario.
   * @param ownerId L'ID del proprietario.
   * @returns Una lista di veicoli appartenenti al proprietario.
   */
  async findByOwner(ownerId: string): Promise<Vehicle[]> {
    return this.findAll({ where: { ownerId } });
  }

  /**
   * Trova tutti i veicoli di un certo tipo.
   * @param type Il tipo di veicolo.
   * @returns Una lista di veicoli del tipo specificato.
   */
  async findByType(type: VehicleType): Promise<Vehicle[]> {
    return this.findAll({ where: { type } });
  }

  /**
   * Trova tutti i veicoli.
   * @returns Una lista di tutti i veicoli.
   */
  async findAllVehicles(): Promise<Vehicle[]> {
    return this.findAll();
  }
}

export default new VehicleDAO();