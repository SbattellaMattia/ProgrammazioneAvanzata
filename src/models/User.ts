/**
 * Modello User per la rappresentazione degli utenti nel sistema.
 * Attributi:
 * - id: Identificatore univoco dell'utente (UUID).
 * - name: Nome dell'utente (string).
 * - surname: Cognome dell'utente (string).
 * - email: Indirizzo email dell'utente (string).
 * - password: Password crittografata dell'utente (string).
 * - role: Ruolo dell'utente nel sistema (enum Role).
 * - tokens: Numero di token associati all'utente (number).
 * Il modello utilizza Sequelize per la definizione e l'interazione con il database.
 *
 * @param {Model} - Estende il modello di Sequelize per definire la tabella "User".
 *
 * @exports User - Il modello dell'utente.
 */
import { DataTypes, Model, InferAttributes, InferCreationAttributes } from "sequelize";
import DatabaseConnection from "../database/DatabaseConnection";
import { Role } from "../enum/Role";

const sequelize = DatabaseConnection.getInstance();

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
  declare id: string;
  declare name: string;
  declare surname: string;
  declare email: string;
  declare password: string;
  declare role: Role;
  declare tokens: number;

  isOperatore(): boolean {return this.role === Role.OPERATOR;}
  isAutomobilista(): boolean {return this.role === Role.DRIVER;}

}
User.init(
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

    surname: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM(...Object.values(Role)),
      allowNull: false,
    },

    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "User",
    timestamps: true,
  }
);

export default User;