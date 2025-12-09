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
import { PdfGenerator } from "../utils/PdfGenerator";
import { Op } from "sequelize";

export interface TransitFilterDTO {
  plates?: string[];      // Lista targhe (opzionale per operatore)
  from?: Date;
  to?: Date;
  userId: string;         // ID dell'utente che fa la richiesta
  userRole: string;       // Ruolo (DRIVER o OPERATOR)
  format?: 'json' | 'pdf';
}

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

  /**
   * Recupera lo storico transiti applicando filtri e regole di business.
   */
  async getTransitHistory(filters: TransitFilterDTO) {
    
    // 1. Logica di Sicurezza (Filtro Targhe)
    let allowedPlates: string[] = [];

    if (filters.userRole === 'DRIVER') {
      // Il Driver DEVE vedere solo i suoi veicoli.
      // Ignoriamo le targhe passate nel filtro se non sono sue, o forziamo solo le sue.
      const myVehicles = await this.vehicleDAO.findByOwner(filters.userId);
      const myPlates = myVehicles.map(v => v.plate); // Assumo licensePlate

      if (filters.plates && filters.plates.length > 0) {
        // Se ha chiesto targhe specifiche, incrociamo con quelle che possiede
        allowedPlates = filters.plates.filter(p => myPlates.includes(p));
      } else {
        // Se non ha specificato nulla, mostriamo TUTTE le sue
        allowedPlates = myPlates;
      }

      // Se non ha veicoli o le targhe richieste non sono sue -> Lista vuota
      if (allowedPlates.length === 0) {
        return filters.format === 'pdf' ? Buffer.from('') : []; // O throw Error
      }
    } else {
      // OPERATORE: Può vedere tutto o filtrare per targhe specifiche
      allowedPlates = filters.plates || [];
    }


    // 2. Costruzione Query al DAO
    // Usiamo il metodo findInDateRange del DAO Generico, ma ci serve un 'additionalWhere'
    // per le targhe.
    const whereCondition: any = {};
    
    // Se ci sono targhe da filtrare (sempre vero per Driver, opzionale per Operatore)
    if (allowedPlates.length > 0) {
      whereCondition['vehicleId'] = { [Op.in]: allowedPlates };
    }

    // 3. Esecuzione Query (Usa il metodo generico che hai creato nel DAO)
    const transits = await this.transitDAO.findInDateRange(
      'date', // o 'ingress' a seconda del tuo model
      filters.from,
      filters.to,
      whereCondition
    );

    // 4. Arricchimento Dati (Opzionale, se findInDateRange non fa le include)
    // Se il DAO non ritorna i nomi dei varchi, dovresti fare un map qui o usare include nel DAO.
    // Assumiamo che transits abbia già i dati necessari o che il controller li formatti.
    
    // 5. Output PDF o JSON
    if (filters.format === 'pdf') {
      // Chiama una nuova funzione dell'utility PDF (da implementare sotto)
      return await PdfGenerator.createTransitReport(transits, filters.from, filters.to);
    }

    return transits;
  }
}

export default new TransitService();