import { FindOptions, Model, ModelStatic, WhereOptions, Op } from 'sequelize';
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
   * Esegue una query con gestione centralizzata degli errori
   * @param operation La funzione che esegue l'operazione
   * @param context Descrizione del contesto per il logging
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
   * @param id L'ID della risorsa
   * @return L'istanza trovata o null
   */
  async findById(id: string): Promise<T | null> {
    return this.executeQuery(
      async () => await this.model.findByPk(id),
      'findById'
    );
  }

  /**
   * Trova tutti
   * @param options Opzioni di ricerca opzionali
   * @return Array di istanze trovate
   */
  async findAll(options?: any): Promise<T[]> {
    return this.executeQuery(
      async () => await this.model.findAll(options),
      'findAll'
    );
  }

  /**
   * Trova uno
   * @param where Condizioni di ricerca
   * @return L'istanza trovata o null
   */
  async findOne(where: WhereOptions<T>): Promise<T | null> {
    return this.executeQuery(
      async () => await this.model.findOne({ where }),
      'findOne'
    );
  }

  /**
   * Crea
   * @param data I dati per la nuova istanza
   * @return L'istanza creata
   */
  async create(data: Partial<T['_attributes']>): Promise<T> {
    return this.executeQuery(
      async () => await this.model.create(data as any),
      'create'
    );
  }

  /**
   * Aggiorna
   * @param id L'ID della risorsa da aggiornare
   * @param data I dati da aggiornare
   * @return L'istanza aggiornata o null se non trovata
   */
  async update(id: string, data: Partial<T['_attributes']>): Promise<T | null> {
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
   * @param id L'ID della risorsa da eliminare
   * @return true se eliminato, false se non trovato
   */
  async delete(id: string): Promise<boolean> {
    return this.executeQuery(async () => {
      const deleted = await this.model.destroy({ where: { id } as any });
      return deleted > 0;
    }, 'delete');
  }

  /**
   * Conta i record
   * @param where Condizioni opzionali per il conteggio
   * @return Numero di record che soddisfano le condizioni
   */
  async count(where?: WhereOptions<T>): Promise<number> {
    return this.executeQuery(
      async () => await this.model.count({ where }),
      'count'
    );
  }

  /**   
   * Verifica l'esistenza di record che soddisfano le condizioni
   * @param where Condizioni di ricerca
   * @return true se esiste almeno un record, false altrimenti
   */
  async exists(where: WhereOptions<T>): Promise<boolean> {
    const count = await this.count(where);
    return count > 0;
  }


  /**   * Trova record in un intervallo di date su un campo specifico
   * @param dateField Il campo data su cui filtrare
   * @param from Data di inizio (inclusiva) 
   * @param to Data di fine (inclusiva)
   * @param additionalWhere Altre condizioni where opzionali
   * @return Array di record trovati
   * 
   * @example
  * Trova transiti tra due date
  * const transits = await transitDAO.findInDateRange('date', new Date('2024-01-01'), new Date('2024-01-31'));
   */ 
  async findInDateRange(
    dateField: keyof T['_attributes'], // TypeScript safety: deve essere una chiave del modello
    from?: Date,
    to?: Date,
    additionalWhere: WhereOptions<T> = {}
  ): Promise<T[]> {
    return this.executeQuery(async () => {
      
      const whereClause: any = { ...additionalWhere };

      // Costruiamo la clausola temporale solo se c'è almeno una data
      if (from || to) {
        whereClause[dateField] = {};
        if (from) whereClause[dateField][Op.gte] = from; // >= from
        if (to) whereClause[dateField][Op.lte] = to;     // <= to
      }

      // Default Order: Ordiniamo per data decrescente (comodo per liste e log)
      const options: FindOptions = {
        where: whereClause,
        order: [[dateField as string, 'DESC']]
      };

      return await this.model.findAll(options);
    }, 'findInDateRange');
  }
}
