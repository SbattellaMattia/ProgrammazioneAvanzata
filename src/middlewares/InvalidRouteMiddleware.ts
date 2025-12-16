import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';

/**
 * Middleware per la gestione delle rotte non trovate.
 * @param req - la richiesta HTTP
 * @param res - la risposta HTTP 
 * @param next - la funzione next
 */
export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new NotFoundError('Rotta', req.originalUrl);
    next(error);
};
