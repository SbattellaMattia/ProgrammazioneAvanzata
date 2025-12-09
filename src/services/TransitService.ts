import { Transit } from "../models/Transit";
import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { GateDAO } from "../dao/GateDAO";
import { VehicleDAO } from "../dao/VehicleDAO";
import { UpdateTransitInput } from "../validation/TransitValidation";
import {
  ValidationError,
  DuplicateTransitError,
  DatabaseError,
  NotFoundError,
  OperationNotAllowedError,
} from "../errors/CustomErrors";
import {
  getParkingOrThrow,
  pickRandomVehicle,
  determineTransitType,
  ensureCapacityForIn,
  updateParkingCapacityAfterTransit,
  detectPlateForGate,
} from "../utils/TransitUtils";

class TransitService {
  private transitDAO = new TransitDAO();
  private parkingDAO = new ParkingDAO();
  private gateDAO = new GateDAO();
  private vehicleDAO = new VehicleDAO();

  /**
   * Crea un transito casuale per un gate specifico.
   */
  async createRandomTransitForGate(gateId: string): Promise<Transit> {
    try {
      const gate = await this.gateDAO.findById(gateId as any);
      if (!gate) throw new NotFoundError("Gate", gateId);

      const parking = await getParkingOrThrow(this.parkingDAO, gate.parkingId);
      const vehicle = await pickRandomVehicle(this.vehicleDAO);

      const newType = await determineTransitType(
        this.transitDAO,
        parking.id,
        vehicle.plate,
        gate.direction as "in" | "out" | "bidirectional"
      );

      ensureCapacityForIn(parking, vehicle, newType);

      const detectedPlate = await detectPlateForGate(gate, vehicle);

      if (vehicle.plate && detectedPlate !== vehicle.plate) {
        console.warn(
          `Targa rilevata (${detectedPlate}) diversa da targa veicolo (${vehicle.plate})`
        );
      }

      const now = new Date();

      const created = await this.transitDAO.create({
        parkingId: parking.id,
        gateId: gate.id,
        vehicleId: vehicle.plate,
        type: newType,
        date: now,
        detectedPlate,
      } as any);

      await updateParkingCapacityAfterTransit(
        this.parkingDAO,
        parking,
        vehicle,
        newType
      );

      return created;
    } catch (err: any) {
      if (
        err instanceof ValidationError ||
        err instanceof DuplicateTransitError ||
        err instanceof NotFoundError ||
        err instanceof OperationNotAllowedError
      ) {
        throw err;
      }
      throw new DatabaseError(
        "Errore durante la creazione del transito random per gate",
        err
      );
    }
  }

  /**
   * Recupera tutti i transiti. 
   */
  async getAll(): Promise<Transit[]> {
    try {
      return await this.transitDAO.findAll();
    } catch (error: any) {
      throw new DatabaseError(
        "Errore nel recupero di tutti i transiti",
        error
      );
    }
  }

  /**
   * Recupera un transito per ID.
   */
  async getById(id: string): Promise<Transit | null> {
    return this.transitDAO.findById(id);
  }

  /**
   * Recupera i transiti associati a un gate specifico.
   */
  async getTransitsByGate(gateId: string): Promise<Transit[]> {
    const exists = await this.gateDAO.existsById(gateId);
    if (!exists) throw new NotFoundError("Gate", gateId);

    return this.transitDAO.findByGate(gateId);
  }

  /**
   * Aggiorna un transito esistente.
   */
  async updateTransit(id: string, data: UpdateTransitInput): Promise<Transit> {
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
   * Cancella un transito esistente.
   */
  async deleteTransit(id: string): Promise<void> {
    const ok = await this.transitDAO.delete(id);
    if (!ok) {
      throw new DatabaseError("Errore eliminazione transito");
    }
  }

  /**
   * Converte una stringa in formato "dd/mm/yyyy hh:mm:ss" in un oggetto Date.
   */
  private parseToDate(value: string): Date {
    const [date, time] = value.trim().split(" ");
    const [dd, mm, yyyy] = date.split("/").map(Number);
    const [hh, mi, ss] = time.split(":").map(Number);
    return new Date(yyyy, mm - 1, dd, hh, mi, ss);
  }
}

export default new TransitService();