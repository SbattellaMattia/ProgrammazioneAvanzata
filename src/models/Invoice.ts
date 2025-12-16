/**
 * Questo modello definisce la struttura della tabella "Invoice" nel database.
 * Attributi:
 * - id: Identificatore univoco della fattura (UUID).
 * - userId: Identificatore dell'utente associato (UUID).
 * - parkingId: Identificatore del parcheggio associato (UUID).
 * - entryTransitId: Identificatore del transito di entrata (UUID).
 * - exitTransitId: Identificatore del transito di uscita (UUID).
 * - amount: Importo della fattura (float).
 * - status: Stato della fattura (enum InvoiceStatus).
 * - createdAt: Data di creazione della fattura (Date).
 * - dueDate: Data di scadenza della fattura (Date).
 * 
 * Il modello utilizza Sequelize per la definizione e l'interazione con il database.
 *
 * @param {Model} - Estende il modello di Sequelize per definire la tabella "Invoice".
 *
 * @exports InferAttributes
 */
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