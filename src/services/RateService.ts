// src/services/RateService.ts
import { Rate } from "../models/Rate";
import { RateDAO } from "../dao/RateDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import {CreateRateInput, UpdateRateInput,} from "../validation/RateValidation";
import {
  BadRequestError,
  ValidationError,
  NotFoundError,
  DatabaseError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";


/**
 * @class RateService
 * @description Servizio di business logic per la gestione delle tariffe di parcheggio.
 * Gestisce tutte le operazioni CRUD sulle tariffe, inclusa la validazione dell'esistenza
 * del parcheggio associato. 
 * 
 */
export class RateService {
  private readonly rateDAO: RateDAO;
  private readonly parkingDAO: ParkingDAO;

  constructor() {
    this.rateDAO = new RateDAO();
    this.parkingDAO = new ParkingDAO();
  }

  /**
   * Crea una nuova tariffa.
   * I dati nel body sono già validati da Zod (createRateSchema).
   * 
   * @param data - Dati della tariffa validati
   * @returns Promise<Rate> - Tariffa creata
   * @throws NotFoundError - Se il parcheggio non esiste
   * @throws DatabaseError - Errore generico database
   */
  async create(data: CreateRateInput): Promise<Rate> {
    try {
      const { parkingId, vehicleType, dayType, price, hourStart, hourEnd } =
        data;

      // Il parcheggio deve esistere 
      await this.checkParking(parkingId);

      return await this.rateDAO.create({
        parkingId,
        vehicleType,
        dayType,
        price,
        hourStart,
        hourEnd,
      } as any);
    } catch (error: any) {
      if (
        error instanceof BadRequestError ||
        error instanceof ValidationError ||
        error instanceof NotFoundError
      ) {
        throw error;
      }
      throw new DatabaseError(
        "Errore durante la creazione della tariffa",
        error
      );
    }
  }

  /**
   * Cerca una tariffa per ID.
   * Necessario per il middleware `ensureExists`.
   * 
   * @param id - ID della tariffa
   * @returns Promise<Rate | null> - Tariffa trovata o null
   */
  async getById(id: string): Promise<Rate | null> {
    return this.rateDAO.findById(id);
  }

  /**
   * Restituisce tutte le tariffe.
   * 
   * @returns Promise<Rate[]> - Array di tutte le tariffe
   * @throws DatabaseError - Errore query database
   */
  async getAll(): Promise<Rate[]> {
    try {
      return await this.rateDAO.findAll();
    } catch (error: any) {
      throw new DatabaseError(
        "Errore nel recupero di tutte le tariffe",
        error
      );
    }
  }

  /**
   * Restituisce le tariffe relative a un parcheggio.
   * 
   * @param parkingId - ID del parcheggio
   * @returns Promise<Rate[]> - Tariffe del parcheggio
   * @throws NotFoundError - Se il parcheggio non esiste
   */
  async getRatesByParking(parkingId: string): Promise<Rate[]> {
    await this.checkParking(parkingId);
    return this.rateDAO.findByParking(parkingId);
  }

  /**
   * Aggiorna una tariffa.
   * I dati nel body sono validati da Zod (updateRateSchema).
   *
   * I controlli sono fatti in rotta, ad esempio:
   *  - validate(rateIdSchema, "params")
   *  - ensureExists(rateService, "Tariffa")
   * 
   * @param id - ID della tariffa da aggiornare
   * @param data - Dati aggiornati (UpdateRateInput)
   * @returns Promise<Rate> - Tariffa aggiornata
   * @throws DatabaseError - Se l'aggiornamento fallisce
   */
  async update(id: string, data: UpdateRateInput): Promise<Rate> {
    const updated = await this.rateDAO.update(id, data as any);
    if (!updated) {
      // caso limite: la tariffa è stata cancellata dopo ensureExists
      throw new DatabaseError("Impossibile aggiornare la tariffa");
    }

    return updated;
  }

  /**
   * Elimina una tariffa.
   *
   * I controlli sono fatti in rotta, ad esempio: 
   * - validate(rateIdSchema, "params")
   * - ensureExists(rateService, "Tariffa")
   * 
   * @param rate - Istanza Rate già validata/esistente
   * @returns Promise<void>
   * @throws DatabaseError - Se l'eliminazione fallisce
   */
  async delete(rate: Rate): Promise<void> {
    const ok = await this.rateDAO.delete(rate.id);
    if (!ok) {
      // caso limite: già eliminata dopo ensureExists
      throw new DatabaseError("Errore eliminazione tariffa");
    }
  }

  /**
   * Verifica che il parcheggio esista.
   * Metodo privato di supporto per validazione integrità referenziale.
   * 
   * @private
   * @param parkingId - ID del parcheggio da verificare
   * @throws NotFoundError - Se il parcheggio non esiste
   */
  private async checkParking(parkingId: string) {
    const exists = await this.parkingDAO.existsById(parkingId);
    if (!exists) {
      throw new NotFoundError("Parking", parkingId);
    }
  }
}
export default new RateService();