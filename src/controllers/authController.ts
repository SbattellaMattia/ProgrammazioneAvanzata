import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';
import { asyncHandler } from '../utils/AsyncHandler';

/**
 * Controller per la gestione dell'autenticazione.
 * Gestisce le richieste di login.  
 * @class AuthController
 * @constructor
 * @param {AuthService} authService - Il servizio di autenticazione.
 * @description Questo controller gestisce le richieste di login degli utenti.
 * Il metodo `login` riceve le credenziali dell'utente, le passa al servizio di autenticazione
 * e restituisce una risposta con il token JWT in caso di successo.
 * Il token JWT può essere utilizzato per autenticare le richieste successive.
 */
export class AuthController {
  constructor(private authService: AuthService) {}
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login effettuato con successo',
      data: result,
    });
  });
}
