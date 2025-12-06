import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { StatusCodes } from 'http-status-codes';

/**
 * AuthController gestisce le richieste HTTP relative all'autenticazione degli utenti.
 * come il login. È responsabile del collegamento tra le richieste HTTP e la logica
 * di business contenuta in `AuthService`.
 * Viene utilizzato nella definizione delle rotte di autenticazione (es. in `authRoutes.ts`)
 * per gestire l'endpoint `POST /login`.
 * @class AuthController
 * @constructor
 * @param {AuthService} authService - Istanza del servizio di autenticazione.
 * @description Questa classe contiene i metodi per gestire le richieste di login degli utenti.
 * Il metodo `login` accetta le credenziali dell'utente (email e password) e restituisce un token JWT se l'autenticazione ha successo.
 * Il token può essere utilizzato per autenticare le richieste successive.
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Metodo per gestire la richiesta di login degli utenti.
   * @function login
   * @async
   * @param req - La richiesta HTTP contenente le credenziali dell'utente.
   * @param res - La risposta HTTP da inviare al client.
   * @param next - Funzione per passare il controllo al middleware successivo in caso di errore.
   * @returns {Promise<void>} - Non restituisce nulla, ma invia una risposta al client o passa l'errore al middleware di gestione degli errori.
   * @throws {Error} - Se le credenziali sono errate o se si verifica un errore durante il processo di login.
   */

}