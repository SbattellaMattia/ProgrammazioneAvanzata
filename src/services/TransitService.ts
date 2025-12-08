import { Transit } from "../models/Transit";
import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { GateDAO } from "../dao/GateDAO";
import { VehicleDAO } from "../dao/VehicleDAO";
import { TransitType } from "../enum/TransitType";
import { GateType } from "../enum/GateType";
import {CreateTransitInput, UpdateTransitInput,} from "../validation/TransitValidation";
import {
  ValidationError,
  DuplicateTransitError,
  DatabaseError,
  NotFoundError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";



export class TransitService {
  private transitDAO = new TransitDAO();
  private parkingDAO = new ParkingDAO();
  private gateDAO = new GateDAO();
  private vehicleDAO = new VehicleDAO();

  /**
   * Crea una nuovo transito.
   * I dati nel body sono già validati da Zod (createTransitSchema).
   */
  async createTransit(data: CreateTransitInput): Promise<Transit> {
    try {
      const {
        parkingId,
        gateId,
        vehicleId,
        type,
        date,
        imageData,
        detectedPlate,
      } = data;

      // Verifiche logiche di business
      await this.checkParking(parkingId);
      const gate = await this.checkGate(gateId, parkingId);
      await this.checkVehicleByPlate(vehicleId);

      // imageData obbligatoria se gate standard
      if (gate.type === GateType.STANDARD && !imageData) {
        throw new ValidationError(
          "imageData obbligatoria per varchi di tipo STANDARD"
        );
      }

      // parsing della data
      const parsedDate = this.parseToDate(date);

      // controllo transiti consecutivi
      await this.checkTransitSequence(parkingId, vehicleId, type);

      return await this.transitDAO.create({
        parkingId,
        gateId,
        vehicleId,
        type,
        date: parsedDate,
        imageData: imageData ?? null,
        detectedPlate: detectedPlate ?? null,
      } as any);

    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof DuplicateTransitError ||
        err instanceof NotFoundError
      ) {
        throw err;
      }
      throw new DatabaseError("Errore durante la creazione del transito", err);
    }
  }

   /**
   * Cerca una transito per ID.
   * Necessario per il middleware `ensureExists`.
   */
  async getById(id: string): Promise<Transit | null> {
      return this.transitDAO.findById(id);
    }

  /**
   * restituisce tutti i transiti di un varco
   */
  async getTransitsByGate(gateId: string): Promise<Transit[]> {
    const exists = await this.gateDAO.existsById(gateId);
    if (!exists) throw new NotFoundError("Gate", gateId);

    return this.transitDAO.findByGate(gateId);
  }

  /**
   * Aggiorna un transito.
   * I dati nel body sono validati da Zod (updateTransitSchema).
   *
   * I controlli sono fatti in rotta, ad esempio:
   *  - validate(transitIdSchema, "params")
   *  - ensureExists(TransitService, "Transito")
   * 
   */
  async updateTransit(id: string, data: UpdateTransitInput): Promise<Transit> {
    // non modificabili
    if ((data as any).parkingId || (data as any).gateId || (data as any).vehicleId) {
      throw new OperationNotAllowedError(
        "updateTransit",
        "parkingId, gateId e vehicleId non sono modificabili"
      );
    }

    const payload: any = { ...data };

    if (data.date) {
      payload.date = this.parseToDate(data.date);
    }

    const updated = await this.transitDAO.update(id, payload);
    if (!updated) throw new DatabaseError("Errore aggiornamento transito");

    return updated;
  }

  /**
   * Elimina un transito.
   *
   * I controlli sono fatti in rotta, ad esempio: 
   * - validate(transitIdSchema, "params")
   * - ensureExists(TransitService, "Transito")
   */
  async deleteTransit(id: string): Promise<void> {
    const ok = await this.transitDAO.delete(id);
    if (!ok) {
      // caso limite: già eliminato dopo ensureExists
      throw new DatabaseError("Errore eliminazione transito");
    }
  }

  /**
   * Verifica che il parcheggio esista.
   */
  private async checkParking(parkingId: string) {
    const exists = await this.parkingDAO.existsById(parkingId);
    if (!exists) throw new NotFoundError("Parking", parkingId);
  }

  /**
   * Verifica che il gate esista e appartenga al parcheggio.
   */
  private async checkGate(gateId: string, parkingId: string) {
    const gate = await this.gateDAO.findById(gateId as any);
    if (!gate) throw new NotFoundError("Gate", gateId);

    if (gate.parkingId !== parkingId) {
      throw new ValidationError("Il gate NON appartiene al parcheggio indicato");
    }

    return gate;
  }

  /**
   * Verifica che il veicolo esista (ricerca per targa).
   */
  private async checkVehicleByPlate(plate: string) {
    const vehicle = await this.vehicleDAO.findByPlate(plate);
    if (!vehicle) throw new NotFoundError("Veicolo", plate);
  }

  /**
   * Parsing del formato DD/MM/YYYY HH:MM:SS
   */
  private parseToDate(value: string): Date {
    const [date, time] = value.trim().split(" ");
    const [dd, mm, yyyy] = date.split("/").map(Number);
    const [hh, mi, ss] = time.split(":").map(Number);
    return new Date(yyyy, mm - 1, dd, hh, mi, ss);
  }

  /**
   * Controlla la sequenza logica dei transiti (IN/OUT)
   * Es: non si può fare OUT se non c'è un IN precedente
   */
  private async checkTransitSequence(parkingId: string, vehicleId: string, newType: TransitType) {
    const all = await this.transitDAO.findByParking(parkingId);

    const filtered = all
      .filter(t => t.vehicleId === vehicleId)
      .sort((a, b) => a.date.getTime() - b.date.getTime());

    const last = filtered[filtered.length - 1];

    if (!last) {
      if (newType === TransitType.OUT) {
        throw new ValidationError("Non puoi registrare un'uscita senza un ingresso precedente");
      }
      return;
    }

    if (last.type === TransitType.IN && newType === TransitType.IN) {
      throw new ValidationError("Esiste già un ingresso aperto");
    }

    if (last.type === TransitType.OUT && newType === TransitType.OUT) {
      throw new ValidationError("Non puoi registrare due uscite consecutive");
    }
  }
}