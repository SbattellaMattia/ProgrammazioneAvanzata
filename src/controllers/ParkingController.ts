import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import ParkingService from '../services/ParkingService';
import Parking from '../models/Parking';
import { ParkingDAO } from '../dao/ParkingDAO';

/**
 * Controller per la gestione dei Parcheggi.
 * Gestisce le operazioni CRUD e le richieste correlate ai Parcheggi.
 * @class ParkingController
 * @description Questo controller gestisce le operazioni CRUD per i Parcheggi.
 * Include metodi per creare, leggere, aggiornare ed eliminare Parcheggi.
 */
class ParkingController {

  /** Crea un nuovo Parcheggio.
   * @route POST /parkings
   * @param {Request} req - La richiesta HTTP contenente i dati del Parcheggio.
   * @param {Response} res - La risposta HTTP con il Parcheggio creato.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const parking = await ParkingService.create(req.body);
    return res.status(StatusCodes.CREATED).json(parking);
  });

  /** Ottiene tutti i Parcheggi.
   * @route GET /parkings
   * @param {Request} req - La richiesta HTTP.
   * @param {Response} res - La risposta HTTP con l'elenco dei Parcheggi.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const parkings = await ParkingService.getAll();
    return res.status(StatusCodes.OK).json(parkings);
  });

  /** Ottiene un Parcheggio per ID.
   * @route GET /parkings/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Parcheggio.
   * @param {Response} res - La risposta HTTP con il Parcheggio richiesto.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as ParkingDAO; 
    return res.status(StatusCodes.OK).json(parking);
  });

  /** Aggiorna un Parcheggio esistente.
   * @route PUT /parkings/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Parcheggio e i dati aggiornati.
   * @param {Response} res - La risposta HTTP con il Parcheggio aggiornato.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as Parking;
    const updatedParking = await ParkingService.update(parking.id, req.body);
    return res.status(StatusCodes.OK).json(updatedParking);
  });

  /** Elimina un Parcheggio esistente.
   * @route DELETE /parkings/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Parcheggio.
   * @param {Response} res - La risposta HTTP con il messaggio di conferma.
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const parking = res.locals.entity as Parking;
    await ParkingService.delete(parking.id);
    return res.status(StatusCodes.OK).json({ message: 'Parcheggio eliminato con successo' });
  });
}

export default new ParkingController();
