import { User } from '../models/User';

export interface IUserDAO {
  findByEmail(email: string): Promise<User | null>;
  findById(id: number): Promise<User | null>;
  create(userData: Partial<User>): Promise<User>;
  update(id: number, userData: Partial<User>): Promise<User | null>;
  delete(id: number): Promise<boolean>;
}

export class UserDAO implements IUserDAO {
  
  async findByEmail(email: string): Promise<User | null> {
    try {
      return await User.findOne({ where: { email } });
    } catch (error) {
      console.error('Error in findByEmail:', error);
      throw new Error('Errore nel recupero dell\'utente');
    }
  }

  async findById(id: number): Promise<User | null> {
    try {
      return await User.findByPk(id);
    } catch (error) {
      console.error('Error in findById:', error);
      throw new Error('Errore nel recupero dell\'utente');
    }
  }

  async create(userData: Partial<User>): Promise<User> {
    try {
      return await User.create(userData as any);
    } catch (error) {
      console.error('Error in create:', error);
      throw new Error('Errore nella creazione dell\'utente');
    }
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    try {
      const user = await User.findByPk(id);
      
      if (!user) {
        return null;
      }

      await user.update(userData);
      return user;
    } catch (error) {
      console.error('Error in update:', error);
      throw new Error('Errore nell\'aggiornamento');
    }
  }

  async delete(id: number): Promise<boolean> {
    try {
      const deleted = await User.destroy({ where: { id } });
      return deleted > 0;
    } catch (error) {
      console.error('Error in delete:', error);
      throw new Error('Errore nell\'eliminazione');
    }
  }
}
