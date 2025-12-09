import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { VehicleType } from "../enum/VehicleType";

const sequelize = DatabaseConnection.getInstance();

export class Vehicle extends Model<InferAttributes<Vehicle>, InferCreationAttributes<Vehicle>> {
  declare plate: string;
  declare type: VehicleType;
  declare ownerId: string; 
  declare imagePath: string;
  declare jsonPath: string | null;
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
    imagePath: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jsonPath: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Vehicle",
    timestamps: true,
  }
);