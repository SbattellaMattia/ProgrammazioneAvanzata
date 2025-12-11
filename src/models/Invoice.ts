import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { InvoiceStatus } from "../enum/InvoiceStatus";

const sequelize = DatabaseConnection.getInstance();

export class Invoice extends Model<InferAttributes<Invoice>, InferCreationAttributes<Invoice>> {
  declare id: string;
  declare userId: string;
  declare parkingId: string;
  declare entryTransitId: string;
  declare exitTransitId: string;
  declare amount: number;
  declare status: InvoiceStatus;
  declare createdAt: Date;
  declare dueDate: Date;
}

Invoice.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    parkingId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    entryTransitId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    exitTransitId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(...Object.values(InvoiceStatus)),
      allowNull: false,
    },

    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Invoice",
    timestamps: true,
  }
);

export default Invoice;