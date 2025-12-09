import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import StatsService from '../services/StatsService';
import { StatsQueryDTO } from '../validation/StatsValidator';
import { Parking } from '../models/Parking';

class StatsController {

  getGlobalStats = asyncHandler(async (req: Request, res: Response) => {
    // 1. I dati sono già validati da Zod nel middleware e si trovano in req.query
    // Facciamo un cast sicuro grazie all'inferenza di Zod
    const filters = req.query as unknown as StatsQueryDTO;

    // 2. Chiamata al Service
    const data = await StatsService.getGlobalRevenueStats(filters.from, filters.to);

    // 3. Gestione risposta PDF (Pseudo-codice)
    if ((data as any).isPdf) {
       // res.setHeader('Content-Type', 'application/pdf');
       // return res.send(data.pdfBuffer);
       return res.status(StatusCodes.OK).json({ message: "PDF generato (mock)" });
    }

    // 4. Risposta JSON standard
    return res.status(StatusCodes.OK).json(data);
  });

  getParkingStats = asyncHandler(async (req: Request, res: Response) => {
    // entity caricato da ensureExists(ParkingService, 'Parcheggio')
    const parking = res.locals.entity as Parking;

    const filters = req.query as unknown as StatsQueryDTO;

    const data = await StatsService.getParkingRevenueStats(
      { id: parking.id, name: parking.name },
      filters.from,
      filters.to
    );

    if (filters.format === "pdf") {
      // TODO: generazione PDF vera
      return res
        .status(StatusCodes.OK)
        .json({ message: "PDF generato (mock)", data });
    }

    return res.status(StatusCodes.OK).json(data);
  });
}

export default new StatsController();
