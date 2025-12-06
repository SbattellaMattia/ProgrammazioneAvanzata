import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { VehicleType } from "../enum/VehicleType";
import { DayType } from "../enum/DayType";

const sequelize = DatabaseConnection.getInstance();

export class Tariffa extends Model<InferAttributes<Tariffa>, InferCreationAttributes<Tariffa>> {
  declare id: string;
  declare parkingId: string;
  declare vehicleType: VehicleType;
  declare dayType: DayType;
  declare price: number;
  declare hourStart: Date;
  declare hourEnd: Date;
}

Tariffa.init(
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
    modelName: "Tariffa",
    timestamps: true,
  }
);

export default Tariffa;