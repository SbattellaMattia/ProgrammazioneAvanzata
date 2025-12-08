import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import GateService from '../services/GateService';
import Gate from '../models/Gate';
import { GateDAO } from '../dao/GateDAO';

class GateController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const Gate = await GateService.create(req.body);
    return res.status(StatusCodes.CREATED).json(Gate);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const Gates = await GateService.getAll();
    return res.status(StatusCodes.OK).json(Gates);
  });

  // GET: L'entità è già stata trovata dal middleware!
  getById = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as GateDAO; 
    return res.status(StatusCodes.OK).json(Gate);
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    
    // Metodo di istanza di Sequelize (molto efficiente)
    const updatedGate = await Gate.update(req.body);
    
    return res.status(StatusCodes.OK).json(updatedGate);
  });

  // DELETE: Usiamo l'istanza trovata per distruggerla
  delete = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    
    await Gate.destroy();
    
    return res.status(StatusCodes.OK).json({ message: 'Gate eliminato con successo' });
  });
}

export default new GateController();
