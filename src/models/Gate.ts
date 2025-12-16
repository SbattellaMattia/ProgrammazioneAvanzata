/**
 * Questo modello definisce la struttura della tabella "Gate" nel database.
 * Attributi:
 * - id: Identificatore univoco del gate (UUID).
 * - parkingId: Identificatore del parcheggio associato (UUID).
 * - type: Tipo di gate (enum GateType).
 * - direction: Direzione del gate (enum GateDirection).
 * 
 * Il modello utilizza Sequelize per la definizione del modello e la gestione del database.
 *
 * @param {Model} - Classe che estende il modello Sequelize.
 *
 * @exports Gate - Il modello Gate per l'interazione con la tabella "Gate" nel database.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { GateType } from "../enum/GateType";
import { GateDirection } from "../enum/GateDirection";

const sequelize = DatabaseConnection.getInstance();

export class Gate extends Model<InferAttributes<Gate>, InferCreationAttributes<Gate>> {
  declare id: string;
  declare parkingId: string;
  declare type: GateType;
  declare direction: GateDirection;
}

Gate.init(
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

    type: {
      type: DataTypes.ENUM(...Object.values(GateType)),
      allowNull: false,
    },

    direction: {
      type: DataTypes.ENUM(...Object.values(GateDirection)),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Gate",
    timestamps: true,
  }
);

export default Gate;