// src/dao/TransitDAO.ts
import { Transit } from '../models/Transit';
import { DAO } from './DAO';

export interface ITransitDAO {
    findByPlate(plate: string): Promise<Transit[]>;
    findActiveTransits(parkingId: number): Promise<Transit[]>;
}

export class TransitDAO extends DAO<Transit> implements ITransitDAO {
  
  constructor() {
    super(Transit);
  }

  /**
   * Trova transiti per targa
   */
  async findByPlate(plate: string): Promise<Transit[]> {
    return this.executeQuery(
      async () => await this.findAll({ where: { targa: plate } }),
      'findByPlate'
    );
  }

  /**
   * Trova transiti attivi (ingresso senza uscita)
   */
  async findActiveTransits(parkingId: number): Promise<Transit[]> {
    return this.executeQuery(
      async () => await this.findAll({
        where: {
          parcheggio_id: parkingId,
          tipo_transito: 'ingresso',
          // Aggiungi logica per trovare transiti senza uscita corrispondente
        },
      }),
      'findActiveTransits'
    );
  }
}
