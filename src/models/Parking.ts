import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";

const sequelize = DatabaseConnection.getInstance();

export class Parking extends Model<InferAttributes<Parking>, InferCreationAttributes<Parking>> {
  declare id: string;
  declare name: string;
  declare address: string;
  declare carCapacity: number;
  declare motorcycleCapacity: number;
  declare truckCapacity: number;
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
  },
  {
    sequelize,
    modelName: "Parking",
    timestamps: true,
  }
);

export default Parking;