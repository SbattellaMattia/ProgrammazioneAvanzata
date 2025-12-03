
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/authService';
import jwt from 'jsonwebtoken';
import { CustomError, ErrorFactory } from '../factories/errorFactory';


/**
 * Middleware per l'autenticazione e l'autorizzazione degli utenti.
 * Questo middleware verifica la presenza e la validità del token JWT nell'header Authorization,
 * autenticando l'utente e assegnandolo all'oggetto `req.user`.
 * Inoltre, fornisce metodi per verificare il ruolo dell'utente (ad esempio, se è un automobilista o un operatore). 
 * @description
 * Questo middleware è utilizzato per proteggere le rotte che richiedono autenticazione e autorizzazione.
 * Se il token è mancante, scaduto o non valido, viene restituito un errore 401 (Unauthorized) o 403 (Forbidden).
 * Se l'utente non ha il ruolo richiesto, viene restituito un errore 403 (Forbidden).
 */

export class AuthMiddleware {
  constructor(private authService: AuthService) {}

  /**
   * Middleware per autenticare il token JWT presente nell'header Authorization.
   * Questo metodo verifica la validità del token e, se valido, aggiunge l'utente autenticato all'oggetto `req.user`.
   * @param req - La richiesta HTTP contenente l'header Authorization con il token JWT.
   * @param res - La risposta HTTP.
   * @param next - La funzione per passare al middleware successivo.
   * @throws CustomError Se il token è mancante, scaduto o non valido.
   * @returns void Passa al middleware successivo se l'autenticazione ha successo.
   */
  authenticateToken = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw ErrorFactory.unauthorized('Token mancante o non valido');
      }
    const token = authHeader.split(' ')[1];
    const user = this.authService.verifyToken(token);
    req.user = user;

    next();

  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      return next(ErrorFactory.unauthorized('Token scaduto'));
      }
    if (err instanceof CustomError) {
      return next(err);
    }
    return next(ErrorFactory.forbidden('Token non valido'));
  }
}

  /**
   * Middleware per verificare se l'utente ha il ruolo di automobilista.
   * Se l'utente non è autenticato o non ha il ruolo richiesto, viene restituito un errore 403 (Forbidden).
   * @param req - La richiesta HTTP.
   * @param res - La risposta HTTP.
   * @param next - La funzione per passare al middleware successivo.
   * @throws CustomError Se l'utente non è autorizzato ad accedere a questa rotta.
   * @returns void Passa al middleware successivo se l'utente ha il ruolo corretto.
   */
  isUser = (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ErrorFactory.forbidden('Accesso negato: utente non autorizzato'));
    }
    next();
  }

  /**
   * Middleware per verificare se l'utente ha il ruolo di operatore.
   * Se l'utente non è autenticato o non ha il ruolo richiesto, viene restituito un errore 403 (Forbidden).
   * @param req - La richiesta HTTP.
   * @param res - La risposta HTTP.
   * @param next - La funzione per passare al middleware successivo.
   * @throws CustomError Se l'utente non è autorizzato ad accedere a questa rotta.
   * @returns void Passa al middleware successivo se l'utente ha il ruolo corretto.
   */
  isOperator = (req: Request, res: Response, next: NextFunction) => {
    /*if (!req.user || req.user.role !== Roles.OPERATORE) {
      return next(ErrorFactory.forbidden('Accesso negato: utente non autorizzato'));
    }*/
    next();
  } 

}
