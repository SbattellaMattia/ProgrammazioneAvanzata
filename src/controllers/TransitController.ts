// src/controllers/TransitController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/AsyncHandler";
import TransitService from "../services/TransitService";
import { TransitFilterDTO } from '../dto/TransitDTO';
import Transit from "../models/Transit";

class TransitController {
  /**
   * Crea un transito random per un gate
   */
  createRandomTransitForGate = asyncHandler(async (req: Request, res: Response) => {
    const { id: gateId } = req.params;

    const transit = await TransitService.createRandomTransitForGate(gateId);

    return res.status(StatusCodes.CREATED).json(transit);
  });

  /**
   * Ottieni tutti i transiti
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const transits = await TransitService.getAll();
    return res.status(StatusCodes.OK).json(transits);
  });

  /**
   * Ottieni transito per ID (da res.locals.entity)
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    return res.status(StatusCodes.OK).json(transit);
  });

  /**
   * Aggiorna un transito (con istanza in res.locals.entity)
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    const updatedTransit = await transit.update(req.body);
    return res.status(StatusCodes.OK).json(updatedTransit);
  });

  /**
   * Elimina un transito
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    await transit.destroy();
    return res
      .status(StatusCodes.OK)
      .json({ message: "Transit eliminato con successo" });
  });


  
  getHistory = asyncHandler(async (req: Request, res: Response) => {
    // 1. Estrai dati dalla Query e dall'Utente (dal middleware auth)
    const { from, to, plates, format } = req.query;
    const user = (req as any).user; // Popolato dal middleware JWT

    // 2. Prepara il DTO
    const filters: TransitFilterDTO = {
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      // Se plates è una stringa singola ("AB123"), la trasformo in array
      plates: plates ? (Array.isArray(plates) ? plates as string[] : [plates as string]) : undefined,
      format: format as 'json' | 'pdf',
      userId: user.id,
      userRole: user.role
    };

    // 3. Chiama Service
    const result = await TransitService.getTransitHistory(filters);

    // 4. Gestione Risposta (PDF o JSON)
    if (filters.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=transiti.pdf');
      return res.send(result);
    }

    return res.json(result);
  });
}

export default new TransitController();