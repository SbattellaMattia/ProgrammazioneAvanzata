/**
 * Domain Model: User
 * 
 * Rappresentazione pura del dominio utente.
 * NON contiene logica di persistenza o dipendenze da ORM.
 * 
 * Questo è il modello di business, indipendente da database,
 * framework o dettagli implementativi.
 */
import { Roles } from '../enum/Roles';

/**
 * Interfaccia che definisce la struttura di un utente.
 * Usata in tutta l'applicazione per type safety.
 */
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;  // Hash della password
  role: Roles;
  tokens: number;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * DTO per la creazione di un utente.
 * Omette campi generati automaticamente (id, timestamps).
 */
export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  role: Roles;
  tokens?: number;
}

/**
 * DTO per l'aggiornamento di un utente.
 * Tutti i campi sono opzionali.
 */
export interface UpdateUserDTO {
  name?: string;
  email?: string;
  password?: string;
  role?: Roles;
  tokens?: number;
}

/**
 * User senza password (per response API).
 * Usa Omit per escludere campi sensibili.
 */
export type UserResponse = Omit<User, 'password'>;

/**
 * Classe di dominio User (opzionale, se vuoi metodi di business).
 * Contiene SOLO logica di business, NO persistenza.
 */
export class UserDomain {
  constructor(private readonly user: User) {}

  /**
   * Verifica se l'utente ha abbastanza token.
   */
  hasEnoughTokens(required: number): boolean {
    return this.user.tokens >= required;
  }

  /**
   * Detrae token dall'utente.
   * Restituisce nuovo stato (immutabile).
   */
  deductTokens(amount: number): User {
    if (!this.hasEnoughTokens(amount)) {
      throw new Error('Token insufficienti');
    }

    return {
      ...this.user,
      tokens: this.user.tokens - amount
    };
  }

  /**
   * Aggiunge token all'utente.
   */
  addTokens(amount: number): User {
    return {
      ...this.user,
      tokens: this.user.tokens + amount
    };
  }

  /**
   * Verifica se l'utente ha un determinato ruolo.
   */
  hasRole(role: Roles): boolean {
    return this.user.role === role;
  }

  /**
   * Restituisce i dati senza password.
   */
  toResponse(): UserResponse {
    const { password, ...userWithoutPassword } = this.user;
    return userWithoutPassword;
  }

  /**
   * Getter per accedere ai dati.
   */
  get data(): User {
    return { ...this.user };
  }
}
