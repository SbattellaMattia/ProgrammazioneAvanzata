import { Model, ModelStatic, WhereOptions } from 'sequelize';
import { DatabaseError } from '../errors';

/**
 * DAO generico per operazioni CRUD
 * Tutti i DAO specifici possono estendere questa classe
 * 
 * @template T - Il tipo del modello (es. User, Vehicle, Transit)
 */
export abstract class DAO<T extends Model> {
  protected model: ModelStatic<T>;

  constructor(model: ModelStatic<T>) {
    this.model = model;
  }

  /**
   * Wrapper per gestire errori database
   */
  protected async executeQuery<R>(
    operation: () => Promise<R>,
    context: string
  ): Promise<R> {
    try {
      return await operation();
    } catch (error) {
      console.error(`[${this.model.name}.${context}] Error:`, error);
      
      // Gestisci errori Sequelize specifici
      if (error instanceof Error) {
        if (error.name === 'SequelizeValidationError') {
          throw new DatabaseError(`Validazione fallita: ${error.message}`, error);
        }
        if (error.name === 'SequelizeUniqueConstraintError') {
          throw new DatabaseError('Risorsa già esistente', error);
        }
        throw new DatabaseError(`Errore database in ${context}: ${error.message}`, error);
      }
      throw new DatabaseError(`Errore sconosciuto in ${context}`);
    }
  }

  /**
   * Trova per ID
   */
  async findById(id: number | string): Promise<T | null> {
    return this.executeQuery(
      async () => await this.model.findByPk(id),
      'findById'
    );
  }

  /**
   * Trova tutti
   */
  async findAll(options?: any): Promise<T[]> {
    return this.executeQuery(
      async () => await this.model.findAll(options),
      'findAll'
    );
  }

  /**
   * Trova uno
   */
  async findOne(where: WhereOptions<T>): Promise<T | null> {
    return this.executeQuery(
      async () => await this.model.findOne({ where }),
      'findOne'
    );
  }

  /**
   * Crea
   */
  async create(data: Partial<T['_attributes']>): Promise<T> {
    return this.executeQuery(
      async () => await this.model.create(data as any),
      'create'
    );
  }

  /**
   * Aggiorna
   */
  async update(id: number | string, data: Partial<T['_attributes']>): Promise<T | null> {
    return this.executeQuery(async () => {
      const instance = await this.model.findByPk(id);
      
      if (!instance) {
        return null;
      }

      await instance.update(data as any);
      return instance;
    }, 'update');
  }

  /**
   * Elimina
   */
  async delete(id: number | string): Promise<boolean> {
    return this.executeQuery(async () => {
      const deleted = await this.model.destroy({ where: { id } as any });
      return deleted > 0;
    }, 'delete');
  }

  /**
   * Conta
   */
  async count(where?: WhereOptions<T>): Promise<number> {
    return this.executeQuery(
      async () => await this.model.count({ where }),
      'count'
    );
  }

  /**
   * Esiste
   */
  async exists(where: WhereOptions<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }
}
