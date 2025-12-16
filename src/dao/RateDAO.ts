import Rate from "../models/Rate";
import { DAO } from "./DAO";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

/**
 * Interfaccia per le operazioni di accesso ai dati delle tariffe.
 * Contiene metodi per recuperare le tariffe in base a diversi criteri. 
 * @interface IRateDAO
 * @class RateDAO
 */
export interface IRateDAO {
  findByParking(parkingId: string): Promise<Rate[]>;
  findByDayType(dayType: DayType): Promise<Rate[]>;
  findByVehicleType(vehicleType: VehicleType): Promise<Rate[]>;
}

/**
 * Implementazione del Data Access Object (DAO) per le tariffe.
 * Estende la classe generica DAO e implementa l'interfaccia IRateDAO.
 * @class RateDAO
 * @extends DAO<Rate>
 * @implements IRateDAO
 */
export class RateDAO extends DAO<Rate> implements IRateDAO {
  
  constructor() {
    super(Rate);
  }

  /**
   * Restituisce tariffe filtrate per ID del parcheggio.
   * @param parkingId - L'ID del parcheggio.
   * @returns Una lista di tariffe associate al parcheggio specificato.
   */
  async findByParking(parkingId: string): Promise<Rate[]> {
    return this.findAll({where: { parkingId }, order: [["hourStart", "ASC"]],});
  }

  /**
   * Restituisce tariffe filtrate per tipo di giorno.
   * @param dayType - Il tipo di giorno (es. feriale, festivo).
   * @returns Una lista di tariffe associate al tipo di giorno specificato.
   */
  async findByDayType(dayType: DayType): Promise<Rate[]> {
    return this.findAll({where: { dayType }, order: [["hourStart", "ASC"]],});
  }

  /**
   * Restituisce tariffe filtrate per tipo di veicolo.
   * @param vehicleType - Il tipo di veicolo (es. auto, moto, camion).
   * @returns Una lista di tariffe associate al tipo di veicolo specificato.
   */
  async findByVehicleType(vehicleType: VehicleType): Promise<Rate[]> {
    return this.findAll({where: { vehicleType }, order: [["hourStart", "ASC"]],});
  }
}