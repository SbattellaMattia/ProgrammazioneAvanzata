import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import RateService from '../services/RateService';
import Rate from '../models/Rate';
import { RateDAO } from '../dao/RateDAO';

/**
 * Controller per la gestione delle tariffe.
 * Gestisce le richieste correlate alle tariffe, come la creazione,
 * il recupero e l'aggiornamento delle tariffe.
 * @class RateController
 * @description Questo controller gestisce le operazioni CRUD per le tariffe.
 */
class RateController {

  /** Crea una nuova tariffa.
   * @route POST /rates
   * @param req - La richiesta HTTP contenente i dati della tariffa.
   * @param res - La risposta HTTP con la tariffa creata.
   * @returns La tariffa creata in formato JSON.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const Rate = await RateService.create(req.body);
    return res.status(StatusCodes.CREATED).json(Rate);
  });

  /** Recupera tutte le tariffe.
   * @route GET /rates
   * @param req - La richiesta HTTP.
   * @param res - La risposta HTTP con l'elenco delle tariffe.
   * @returns L'elenco delle tariffe in formato JSON.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const Rates = await RateService.getAll();
    return res.status(StatusCodes.OK).json(Rates);
  });

  /** Recupera una tariffa per ID.
   * @route GET /rates/:id
   * @param req - La richiesta HTTP contenente l'ID della tariffa.
   * @param res - La risposta HTTP con la tariffa trovata.
   * @returns La tariffa trovata in formato JSON.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const Rate = res.locals.entity as RateDAO; 
    return res.status(StatusCodes.OK).json(Rate);
  });

  /** Aggiorna una tariffa esistente.
   * @route PUT /rates/:id
   * @param req - La richiesta HTTP contenente l'ID della tariffa e i nuovi dati.
   * @param res - La risposta HTTP con la tariffa aggiornata.
   * @returns La tariffa aggiornata in formato JSON.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const rate = res.locals.entity as Rate;
    const updatedRate = await RateService.update(rate.id, req.body);
    return res.status(StatusCodes.OK).json({
      message: "Tariffa aggiornata con successo",
      data: updatedRate,
    });
  });

  /** Elimina una tariffa esistente.
   * @route DELETE /rates/:id
   * @param req - La richiesta HTTP contenente l'ID della tariffa.
   * @param res - La risposta HTTP con il messaggio di conferma.
   * @returns Un messaggio di conferma dell'eliminazione.
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
      const rate = res.locals.entity as Rate;
      await RateService.delete(rate);
      return res.status(StatusCodes.OK).json({ message: "Tariffa eliminata con successo" });
  });
}

export default new RateController();
