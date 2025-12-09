// src/controllers/TransitController.ts
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/AsyncHandler";
import TransitService from "../services/TransitService";
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
}

export default new TransitController();