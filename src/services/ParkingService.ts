// src/services/ParkingService.ts
import { ParkingDAO } from '../dao/ParkingDAO';
import { OperationNotAllowedError } from '../errors/CustomErrors';
import { CreateParkingDTO, UpdateParkingDTO } from '../validation/ParkingValidation';

// Essendo stateless (o quasi), possiamo usarlo come singleton o istanziarlo.
const parkingDAO = new ParkingDAO();

/**
 * @class ParkingService
 * @description Servizio di business logic per gestione parcheggi.
 * Gestisce creazione, aggiornamento ed eliminazione parcheggi con validazione
 * della business rule: capacità totale >= veicoli occupati (capacity/remain consistency).
 * Supporta capacità differenziate per tipo veicolo (car, motorcycle, truck).
 * 
 */
class ParkingService {
  
  /**
   * Crea un nuovo parcheggio.
   * Inizializza capacityRemain = capacity totale per ogni tipo veicolo.
   * Dati validati da Zod (createParkingSchema).
   * 
   * @param data - Dati parcheggio (CreateParkingDTO)
   * @returns Promise<any> - Parcheggio creato
   */
  async create(data: CreateParkingDTO) {
    return await parkingDAO.create({
    ...data,
    carCapacityRemain: data.carCapacity,
    motorcycleCapacityRemain: data.motorcycleCapacity,
    truckCapacityRemain: data.truckCapacity,
  });
}

   /**
   * Restituisce tutti i parcheggi ordinati per nome.
   * Utilizza metodo ottimizzato del DAO.
   * 
   * @returns Promise<any[]> - Array parcheggi
   */
  async getAll() {
    return await parkingDAO.findAllParking();
  }

  /**
   * Cerca parcheggio per ID.
   * Richiesto dal middleware `ensureExists`.
   * 
   * @param id - ID parcheggio (string | number)
   * @returns Promise<any | null> - Parcheggio o null
   */
  async getById(id: string | number) {
    // Il DAO si aspetta string, facciamo il cast per sicurezza
    return await parkingDAO.findById(id.toString());
  }

  
  /**
   * Aggiorna parcheggio con validazione capacità.
   * Business Rule CRITICA: nuova capacità >= veicoli attualmente occupati.
   * Aggiorna automaticamente capacityRemain per coerenza.
   * 
   * @param id - ID parcheggio
   * @param data - Dati aggiornamento (UpdateParkingDTO)
   * @returns Promise<any> - Parcheggio aggiornato
   * @throws OperationNotAllowedError - Capacità insufficiente per occupati
   */
  async update(id: string, data: UpdateParkingDTO) {
    const parking = await parkingDAO.findById(id);
    const payload: any = { ...data };

    /**
     * @private
     * @helper applyCapacityRule
     * @description Applica regola capacità/occupati per tipo veicolo.
     * Calcola: newRemain = newCapacity - occupied
     * Garantisce: newRemain >= 0
     */
    const apply = (key: "car" | "motorcycle" | "truck") => {
      const capKey = `${key}Capacity` as const;
      const remKey = `${key}CapacityRemain` as const;

      const newCap = (data as any)[capKey];
      if (newCap === undefined) return; 

      const oldCap = Number((parking as any)[capKey]);
      const oldRem = Number((parking as any)[remKey]);
      const occupied = oldCap - oldRem;

      // non puoi scendere sotto gli occupati
      const newRemain = newCap - occupied;
      if (newRemain < 0) {
        throw new OperationNotAllowedError(
          "updateParking",
          `${capKey} troppo bassa: occupati=${occupied}, richiesto=${newCap}`
        );
        // oppure ValidationError, come preferisci
      }

      // aggiorna anche remain coerentemente
      payload[remKey] = newRemain;
    };

    apply("car");
    apply("motorcycle");
    apply("truck");

    return await parkingDAO.update(id, payload);
  }

  /**
   * Elimina parcheggio.
   * Nota: non verifica transiti attivi (responsabilità TransitService).
   * 
   * @param id - ID parcheggio (string | number)
   * @returns Promise<boolean> - True se eliminato
   */
  async delete(id: string | number) {
    return await parkingDAO.delete(id.toString());
  }

  /**
   * Restituisce capacità disponibili per tipo veicolo.
   * Metodo di utilità specifico ParkingDAO.
   * 
   * @param id - ID parcheggio
   * @returns Promise<any> - Capacità { carRemain, motorcycleRemain, truckRemain }
   */
  async getCapacity(id: string | number) {
    return await parkingDAO.getCapacity(id.toString());
  }
}

export default new ParkingService();
