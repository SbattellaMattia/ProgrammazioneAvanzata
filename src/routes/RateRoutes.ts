import { Router } from 'express';
import RateController from '../controllers/RateController';
import RateService from '../services/RateService'; 
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { RoleMiddleware } from '../middlewares/RoleMiddleware';
import { UserDAO } from "../dao/UserDAO";
import { consumeTokenCredit } from "../middlewares/TokenMiddleware";
import { createRateSchema, updateRateSchema, rateIdSchema } from '../validation/RateValidation';

const router = Router();
const userDAO = new UserDAO();
const authService = new AuthService(userDAO); 
const authMiddleware = new AuthMiddleware(authService);
const roleMiddleware = new RoleMiddleware(authService);

/**
 * Middleware per richiedere l'autenticazione e il ruolo di operatore
 * prima di accedere alle rotte protette.
 */
const requireAuth = [
  authMiddleware.authenticateToken,
  consumeTokenCredit,
  roleMiddleware.isOperator
];

/**
 * Middleware per validare l'ID della tariffa e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono una tariffa specifica.
 */
const requireRate = [
  validate(rateIdSchema, 'params'),
  ensureExists(RateService, 'Tariffa')
];

/**
 * Rotte per la creazione dei tariffe
 */
router.post('/', ...requireAuth, validate(createRateSchema, 'body'), RateController.create);

/**
 * Rotte per il recupero di tutte le tariffe
 */
router.get('/', ...requireAuth, RateController.getAll);

/**
 * Rotta per il recupero di una tariffa specifica tramite ID
 */
router.get('/:id', ...requireAuth, ...requireRate, RateController.getById);

/**
 * Rotta per l'aggiornamento di una tariffa specifica tramite ID
 */
router.put('/:id', ...requireAuth, ...requireRate, validate(updateRateSchema, 'body'), RateController.update);

/** 
 * Rotta per la cancellazione di una tariffa specifica tramite ID
 */
router.delete('/:id', ...requireAuth, ...requireRate, RateController.delete);

export default router;
