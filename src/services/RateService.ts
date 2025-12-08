import { Rate } from "../models/Rate";
import { RateDAO } from "../dao/RateDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { CreateRateInput, UpdateRateInput } from "../validation/RateValidation";
import { BadRequestError, ValidationError, NotFoundError, DatabaseError } from "../errors/CustomErrors";


export class RateService {
  private readonly rateDAO: RateDAO;
  private readonly parkingDAO: ParkingDAO;

  constructor() {
    this.rateDAO = new RateDAO();
    this.parkingDAO = new ParkingDAO();
  }

  /**
   * Crea una nuova tariffa.
   * I dati nel body sono validati da Zod (createRateSchema).
   */
  async createRate(data: CreateRateInput): Promise<Rate> {
    try {
      const { parkingId, vehicleType, dayType, price, hourStart, hourEnd } =
        data;

      // il parcheggio deve esistere
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
      throw new DatabaseError("Errore durante la creazione della tariffa", error);
    }
  }

  /**
   * Restituisce una tariffa per ID.
   */
  async getRateById(id: string): Promise<Rate> {
    if (!id) {
      throw new BadRequestError("ID mancante");
    }

    const rate = await this.rateDAO.findById(id);
    if (!rate) {
      throw new NotFoundError("Tariffa", id);
    }

    return rate;
  }

  /**
   * Restituisce tutte le tariffe.
   */
  async getAllRates(): Promise<Rate[]> {
    try {
      return await this.rateDAO.findAll();
    } catch (error: any) {
      throw new DatabaseError("Errore nel recupero di tutte le tariffe", error);
    }
  }

  /**
   * Restituisce le tariffe relative a un parcheggio.
   */
  async getRatesByParking(parkingId: string): Promise<Rate[]> {
    if (!parkingId) {
      throw new BadRequestError("parkingId mancante");
    }

    await this.checkParking(parkingId);
    return this.rateDAO.findByParking(parkingId);
  }

  /**
   * Aggiorna una tariffa.
   * I dati nel body sono validati da Zod (updateRateSchema).
   */
  async updateRate(id: string, data: UpdateRateInput): Promise<Rate> {
    if (!id) {
      throw new BadRequestError("ID mancante");
    }

    const existing = await this.rateDAO.findById(id);
    if (!existing) {
      throw new NotFoundError("Tariffa", id);
    }

    // Garantisce che il parkingId non venga modificato durante l'aggiornamento della tariffa
    if ((data as any).parkingId) {
      throw new ValidationError("Non è permesso modificare il parkingId di una tariffa esistente");
    }

    const updated = await this.rateDAO.update(id, data as any);
    if (!updated) {
      throw new DatabaseError("Impossibile aggiornare la tariffa");
    }

    return updated;
  }

  /**
   * Elimina una tariffa.
   */
  async deleteRate(id: string): Promise<void> {
    if (!id) {
      throw new BadRequestError("ID mancante");
    }

    const exists = await this.rateDAO.findById(id);
    if (!exists) {
      throw new NotFoundError("Tariffa", id);
    }

    const ok = await this.rateDAO.delete(id);
    if (!ok) {
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