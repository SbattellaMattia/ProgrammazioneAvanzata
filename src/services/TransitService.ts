import path from "path";
import os from "os";
import fs from "fs";
import { PdfGenerator } from "../utils/PdfGenerator";
import { Op } from "sequelize";
import { ocr } from "../utils/Ocr/OcrService";
import { Transit } from "../models/Transit";
import { TransitDAO } from "../dao/TransitDAO";
import { ParkingDAO } from "../dao/ParkingDAO";
import { GateDAO } from "../dao/GateDAO";
import { VehicleDAO } from "../dao/VehicleDAO";
import { TransitFilterDTO, TransitReportDTO } from "../dto/TransitDTO";
import { UpdateTransitInput } from "../validation/TransitValidation";
import { TransitType } from "../enum/TransitType";
import { GateType } from "../enum/GateType";
import { Vehicle } from "../models/Vehicle";
import InvoiceService from "../services/InvoiceService";
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
  determineTransitTypeForGate,
  ensureCapacityForIn,
  updateParkingCapacityAfterTransit,
} from "../utils/TransitUtils";


class TransitService {
  private transitDAO = new TransitDAO();
  private parkingDAO = new ParkingDAO();
  private gateDAO = new GateDAO();
  private vehicleDAO = new VehicleDAO();

  /**
   * Crea un transito casuale per un gate specifico.
   */
  async createFromGateCapture(
    gateId: string,
    file: Express.Multer.File | null,
    body: any
  ): Promise<Transit> {
    // carico il gate e il parcheggio
    const gate = await this.gateDAO.findById(gateId as any);
    if (!gate) {
      throw new NotFoundError("Gate", gateId);
    }

    const parking = await getParkingOrThrow(this.parkingDAO, gate.parkingId);

    // in base al tipo di gate ricavo la targa dal body
    let detectedPlate: string | null = null;

    if (gate.type === GateType.STANDARD) {
      // ci aspettiamo un'immagine
      if (!file) {
        throw new ValidationError("File immagine mancante per gate STANDARD");
      }
      if (!file.mimetype.startsWith("image/")) {
        throw new ValidationError("Il file deve essere un'immagine");
      }

      
      const tmpPath = path.join(
        os.tmpdir(),
        `gate_${gateId}_${Date.now()}.png`
      );
      await fs.promises.writeFile(tmpPath, file.buffer);

      detectedPlate = await ocr(tmpPath); 

      console.log("OCR plate:", detectedPlate);
    } else if (gate.type === GateType.SMART) {
      // ci aspettiamo il JSON nel body
      // es: { "plate": "AA000AA" } o simile
      const plate =
        body.plate ||
        body.licensePlate ||
        (body.vehicle && body.vehicle.plate);

      if (!plate) {
        throw new ValidationError(
          "Per gate SMART è richiesto un JSON con la targa (plate)"
        );
      }

      detectedPlate = String(plate);
    } else {
      throw new ValidationError(
        `Tipo gate non supportato: ${gate.type}`
      );
    }

    if (!detectedPlate) {
      throw new ValidationError("Impossibile determinare la targa del veicolo");
    }

    const normalizedPlate = detectedPlate.trim().toUpperCase().replace(/\s+/g, "");
    console.log("Targa normalizzata:", normalizedPlate);

    // 3) recupero il veicolo a partire dalla targa
    const vehicle = await this.vehicleDAO.findByPlate(normalizedPlate);
    if (!vehicle) {
      throw new NotFoundError("Vehicle", normalizedPlate);
    }

    // 4) decido IN/OUT in base allo storico
    const newType = await determineTransitTypeForGate(
      this.transitDAO,
      parking.id,
      vehicle.plate,
      gate.direction as "in" | "out" | "bidirectional"
    );

    // capacità
    ensureCapacityForIn(parking, vehicle, newType);

    // 5) creo il transito
    const created = await this.transitDAO.create({
      parkingId: parking.id,
      gateId: gate.id,
      vehicleId: vehicle.plate,
      type: newType,
      date: new Date(),
      detectedPlate: normalizedPlate,
    } as any);

    // aggiorno capacità parcheggio
    await updateParkingCapacityAfterTransit(
      this.parkingDAO,
      parking,
      vehicle,
      newType
    );

    // 6) se è un'uscita provo a creare fattura
    await this.tryCreateInvoiceForExit(created, vehicle);

    return created;
  }

