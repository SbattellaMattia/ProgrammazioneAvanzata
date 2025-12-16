/**
 * Questo modello definisce la struttura della tabella "Parking" nel database.
 * Rappresenta un parcheggio con le sue caratteristiche e capacità.
 *
 * Attributi:
 * - id: Identificatore univoco del parcheggio (string).
 * - name: Nome del parcheggio (string).
 * - address: Indirizzo del parcheggio (string).
 * - carCapacity: Capacità totale per auto (number).
 * - motorcycleCapacity: Capacità totale per motociclette (number).
 * - truckCapacity: Capacità totale per camion (number).
 * - carCapacityRemain: Capacità rimanente per auto (number).
 * - motorcycleCapacityRemain: Capacità rimanente per motociclette (number).
 * - truckCapacityRemain: Capacità rimanente per camion (number).
 *  * @param {Model} - Estende il modello di Sequelize per definire la tabella "Parking".
 *
 * @exports Parking - Il modello del parcheggio.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
export type ParkingCreationAttributes = InferCreationAttributes<Parking>;

const sequelize = DatabaseConnection.getInstance();

export class Parking extends Model<InferAttributes<Parking>, InferCreationAttributes<Parking>> {
  declare id: string;
  declare name: string;
  declare address: string;
  declare carCapacity: number;
  declare motorcycleCapacity: number;
  declare truckCapacity: number;
  declare carCapacityRemain: number;
  declare motorcycleCapacityRemain: number;
  declare truckCapacityRemain: number;
}

Parking.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    carCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    motorcycleCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    truckCapacity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    carCapacityRemain: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    motorcycleCapacityRemain: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    truckCapacityRemain: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Parking",
    timestamps: true,
  }
);

export default Parking;