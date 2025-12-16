import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';
import GateService from '../services/GateService';
import Gate from '../models/Gate';
import { GateDAO } from '../dao/GateDAO';
import TransitService from '../services/TransitService';

/**
 * Controller per la gestione dei Gate.
 * Gestisce le operazioni CRUD e le richieste correlate ai Gate.
 * @class GateController
 * @description Questo controller gestisce le operazioni CRUD per i Gate.
 * Include metodi per creare, leggere, aggiornare ed eliminare Gate,
 * nonché per ottenere i transiti associati a un Gate specifico.
 */
class GateController {

  /** Crea un nuovo Gate.
   * @route POST /gates
   * @param {Request} req - La richiesta HTTP contenente i dati del Gate.
   * @param {Response} res - La risposta HTTP con il Gate creato.
   */
  create = asyncHandler(async (req: Request, res: Response) => {
    const Gate = await GateService.create(req.body);
    return res.status(StatusCodes.CREATED).json(Gate);
  });

  /** Ottiene tutti i Gate.
   * @route GET /gates
   * @param {Request} req - La richiesta HTTP.
   * @param {Response} res - La risposta HTTP con l'elenco dei Gate.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const Gates = await GateService.getAll();
    return res.status(StatusCodes.OK).json(Gates);
  });

  /** Ottiene un Gate per ID.
   * @route GET /gates/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Gate.
   * @param {Response} res - La risposta HTTP con il Gate richiesto.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as GateDAO; 
    return res.status(StatusCodes.OK).json(Gate);
  });

  /** Ottiene i transiti associati a un Gate.
   * @route GET /gates/:id/transits
   * @param {Request} req - La richiesta HTTP contenente l'ID del Gate.
   * @param {Response} res - La risposta HTTP con i transiti associati al Gate.
   */
  getTransitByGate = asyncHandler(async (req: Request, res: Response) => {
    const Transits = await TransitService.getTransitsByGate(res.locals.entity.id)
    return res.status(StatusCodes.OK).json(Transits);
  });

  /** Aggiorna un Gate esistente.
   * @route PUT /gates/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Gate e i dati aggiornati.
   * @param {Response} res - La risposta HTTP con il Gate aggiornato.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    const updatedGate = await Gate.update(req.body);
    return res.status(StatusCodes.OK).json(updatedGate);
  });

  /** Elimina un Gate esistente.
   * @route DELETE /gates/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del Gate.
   * @param {Response} res - La risposta HTTP con il messaggio di conferma.
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const Gate = res.locals.entity as Gate;
    await Gate.destroy();
    return res.status(StatusCodes.OK).json({ message: 'Gate eliminato con successo' });
  });
}

export default new GateController();