  /**
   * Recupera un transito per ID.
   */
  async getById(id: string): Promise<Transit | null> {
    return this.transitDAO.findById(id);
  }

  async getAll(): Promise<Transit[]> {
    return this.transitDAO.findAll({ order: [["date", "DESC"]] });
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
  async getTransitHistory(filters: TransitFilterDTO): Promise<TransitReportDTO[] | Buffer> {
    const { userId, userRole, from, to, plates, format } = filters;

    let allowedPlates: string[] = [];

    // DRIVER → può vedere SOLO le sue targhe
    if (userRole === "DRIVER") {
      const myVehicles = await this.vehicleDAO.findByOwner(userId!);
      const myPlates = myVehicles.map(v => v.plate);

      if (myPlates.length === 0) {
        return format === "pdf"
          ? await PdfGenerator.createTransitReport([], from, to)
          : [];
      }

      const normalize = (p: string) => p.trim().toUpperCase();

      if (plates && plates.length > 0) {
        const requested = plates.map(normalize);
        const invalid = requested.filter(p => !myPlates.includes(p));

        if (invalid.length > 0) {
          throw new ForbiddenError(`Non puoi vedere: ${invalid.join(", ")}`);
        }

        allowedPlates = requested;
      } else {
        allowedPlates = myPlates;
      }

    } else {
      // OPERATORE
      allowedPlates = plates?.map(p => p.trim().toUpperCase()) || [];
    }

    // WHERE CLAUSE dinamica
    const where: any = {};
    if (allowedPlates.length > 0) {
      where.vehicleId = { [Op.in]: allowedPlates };
    }

    const transits = await this.transitDAO.findInDateRange(
      "date",
      from,
      to,
      where
    );

    const reportRows: TransitReportDTO[] = [];

    for (const t of transits) {
      const vehicle = await this.vehicleDAO.findByPlate(t.vehicleId);

      reportRows.push({
        date: t.date,
        vehicleId: t.vehicleId,
        transitType: t.type,
        gateId: t.gateId,
        vehicleType: vehicle?.type ?? "UNKNOWN",
      });
    }

    // PDF?
    if (format === "pdf") {
      return await PdfGenerator.createTransitReport(reportRows, from, to);
    }

    return reportRows;
  }

  private async tryCreateInvoiceForExit(exitTransit: Transit,vehicle: Vehicle): Promise<void> {
  // Se non è un'uscita, non faccio nulla
    if (exitTransit.type !== TransitType.OUT) return;

    // 1) prendo TUTTI i transiti di quel parcheggio
    const allTransitsForParking = await this.transitDAO.findByParking(exitTransit.parkingId);
    // WHERE TYPE IN filtra prima

    // 2) filtro solo gli IN della stessa targa con data < uscita
    const candidateEntries = allTransitsForParking
      .filter(
        (t) =>
          t.vehicleId === exitTransit.vehicleId &&
          t.type === TransitType.IN &&
          new Date(t.date) < new Date(exitTransit.date)
      )
      .sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
      ); // più recente prima

    if (candidateEntries.length === 0) {
      // nessun IN valido → niente fattura
      console.log(
        `Nessun transito IN precedente trovato per veicolo ${exitTransit.vehicleId} in parking ${exitTransit.parkingId}`
      );
      return;
    }

    const entryTransit = candidateEntries[0];

    

    // 5) crea fattura usando il tuo InvoiceService
    const invoice = await InvoiceService.createInvoiceFromTransits(
      vehicle.ownerId,
      exitTransit.parkingId,
      entryTransit.id,
      exitTransit.id
    );

    console.log(
      `Fattura creata auto: user=${vehicle.ownerId}, parking=${exitTransit.parkingId}, entry=${entryTransit.id}, exit=${exitTransit.id}, amount=${invoice.amount}`
    );
  }
}
export default new TransitService();