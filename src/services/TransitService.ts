import { Transit } from "../models/Transit";
import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { GateDAO } from "../dao/GateDAO";
import { VehicleDAO } from "../dao/VehicleDAO";
import { TransitFilterDTO } from "../dto/TransitDTO";
import { UpdateTransitInput } from "../validation/TransitValidation";
import {
  ValidationError,
  DuplicateTransitError,
  DatabaseError,
  NotFoundError,
  OperationNotAllowedError,
  ForbiddenError,
} from "../errors/CustomErrors";
import {
  getParkingOrThrow,
  pickRandomVehicle,
  determineTransitTypeForGate,
  ensureCapacityForIn,
  updateParkingCapacityAfterTransit,
  detectPlateForGate,
} from "../utils/TransitUtils";
import { PdfGenerator } from "../utils/PdfGenerator";
import { Op } from "sequelize";

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

      const newType = await determineTransitTypeForGate(
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

      const created = await this.transitDAO.create({
        parkingId: parking.id,
        gateId: gate.id,
        vehicleId: vehicle.plate,
        type: newType,
        date: new Date(),
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

  /**
   * Recupera lo storico transiti applicando filtri e regole di business.
   */
  async getTransitHistory(filters: TransitFilterDTO) {
    const { userId, userRole, from, to, plates, format } = filters;

    let allowedPlates: string[] = [];

    // 🔒 Caso DRIVER: può vedere SOLO le sue targhe
    if (userRole === "DRIVER") {
      const myVehicles = await this.vehicleDAO.findByOwner(userId);
      const myPlates = myVehicles.map((v) => v.plate); // attenzione: campo giusto del modello

      if (myPlates.length === 0) {
        // niente veicoli → niente transiti
        return format === "pdf"
          ? await PdfGenerator.createTransitReport([], from, to)
          : [];
      }

      // normalizzo helper
      const normalizePlate = (p: string) =>
        p.trim().toUpperCase().replace(/\s+/g, "");

      if (plates && plates.length > 0) {
        const requested = plates.map(normalizePlate);
        const invalid = requested.filter((p) => !myPlates.includes(p));

        if (invalid.length > 0) {
          throw new ForbiddenError(
            `Non hai i permessi per visualizzare le seguenti targhe: ${invalid.join(
              ", "
            )}`
          );
        }

        // tutte valide → uso solo quelle richieste
        allowedPlates = requested;
      } else {
        // nessuna targa passata → tutte le targhe dell’utente
        allowedPlates = myPlates;
      }
    } else {
      // 👷‍♂️ Caso OPERATOR: vede tutto oppure filtra per targhe
      if (plates && plates.length > 0) {
        const normalizePlate = (p: string) =>
          p.trim().toUpperCase().replace(/\s+/g, "");
        allowedPlates = plates.map(normalizePlate);
      } else {
        // nessun filtro → nessun vincolo su vehicleId
        allowedPlates = [];
      }
    }

    // 🧱 Costruisco la whereCondition da passare al DAO generico
    const whereCondition: any = {};

    if (allowedPlates.length > 0) {
      whereCondition.vehicleId = { [Op.in]: allowedPlates };
    }

    // NB: qui assumo che nel tuo DAO base esista findInDateRange(
    //   fieldName: string,
    //   from?: Date,
    //   to?: Date,
    //   additionalWhere?: any
    // )
    const transits = await this.transitDAO.findInDateRange(
      "date",
      from,
      to,
      whereCondition
    );

    // 📄 PDF o JSON
    if (format === "pdf") {
      return await PdfGenerator.createTransitReport(transits, from, to);
    }

    return transits;
  }
}
export default new TransitService();