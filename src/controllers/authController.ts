// src/controllers/AuthController.ts
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { StatusCodes } from 'http-status-codes';
import { ValidationError } from '../errors';
import { asyncHandler } from '../middlewares/asyncHandler';

/**
 * Controller per la gestione dell'autenticazione degli utenti.
 * 
 * Gestisce le richieste HTTP relative a:
 * - Login
 * - Registrazione
 * - Refresh token
 * - Logout
 * 
 * @class AuthController
 */
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Registra un nuovo utente nel sistema
   * 
   * @route POST /auth/register
   * @access Public
   * 
   * @param req.body.email - Email dell'utente
   * @param req.body.password - Password dell'utente
   * @param req.body.nome - Nome dell'utente (opzionale)
   * @param req.body.cognome - Cognome dell'utente (opzionale)
   * @param req.body.role - Ruolo dell'utente: 'operatore' | 'automobilista' (default: 'automobilista')
   * 
   * @returns {Object} - Dati utente e token JWT
   * @throws {ValidationError} - Se i dati non sono validi
   * @throws {ConflictError} - Se l'email è già registrata
   */
  register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password, nome, cognome, role } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email e password sono obbligatori', {
        email: !email ? 'Email richiesta' : undefined,
        password: !password ? 'Password richiesta' : undefined,
      });
    }

    // Validazione email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Formato email non valido');
    }

    // Validazione password (minimo 8 caratteri)
    if (password.length < 8) {
      throw new ValidationError('La password deve contenere almeno 8 caratteri');
    }

    // Chiama service per registrare
    const result = await this.authService.register({
      email,
      password,
      nome,
      cognome,
      role,
    });

    return res.status(StatusCodes.CREATED).json({
      success: true,
      message: 'Registrazione completata con successo',
      data: {
        user: result.user,
        token: result.token,
      },
    });
  });

  /**
   * Effettua il login di un utente
   * 
   * @route POST /auth/login
   * @access Public
   * 
   * @param req.body.email - Email dell'utente
   * @param req.body.password - Password dell'utente
   * 
   * @returns {Object} - Token JWT e informazioni utente
   * @throws {ValidationError} - Se email o password mancano
   * @throws {InvalidCredentialsError} - Se le credenziali sono errate
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new ValidationError('Email e password sono obbligatori', {
        email: !email ? 'Email richiesta' : undefined,
        password: !password ? 'Password richiesta' : undefined,
      });
    }

    // Chiama service per login
    const result = await this.authService.login(email, password);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Login effettuato con successo',
      data: {
        token: result.token,
        user: result.user,
      },
    });
  });

  /**
   * Ottiene le informazioni dell'utente autenticato
   * 
   * @route GET /auth/me
   * @access Private
   * 
   * @param req.user - Utente autenticato (dal middleware authenticateToken)
   * 
   * @returns {Object} - Informazioni utente
   */
  getMe = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const user = await this.authService.getUserById(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      data: user,
    });
  });

  /**
   * Effettua il logout dell'utente (invalidazione token lato client)
   * 
   * @route POST /auth/logout
   * @access Private
   * 
   * @returns {Object} - Messaggio di conferma
   */
  logout = asyncHandler(async (req: Request, res: Response) => {
    // Con JWT stateless, il logout è gestito lato client
    // (rimuovendo il token dal localStorage/cookie)
    
    // Opzionale: se usi una blacklist per i token
    // await this.authService.blacklistToken(req.headers.authorization);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Logout effettuato con successo',
    });
  });

  /**
   * Refresh del token JWT
   * 
   * @route POST /auth/refresh
   * @access Private
   * 
   * @param req.user - Utente autenticato
   * 
   * @returns {Object} - Nuovo token JWT
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;

    const newToken = await this.authService.refreshToken(userId);

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Token aggiornato con successo',
      data: {
        token: newToken,
      },
    });
  });
}

// ✅ Export singleton instance (pattern migliore)
const authService = new AuthService();
export const authController = new AuthController(authService);
