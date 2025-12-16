import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import StatsService from '../services/StatsService';
import { StatsQueryDTO } from '../validation/StatsValidation';
import { Parking } from '../models/Parking';
import { PdfGenerator } from "../utils/PdfGenerator";

/**
 * Controller per la gestione delle statistiche dei parcheggi.
 * Fornisce metodi per ottenere statistiche globali e specifiche dei parcheggi,
 * con supporto per formati di risposta JSON e PDF. 
 * @class StatsController
 * @description Questo controller gestisce le richieste relative alle statistiche dei parcheggi.
 * Include metodi per ottenere statistiche globali e specifiche dei parcheggi,
 * con supporto per formati di risposta JSON e PDF.
 */
class StatsController {

  /** Ottiene le statistiche globali dei parcheggi.
   * @route GET /stats/global
   * @param {Request} req - La richiesta HTTP contenente i filtri per le statistiche.
   * @param {Response} res - La risposta HTTP con le statistiche globali.
   */
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
  
  /** Ottiene le statistiche di un Parcheggio specifico.
   * @route GET /stats/parkings/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Parcheggio e i filtri per le statistiche.
   * @param {Response} res - La risposta HTTP con le statistiche del Parcheggio specifico.
   */
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

    return res.status(StatusCodes.OK).json(data);
  });
}

export default new StatsController();
