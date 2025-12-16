import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { asyncHandler } from "../utils/AsyncHandler";
import TransitService from "../services/TransitService";
import { TransitFilterDTO } from '../dto/TransitDTO';
import Transit from "../models/Transit";

/** Controller per la gestione dei Transiti.
 * Gestisce le operazioni CRUD e le richieste correlate ai Transiti.
 * @class TransitController
 * @description Questo controller gestisce le operazioni CRUD per i Transiti.
 * Include metodi per creare, leggere, aggiornare ed eliminare Transiti,
 * nonché per ottenere la cronologia dei transiti con filtri specifici.
 */
class TransitController {
  
  /** Crea un nuovo transito da un Gate.
   * @route POST /gates/:id/transits
   * @param {Request} req - La richiesta HTTP contenente l'ID del Gate e i dati del transito.
   * @param {Response} res - La risposta HTTP con il transito creato.
   */
  createFromGate = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const transit = await TransitService.createFromGate(
      id,
      req.file || null,   // immagine se STANDARD
      req.body || {}      // JSON se SMART
    );

    return res.status(StatusCodes.CREATED).json(transit);
  });

  /** Ottieni tutti i transiti.
   * @route GET /transits
   * @param {Request} req - La richiesta HTTP.
   * @param {Response} res - La risposta HTTP con l'elenco dei transiti.
   */
  getAll = asyncHandler(async (req: Request, res: Response) => {
    const transits = await TransitService.getAll();
    return res.status(StatusCodes.OK).json(transits);
  });

  /** Ottieni un transito per ID.
   * @route GET /transits/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del transito.
   * @param {Response} res - La risposta HTTP con il transito richiesto.
   */
  getById = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    return res.status(StatusCodes.OK).json(transit);
  });

  /** Aggiorna un transito esistente.
   * @route PUT /transits/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del transito e i dati aggiornati.
   * @param {Response} res - La risposta HTTP con il transito aggiornato.
   */
  update = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    const updatedTransit = await TransitService.update(transit, req.body);
    return res.status(StatusCodes.OK).json(updatedTransit);
  });

  /** Elimina un transito esistente.
   * @route DELETE /transits/:id
   * @param {Request} req - La richiesta HTTP contenente l'ID del transito.
   * @param {Response} res - La risposta HTTP con il messaggio di conferma.
   */
  delete = asyncHandler(async (req: Request, res: Response) => {
    const transit = res.locals.entity as Transit;
    await TransitService.delete(transit);
    return res.status(StatusCodes.OK).json({ message: "Transito eliminato con successo" });
  });

  /** Ottieni la cronologia dei transiti con filtri.
   * @route GET /transits/history
   * @param {Request} req - La richiesta HTTP contenente i filtri per la cronologia.
   * @param {Response} res - La risposta HTTP con la cronologia dei transiti.
   */
  getHistory = asyncHandler(async (req: Request, res: Response) => {
    // 1. Estrai i filtri dalla query e l'utente dal token JWT
    const { from, to, plates, format } = req.query;
    const user = (req as any).user; 

    // 2. Prepara il DTO
    const filters: TransitFilterDTO = {
      from: from ? new Date(from as string) : undefined,
      to: to ? new Date(to as string) : undefined,
      // Se plates è una stringa singola ("AB123"), la trasformo in array
      plates: plates ? (Array.isArray(plates) ? plates as string[] : [plates as string]) : undefined,
      format: format as 'json' | 'pdf',
      userId: user.id,
      userRole: user.role
    };

    const result = await TransitService.getTransitHistory(filters);

    if (filters.format === 'pdf') {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=transiti.pdf');
      return res.send(result);
    }

    return res.json(result);
  });
 
}
export default new TransitController();