// src/dao/UserDAO.ts
import { NotFoundError } from '../errors';
import { User } from '../models/User';
import { DAO } from './DAO';

/**
 * Interfaccia per il Data Access Object (DAO) degli utenti.
 * Definisce i metodi per interagire con i dati degli utenti.
 * @interface IUserDAO
 * @class UserDAO
 */
export interface IUserDAO {
  findByEmail(email: string): Promise<User | null>;
  decrementTokens(id: string, amount: number): Promise<User | null>;
}

/**
 * Implementazione del Data Access Object (DAO) per gli utenti.
 * Estende la classe generica DAO e implementa l'interfaccia IUserDAO.
 * @class UserDAO
 * @extends DAO<User>
 * @implements IUserDAO
 */
export class UserDAO extends DAO<User> implements IUserDAO {
  
  constructor() {
    super(User);
  }

  /** 
   * Trova un utente per email.
   * @param email - L'email dell'utente da trovare.
   * @returns L'utente trovato o null se non esiste.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.executeQuery(async () => await this.findOne({ email } as any),'findByEmail');}

  /** 
   * Controlla se un utente ha token sufficienti.
   * @param id - L'ID dell'utente da controllare.
   * @returns True se l'utente ha almeno un token, altrimenti false.
   * @throws NotFoundError se l'utente non esiste.
   */
  async checkTokens(id: string): Promise<Boolean> {
    return this.executeQuery(async () => {
      const user = await this.findById(id);
    
      if (!user) throw new NotFoundError('Utente', id);
      return user.tokens < 1 ?  false :  true;
      
    }, 'checkTokens');
  }
  
  /** 
   * Decrementa i token di un utente.
   * @param id - L'ID dell'utente.
   * @param amount - La quantità di token da decrementare.
   * @returns L'utente aggiornato o null se l'utente non esiste.
   * @throws Error se i token sono insufficienti.
   */
  async decrementTokens(id: string, amount: number): Promise<User | null> {
    return this.executeQuery(async () => {
      const user = await this.findById(id);
      
      if (!user) return null;
      if (user.tokens < amount) throw new Error('Token insufficienti');
      user.tokens -= amount;
      await user.save();
      return user;
    }, 'decrementTokens');
  }
}
export default new UserDAO();