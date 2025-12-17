import Gate from "../models/Gate";
import { GateDAO } from "../dao/GateDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import {CreateGateInput,UpdateGateInput,} from "../validation/GateValidation";
import {
  ValidationError,
  NotFoundError,
  DatabaseError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";

/** GateService gestisce le operazioni sui gate.
 * @class GateService
 * @description Fornisce metodi per creare, eliminare, aggiornare e recuperare gate,
 * calcolare statistiche sui gate e gestire le prenotazioni.
 * @param gateDAO - Istanza di GateDAO per interagire con il database dei gate 
 * @param parkingDAO - Istanza di ParkingDAO per interagire con il database dei parcheggi 
 */
export class GateService {
  private readonly gateDAO: GateDAO;
  private readonly parkingDAO: ParkingDAO;

  /**
   * @constructor
   * @description Inizializza il servizio con istanze DAO.
   * Implementazione Singleton tramite export default new GateService().
   */
  constructor() {
    this.gateDAO = new GateDAO();
    this.parkingDAO = new ParkingDAO();
  }

  /**
   * Crea un nuovo varco (Gate).
   * I dati sono validati da Zod (createGateSchema).
   * Supporta tipi: standard (OCR immagine), smart (JSON targa).
   * 
   * @param data - Dati del varco validati (CreateGateInput)
   * @returns Promise<Gate> - Varco creato
   * @throws NotFoundError - Se il parcheggio non esiste
   * @throws DatabaseError - Errore persistenza
   */
  async create(data: CreateGateInput): Promise<Gate> {
    try {
      const { parkingId, type, direction } = data;

      // Il parcheggio deve esistere
      await this.checkParking(parkingId);

      return await this.gateDAO.create({
        parkingId,
        type,
        direction,
      } as any);
    } catch (error: any) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new DatabaseError(
        "Errore durante la creazione del gate",
        error
      );
    }
  }

  /**
   * Cerca un varco per ID.
   * Utilizzato dal middleware `ensureExists` per validazione pre-operazione.
   * 
   * @param id - ID del varco
   * @returns Promise<Gate | null> - Varco trovato o null
   */
  async getById(id: string): Promise<Gate | null> {
    return await this.gateDAO.findById(id);
  }

  /**
   * Restituisce tutti i varchi del sistema.
   * 
   * @returns Promise<Gate[]> - Array completo varchi
   * @throws DatabaseError - Errore query database
   */
  async getAll(): Promise<Gate[]> {
    try {
      return await this.gateDAO.findAll();
    } catch (error: any) {
      throw new DatabaseError(
        "Errore nel recupero di tutti i gate",
        error
      );
    }
  }

  /**
   * Restituisce tutti i varchi di un parcheggio specifico.
   * 
   * @param parkingId - ID del parcheggio
   * @returns Promise<Gate[]> - Varchi del parcheggio
   * @throws NotFoundError - Se parcheggio inesistente
   */
  async getByParking(parkingId: string): Promise<Gate[]> {
    await this.checkParking(parkingId);
    return this.gateDAO.findByParking(parkingId);
  }

  /**
   * Aggiorna un varco esistente.
   * I dati nel body sono validati da Zod (updateGateSchema).
   *
   * Controlli middleware in rotta:
   *  - validate(gateIdSchema, "params")
   *  - ensureExists(gateService, "Gate")
   * 
   * @param id - ID varco da aggiornare
   * @param data - Dati aggiornati (UpdateGateInput)
   * @returns Promise<Gate> - Varco aggiornato
   * @throws OperationNotAllowedError - Cambio parkingId vietato
   * @throws DatabaseError - Aggiornamento fallito
   */
  async update(id: string, data: UpdateGateInput): Promise<Gate> {
    // vietiamo il cambio di parkingId
    if ((data as any).parkingId) {
      throw new OperationNotAllowedError(
        "updateGate",
        "Non è permesso modificare il parkingId di un gate esistente"
      );
    }

    const updated = await this.gateDAO.update(id, data as any);
    if (!updated) {
      // caso limite: il gate è stato cancellato dopo ensureExists
      throw new DatabaseError("Impossibile aggiornare il gate");
    }

    return updated;
  }

  /**
   * Elimina un varco.
   *
   * Controlli middleware in rotta:
   *  - validate(gateIdSchema, "params")
   *  - ensureExists(gateService, "Gate")
   * 
   * @param id - ID varco da eliminare
   * @returns Promise<void>
   * @throws DatabaseError - Eliminazione fallita
   */
  async delete(id: string): Promise<void> {
    const ok = await this.gateDAO.delete(id);
    if (!ok) {
      // caso limite: già eliminato dopo ensureExists
      throw new DatabaseError("Errore eliminazione gate");
    }
  }

  /**
   * Verifica esistenza parcheggio.
   * Metodo privato di supporto per validazione referenziale.
   * 
   * @private
   * @param parkingId - ID parcheggio da verificare
   * @throws NotFoundError - Parcheggio non trovato
   */
  private async checkParking(parkingId: string) {
    const exists = await this.parkingDAO.existsById(parkingId);
    if (!exists) {
      throw new NotFoundError("Parking", parkingId);
    }
  }
}
export default new GateService();
