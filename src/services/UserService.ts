/**
 * User Service - Business Logic Layer
 * 
 * Responsabilità:
 * - Orchestrare operazioni di business
 * - Validare input
 * - Usare DAO per persistenza
 * - NON sa come funziona il database
 */
import { UserDAO } from '../dao/UserDao';
import { CustomError } from '../factories/errorFactory';
import { User, CreateUserDTO, UserResponse, UserDomain } from '../models/User';
//import { hashPassword } from '../utils/passwordUtils';

export class UserService {
  constructor(private readonly userDAO: UserDAO = new UserDAO()) {}

  /**
   * Ottiene un utente per ID (senza password).
   */
  async getUserById(id: string): Promise<UserResponse> {
    const user = await this.userDAO.findById(id);
    
    if (!user) {
      throw new CustomError('Utente non trovato', 404);
    }

    const domain = new UserDomain(user);
    return domain.toResponse();
  }

  /**
   * Crea un nuovo utente.
   */
  async createUser(data: CreateUserDTO): Promise<UserResponse> {
    // Validazione business
    const existing = await this.userDAO.findByEmail(data.email);
    if (existing) {
      throw new CustomError('Email già registrata', 409);
    }

    // Hash password
    //const hashedPassword = await hashPassword(data.password);
    const hashedPassword = await (data.password);

    // Crea utente
    const user = await this.userDAO.create({
      ...data,
      password: hashedPassword
    });

    const domain = new UserDomain(user);
    return domain.toResponse();
  }

  /**
   * Detrae token da un utente.
   */
  async deductTokens(userId: string, amount: number): Promise<UserResponse> {
    const user = await this.userDAO.findById(userId);
    
    if (!user) {
      throw new CustomError('Utente non trovato', 404);
    }

    // Usa logica di dominio
    const domain = new UserDomain(user);
    const updatedUser = domain.deductTokens(amount);

    // Persisti
    const saved = await this.userDAO.update(userId, {
      tokens: updatedUser.tokens
    });

    if (!saved) {
      throw new CustomError('Errore aggiornamento token', 500);
    }

    return new UserDomain(saved).toResponse();
  }

  /**
   * Lista utenti (paginato).
   */
  async listUsers(page = 1, pageSize = 20): Promise<UserResponse[]> {
    const offset = (page - 1) * pageSize;
    const users = await this.userDAO.findAll(pageSize, offset);
    
    return users.map(u => new UserDomain(u).toResponse());
  }
}
