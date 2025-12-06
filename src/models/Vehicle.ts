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