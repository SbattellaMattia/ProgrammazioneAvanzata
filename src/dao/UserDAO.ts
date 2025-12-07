// src/dao/UserDAO.ts
import { User } from '../models/User';
import { DAO } from './DAO';

export interface IUserDAO {
  findByEmail(email: string): Promise<User | null>;
  decrementTokens(id: number, amount: number): Promise<User | null>;
}

/**
 * DAO per gestione utenti
 * ✅ Estende DAO per avere CRUD automatico
 */
export class UserDAO extends DAO<User> implements IUserDAO {
  
  constructor() {
    super(User);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.executeQuery(
      async () => await this.findOne({ email } as any),
      'findByEmail'
    );
  }

  async decrementTokens(id: number, amount: number): Promise<User | null> {
    return this.executeQuery(async () => {
      const user = await this.findById(id);
      
      if (!user) {
        return null;
      }

      if (user.tokens < amount) {
        throw new Error('Token insufficienti');
      }

      user.tokens -= amount;
      await user.save();
      
      return user;
    }, 'decrementTokens');
  }
}
