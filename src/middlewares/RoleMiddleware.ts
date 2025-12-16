import { Request, Response, NextFunction } from 'express';
import { ForbiddenError, UnauthorizedError } from '../errors';
import { AuthService } from '../services/AuthService';
import { Role } from '../enum/Role';

/**
  * Middleware per la gestione dei ruoli degli utenti.
  * Fornisce metodi per verificare se l'utente ha il ruolo di operatore o automobilista.
  */
export class RoleMiddleware {
    constructor(private authService: AuthService) { }

    /**
      * Middleware per verificare se l'utente ha il ruolo di operatore.
      * Se l'utente non è autenticato o non ha il ruolo richiesto, viene restituito un errore.
      * @param req - La richiesta HTTP.
      * @param res - La risposta HTTP.
      * @param next - La funzione per passare al middleware successivo.
      * @throws UnauthorizedError Se l'utente non è autenticato.
      * @throws ForbiddenError Se l'utente non ha il ruolo richiesto.
      */
    isOperator = (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Utente non autenticato'));
        }
        if (req.user.role !== Role.OPERATOR) {
            return next(new ForbiddenError('Accesso negato: richiesto ruolo operatore'));
        }
        next();
    };

    /**
      * Middleware per verificare se l'utente ha il ruolo di automobilista.
      * Se l'utente non è autenticato o non ha il ruolo richiesto, viene restituito un errore.
      * @param req - La richiesta HTTP.
      * @param res - La risposta HTTP.
      * @param next - La funzione per passare al middleware successivo.
      * @throws UnauthorizedError Se l'utente non è autenticato.
      * @throws ForbiddenError Se l'utente non ha il ruolo richiesto.
      */
    isDriver = (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Utente non autenticato'));
        }
        if (req.user.role !== Role.DRIVER) {
            return next(new ForbiddenError('Accesso negato: richiesto ruolo automobilista'));
        }
        next();
    };
}