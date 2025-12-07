import Rate from "../models/Rate";
import { DAO } from "./DAO";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

export interface IRateDAO {
  findByParking(parkingId: string): Promise<Rate[]>;
  findByDayType(dayType: DayType): Promise<Rate[]>;
  findByVehicleType(vehicleType: VehicleType): Promise<Rate[]>;
}

export class RateDAO extends DAO<Rate> implements IRateDAO {
  
  constructor() {
    super(Rate);
  }

  /**
   * Restituisce le tariffe di un parcheggio ordinate per ora di inizio.
   */
  async findByParking(parkingId: string): Promise<Rate[]> {
    return this.findAll({where: { parkingId }, order: [["hourStart", "ASC"]],});
  }

  /**
   * Restituisce tariffe filtrate per tipo giorno.
   */
  async findByDayType(dayType: DayType): Promise<Rate[]> {
    return this.findAll({where: { dayType }, order: [["hourStart", "ASC"]],});
  }

  /**
   * Restituisce tariffe filtrate per tipo veicolo.
   */
  async findByVehicleType(vehicleType: VehicleType): Promise<Rate[]> {
    return this.findAll({where: { vehicleType }, order: [["hourStart", "ASC"]],});
  }
}