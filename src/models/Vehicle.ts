/**
 * Modello Vehicle
 * 
 * Rappresenta i veicoli registrati nel sistema, includendo informazioni sulla targa, il tipo di veicolo e l'identificatore del proprietario.
 * Attributi:
 * - plate: Targa del veicolo (string).
 * - type: Tipo di veicolo (enum VehicleType).
 * - ownerId: Identificatore univoco del proprietario del veicolo (UUID).
 * Il modello utilizza Sequelize per la definizione e l'interazione con il database.
 *
 * @param {Model} - Estende il modello di Sequelize per definire la tabella "Vehicle".
 *
 * @exports Vehicle - Il modello del veicolo.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { VehicleType } from "../enum/VehicleType";

const sequelize = DatabaseConnection.getInstance();

export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
  declare plate: string;
  declare type: VehicleType;
  declare ownerId: string; 
}

Vehicle.init(
  {
    plate: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
       set(value: string) {
            this.setDataValue('plate', value.trim().toUpperCase().replace(/\s+/g, ''));
            },
          validate: {
            notEmpty: true,
            len: [7, 7],
          },
    },
    type: {
      type: DataTypes.ENUM(...Object.values(VehicleType)),
      allowNull: false,
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Vehicle",
    timestamps: true,
  }
);