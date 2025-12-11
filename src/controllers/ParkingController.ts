import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import ParkingService from '../services/ParkingService';
import Parking from '../models/Parking';
import { ParkingDAO } from '../dao/ParkingDAO';

class ParkingController {

  create = asyncHandler(async (req: Request, res: Response) => {
    const parking = await ParkingService.create(req.body);
    return res.status(StatusCodes.CREATED).json(parking);
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const parkings = await ParkingService.getAll();
    return res.status(StatusCodes.OK).json(parkings);
  });

  // GET: L'entità è già stata trovata dal middleware!
  getById = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as ParkingDAO; 
    return res.status(StatusCodes.OK).json(parking);
  });


  update = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as Parking;
    const updatedParking = await parking.update(req.body);
    return res.status(StatusCodes.OK).json(updatedParking);
  });

  
  delete = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as Parking;
    await parking.destroy();
    return res.status(StatusCodes.OK).json({ message: 'Parcheggio eliminato con successo' });
  });
}

export default new ParkingController();
