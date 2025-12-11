import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import RateService from '../services/RateService';
import Rate from '../models/Rate';
import { RateDAO } from '../dao/RateDAO';

class RateController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const Rate = await RateService.create(req.body);
    return res.status(StatusCodes.CREATED).json(Rate);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const Rates = await RateService.getAll();
    return res.status(StatusCodes.OK).json(Rates);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const Rate = res.locals.entity as RateDAO; 
    return res.status(StatusCodes.OK).json(Rate);
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const Rate = res.locals.entity as Rate;
    const updatedRate = await Rate.update(req.body);
    
    return res.status(StatusCodes.OK).json(updatedRate);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const Rate = res.locals.entity as Rate; 
    await Rate.destroy();
    return res.status(StatusCodes.OK).json({ message: 'Tariffa eliminata con successo' });
  });
}

export default new RateController();
