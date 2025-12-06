/**
 * Data Access Object per User.
 * 
 * Responsabilità:
 * - Comunicare con il database tramite Sequelize
 * - Mappare UserModel (Sequelize) ↔ User (domain)
 * - Isolare la logica di persistenza dal resto dell'app
 */
import { User} from '../models/User';

/**
 * Interfaccia del repository (opzionale, utile per test).
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  delete(id: string): Promise<boolean>;
}

export class UserDAO {
  async findByEmail(){}

}
