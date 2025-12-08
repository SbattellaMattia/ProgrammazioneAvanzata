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
   */
  async createRate(data: CreateRateInput): Promise<Rate> {
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
   */
  async getById(id: string): Promise<Rate | null> {
    return this.rateDAO.findById(id);
  }

  /**
   * Restituisce tutte le tariffe.
   */
  async getAllRates(): Promise<Rate[]> {
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
   */
  async updateRate(id: string, data: UpdateRateInput): Promise<Rate> {
    // vietiamo il cambio di parkingId
    if ((data as any).parkingId) {
      throw new OperationNotAllowedError(
        "updateRate",
        "Non è permesso modificare il parkingId di una tariffa esistente"
      );
    }

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
   */
  async deleteRate(id: string): Promise<void> {
    const ok = await this.rateDAO.delete(id);
    if (!ok) {
      // caso limite: già eliminata dopo ensureExists
      throw new DatabaseError("Errore eliminazione tariffa");
    }
  }

  /**
   * Verifica che il parcheggio esista.
   */
  private async checkParking(parkingId: string) {
    const exists = await this.parkingDAO.existsById(parkingId);
    if (!exists) {
      throw new NotFoundError("Parking", parkingId);
    }
  }
}