import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import GateService from '../services/GateService';
import Gate from '../models/Gate';
import { GateDAO } from '../dao/GateDAO';
import TransitService from '../services/TransitService';

class GateController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const Gate = await GateService.create(req.body);
    return res.status(StatusCodes.CREATED).json(Gate);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const Gates = await GateService.getAll();
    return res.status(StatusCodes.OK).json(Gates);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as GateDAO; 
    return res.status(StatusCodes.OK).json(Gate);
  });

  getTransitByGate = asyncHandler(async (req: Request, res: Response) => {
    const Transits = await TransitService.getTransitsByGate(res.locals.entity.id)
    return res.status(StatusCodes.OK).json(Transits);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    const updatedGate = await Gate.update(req.body);
    return res.status(StatusCodes.OK).json(updatedGate);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    await Gate.destroy();
    return res.status(StatusCodes.OK).json({ message: 'Gate eliminato con successo' });
  });
}

export default new GateController();
