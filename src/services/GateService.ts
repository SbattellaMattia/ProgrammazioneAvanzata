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

export class GateService {
  private readonly gateDAO: GateDAO;
  private readonly parkingDAO: ParkingDAO;

  constructor() {
    this.gateDAO = new GateDAO();
    this.parkingDAO = new ParkingDAO();
  }

  /**
   * Crea un nuovo gate.
   * I dati nel body sono già validati da Zod (createGateSchema).
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
   * Cerca un gate per ID.
   * Necessario per il middleware `ensureExists`.
   */
  async getById(id: string): Promise<Gate | null> {
    return this.gateDAO.findById(id);
  }

  /**
   * Restituisce tutti i gate.
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
   * Restituisce tutti i gate di un parcheggio.
   */
  async getByParking(parkingId: string): Promise<Gate[]> {
    await this.checkParking(parkingId);
    return this.gateDAO.findByParking(parkingId);
  }

  /**
   * Aggiorna un gate.
   * I dati nel body sono validati da Zod (updateGateSchema).
   *
   * In rotta userai:
   *  - validate(gateIdSchema, "params")
   *  - ensureExists(gateService, "Gate")
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
   * Elimina un gate.
   *
   * In rotta userai:
   *  - validate(gateIdSchema, "params")
   *  - ensureExists(gateService, "Gate")
   */
  async delete(id: string): Promise<void> {
    const ok = await this.gateDAO.delete(id);
    if (!ok) {
      // caso limite: già eliminato dopo ensureExists
      throw new DatabaseError("Errore eliminazione gate");
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
export default new GateService();
