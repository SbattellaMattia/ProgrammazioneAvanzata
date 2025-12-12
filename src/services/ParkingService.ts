// src/services/ParkingService.ts
import { ParkingDAO } from '../dao/ParkingDAO';
import { CreateParkingDTO, UpdateParkingDTO } from '../validation/ParkingValidation';

// Essendo stateless (o quasi), possiamo usarlo come singleton o istanziarlo qui.
const parkingDAO = new ParkingDAO();

class ParkingService {
  
  /**
   * Crea un nuovo parcheggio tramite DAO.
   */
  async create(data: CreateParkingDTO) {
    return await parkingDAO.create(data);
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
  async update(id: string | number, data: UpdateParkingDTO) {
    // Il metodo update del DAO generico solitamente restituisce l'oggetto aggiornato
    return await parkingDAO.update(id.toString(), data);
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
