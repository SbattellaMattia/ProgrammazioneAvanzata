// src/middlewares/tokenCredit.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { userDAO } from '../dao/UserDAO';
import { ForbiddenError, InsufficientTokensError, NotFoundError, UnauthorizedError } from '../errors';

/**
 * Middleware che verifica se l'utente ha token credito disponibili
 * Da usare sulle rotte che consumano token
 */
export const checkTokenCredit = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Verifica che l'utente sia autenticato
        if (!req.user || !req.user.id) {
            throw new UnauthorizedError('Utente non autenticato');
        }
        const user = await userDAO.findById(req.user.id);
        if (!user) {
            throw new UnauthorizedError('Utente non trovato');
        }

        // Verifica token disponibili
        !(await userDAO.checkTokens(req.user.id)) ? new InsufficientTokensError() : null;
    
        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware che consuma 1 token credito
 * Da usare DOPO il controller (quando l'operazione è riuscita)
 */
export const consumeToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user || !req.user.id) {
            return next();
        }
        const user = await userDAO.findById(req.user.id);
        if (!user) {
            throw new NotFoundError('Utente non trovato');
        }
        await userDAO.decrementTokens(req.user.id, 1);
        

        next();
    } catch (error) {
        console.error('Errore nel consumare token:', error);
        next();
    }
};
