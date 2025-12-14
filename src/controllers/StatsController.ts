import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import StatsService from '../services/StatsService';
import { StatsQueryDTO } from '../validation/StatsValidation';
import { Parking } from '../models/Parking';
import { PdfGenerator } from "../utils/PdfGenerator";

class StatsController {

  getGlobalStats = asyncHandler(async (req: Request, res: Response) => {
  const filters = req.query as unknown as StatsQueryDTO;

  const data = await StatsService.getGlobalParkingStats(filters.from, filters.to);

  if (filters.format === 'pdf') {
      const pdfBuffer = await PdfGenerator.createAllParkingsStatsReport(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename= AllStats.pdf`
      );

      return res.status(StatusCodes.OK).send(pdfBuffer);
    }

  return res.status(StatusCodes.OK).json(data);
});
  

  getParkingStats = asyncHandler(async (req: Request, res: Response) => {
    // entity caricata da ensureExists(ParkingService, 'Parcheggio')
    const parking = res.locals.entity as Parking;

    const filters = req.query as unknown as StatsQueryDTO;

    const data = await StatsService.getParkingRevenueStats(
      { id: parking.id, name: parking.name },
      filters.from,
      filters.to
    );

    if (filters.format === 'pdf') {
      const pdfBuffer = await PdfGenerator.createParkingStatsReport(data);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=parking-stats-${parking.id}.pdf`
      );

      return res.status(StatusCodes.OK).send(pdfBuffer);
    }

    // default: JSON
    return res.status(StatusCodes.OK).json(data);
  });
}

export default new StatsController();
