// src/services/ParkingService.ts
import { ParkingDAO } from '../dao/ParkingDAO';
import { OperationNotAllowedError } from '../errors/CustomErrors';
import { CreateParkingDTO, UpdateParkingDTO } from '../validation/ParkingValidation';

// Essendo stateless (o quasi), possiamo usarlo come singleton o istanziarlo qui.
const parkingDAO = new ParkingDAO();

class ParkingService {
  
  /**
   * Crea un nuovo parcheggio tramite DAO.
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
   * Restituisce tutti i parcheggi.
   * Utilizza il metodo specifico del DAO che li ordina per nome.
   */
  async getAll() {
    return await parkingDAO.findAllParking();
  }

  /**
   * Cerca un parcheggio per ID.
   * Necessario per il middleware `ensureExists`.
   */
  async getById(id: string | number) {
    // Il DAO si aspetta string, facciamo il cast per sicurezza
    return await parkingDAO.findById(id.toString());
  }

  /**
   * Aggiorna un parcheggio.
   */
  async update(id: string, data: UpdateParkingDTO) {
    const parking = await parkingDAO.findById(id);
    const payload: any = { ...data };

    // helper per applicare regola capacity/remain
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
   * Elimina un parcheggio.
   */
  async delete(id: string | number) {
    return await parkingDAO.delete(id.toString());
  }

  /**
   * Metodo extra specifico di ParkingDAO
   * Restituisce le capacità divise per veicolo
   */
  async getCapacity(id: string | number) {
    return await parkingDAO.getCapacity(id.toString());
  }
}

export default new ParkingService();
