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
  declare imageData: string | null;
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
      type: DataTypes.UUID,
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

    imageData: {
      type: DataTypes.TEXT,
      allowNull: true,
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