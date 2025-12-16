/**
 * Modello Transit
 * 
 * Rappresenta i transiti dei veicoli in un parcheggio, includendo informazioni sul tipo di transito, la data e la targa rilevata.
 * Attributi:
 * - id: Identificatore univoco del transito (UUID).
 * - parkingId: Identificatore del parcheggio associato (UUID).
 * - gateId: Identificatore del cancello di entrata/uscita (UUID).
 * - vehicleId: Identificatore del veicolo (string).
 * - type: Tipo di transito (enum TransitType).
 * - date: Data e ora del transito (Date).
 * - detectedPlate: Targa rilevata dal sistema di riconoscimento targhe (string | null).
 * Il modello utilizza Sequelize per la definizione e l'interazione con il database.
 *
 * @param {Model} - Estende il modello di Sequelize per definire la tabella "Transit".
 *
 * @exports Transit - Il modello del transito.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { TransitType } from "../enum/TransitType";

const sequelize = DatabaseConnection.getInstance();

export class Transit extends Model<InferAttributes<Transit>, InferCreationAttributes<Transit>> {
  declare id: string;
  declare parkingId: string;
  declare gateId: string;
  declare vehicleId: string;
  declare type: TransitType;
  declare date: Date;
  declare detectedPlate: string | null;
}

Transit.init(
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

    gateId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    vehicleId: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    type: {
      type: DataTypes.ENUM(...Object.values(TransitType)),
      allowNull: false,
    },

    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    detectedPlate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Transit",
    timestamps: true,
  }
);

export default Transit;