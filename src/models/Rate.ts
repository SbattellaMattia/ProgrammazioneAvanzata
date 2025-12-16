/**
 * Modello Rate
 * 
 * Rappresenta le tariffe applicate in un parcheggio in base al tipo di veicolo, al tipo di giorno e all'orario.
 * Attributi:
 * - id: Identificatore univoco della tariffa (UUID).
 * - parkingId: Identificatore del parcheggio associato (UUID).
 * - vehicleType: Tipo di veicolo (enum VehicleType).
 * - dayType: Tipo di giorno (enum DayType).
 * - price: Prezzo della tariffa (float).
 * - hourStart: Orario di inizio validità della tariffa (Date).
 * - hourEnd: Orario di fine validità della tariffa (Date).
 * Il modello utilizza Sequelize per la definizione e l'interazione con il database.
 *
 * @param {Model} - Estende il modello di Sequelize per definire la tabella "Rate".
 *
 * @exports Rate - Il modello della tariffa.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

const sequelize = DatabaseConnection.getInstance();

export class Rate extends Model<InferAttributes<Rate>, InferCreationAttributes<Rate>> {
  declare id: string;
  declare parkingId: string;
  declare vehicleType: VehicleType;
  declare dayType: DayType;
  declare price: number;
  declare hourStart: Date;
  declare hourEnd: Date;
}

Rate.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    parkingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    vehicleType: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
    },

    dayType: {
      type: DataTypes.ENUM(...Object.values(DayType)),
      allowNull: false,
    },

    price: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    hourStart: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    hourEnd: {
      type: DataTypes.TIME,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Rate",
    timestamps: true,
  }
);

export default Rate;