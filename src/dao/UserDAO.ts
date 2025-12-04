/**
 * Data Access Object per User.
 * 
 * Responsabilità:
 * - Comunicare con il database tramite Sequelize
 * - Mappare UserModel (Sequelize) ↔ User (domain)
 * - Isolare la logica di persistenza dal resto dell'app
 */
import { UserModel } from './models/UserModelDao';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/User';

/**
 * Interfaccia del repository (opzionale, utile per test).
 */
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(limit?: number, offset?: number): Promise<User[]>;
  create(data: CreateUserDTO): Promise<User>;
  update(id: string, data: UpdateUserDTO): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}

/**
 * Implementazione concreta del repository con Sequelize.
 */
export class UserDAO implements IUserRepository {
  /**
   * Mappa da UserModel (Sequelize) a User (domain).
   */
  private toDomain(model: UserModel): User {
    return {
      id: model.id,
      name: model.name,
      email: model.email,
      password: model.password,
      role: model.role,
      tokens: model.tokens,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt
    };
  }

  /**
   * Trova utente per ID.
   */
  async findById(id: string): Promise<User | null> {
    const model = await UserModel.findByPk(id);
    return model ? this.toDomain(model) : null;
  }

  /**
   * Trova utente per email.
   */
  async findByEmail(email: string): Promise<User | null> {
    const model = await UserModel.findOne({ where: { email } });
    return model ? this.toDomain(model) : null;
  }

  /**
   * Trova tutti gli utenti (paginato).
   */
  async findAll(limit = 100, offset = 0): Promise<User[]> {
    const models = await UserModel.findAll({
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });
    return models.map(m => this.toDomain(m));
  }

  /**
   * Crea un nuovo utente.
   */
  async create(data: CreateUserDTO): Promise<User> {
    const model = await UserModel.create({
      id: "cambiare",
      name: data.name,
      email: data.email,
      password: data.password,
      role: data.role,
      tokens: data.tokens ?? 0
    });
    return this.toDomain(model);
  }

  /**
   * Aggiorna un utente esistente.
   */
  async update(id: string, data: UpdateUserDTO): Promise<User | null> {
    const model = await UserModel.findByPk(id);
    
    if (!model) {
      return null;
    }

    await model.update(data);
    return this.toDomain(model);
  }

  /**
   * Elimina un utente.
   */
  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.destroy({ where: { id } });
    return deleted > 0;
  }

  /**
   * Trova utenti per ruolo.
   */
  async findByRole(role: string, limit = 100): Promise<User[]> {
    const models = await UserModel.findAll({
      where: { role },
      limit,
      order: [['createdAt', 'DESC']]
    });
    return models.map(m => this.toDomain(m));
  }

  /**
   * Conta utenti totali.
   */
  async count(): Promise<number> {
    return UserModel.count();
  }
}
