import { Router} from 'express';
import { AuthController } from '../controllers/AuthController';
import { UserDAO } from '../dao/UserDAO';
import { AuthService } from '../services/AuthService';

const router = Router(); // nouva instanza di Express Router

/**
 * Inizializzazione delle dipendenze per il modulo di autenticazione.
 * 
 * - `UserDAO`: gestisce l'accesso ai dati utente nel database, come la ricerca di utenti per email o ID.
 * - `AuthService`: contiene la logica del login (verifica password, genera JWT)
 * - `AuthController`: espone l’endpoint HTTP per il login e collega le richieste al servizio
 * 
 * Questo approccio favorisce l’iniezione delle dipendenze, rendendo il codice più testabile e modulare.
 */
const userDAO = new UserDAO();
const authService = new AuthService(userDAO);
const authController = new AuthController(authService);


/** Definisce la rotta per il login degli utenti
 * @route POST /auth/login
 * Questa rotta accetta le credenziali dell'utente (email e password) e restituisce un token JWT se l'autenticazione ha successo.
 * @returns {Object} Un oggetto contenente il token JWT se l'autenticazione ha successo.
 * @description Questa rotta consente agli utenti di effettuare il login nel sistema 
 * e ottenere un token JWT che può essere utilizzato per autenticare le richieste successive.
 */
router.post('/login', authController.login);

export default router;