/**
 * Sequelize Model per la tabella User.
 * 
 * Questo file contiene SOLO la definizione del modello ORM.
 * NON è il modello di dominio, ma la sua rappresentazione nel database.
 */
import {
  DataTypes,
  Model,
  InferAttributes,
  InferCreationAttributes
} from 'sequelize';
import { Roles } from '../../enum/Roles';
import DatabaseConnection from '../../database/DatabaseConnection';

const sequelize = DatabaseConnection.getInstance();

/**
 * Sequelize Model per la persistenza.
 * Usa naming diverso per evitare confusione con domain model.
 */
export class UserModel extends Model<
  InferAttributes<UserModel>,
  InferCreationAttributes<UserModel>
> {
  declare id: string;
  declare name: string;
  declare email: string;
  declare password: string;
  declare role: Roles;
  declare tokens: number;
  declare createdAt?: Date;
  declare updatedAt?: Date;
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        isIn: [Object.values(Roles)]
      }
    },
    tokens: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    underscored: false
  }
);

export default UserModel;
