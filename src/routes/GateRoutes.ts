import { Router } from 'express';
import GateController from '../controllers/GateController';
import GateService from '../services/GateService';
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { createGateSchema, updateGateSchema, gateIdSchema } from '../validation/GateValidation';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { UserDAO } from "../dao/UserDAO";
import { RoleMiddleware } from '../middlewares/RoleMiddleware';
import { consumeTokenCredit } from "../middlewares/TokenMiddleware";

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
 * Middleware per validare l'ID del gate e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono un gate specifico.
 */
const requireGate = [
  validate(gateIdSchema, 'params'),
  ensureExists(GateService, 'Gate')
];

/**
 * Rotte per la creazione dei gate
 */
router.post('/', ...requireAuth, validate(createGateSchema, 'body'), GateController.create);

/**
 * Rotte per il recupero di tutti gate
 */
router.get('/', ...requireAuth, GateController.getAll);

/**
 * Rotta per il recupero dei transiti di un gate specifico tramite ID
 */
router.get("/:id/transits", ...requireAuth, ...requireGate, GateController.getTransitByGate)

/**
 * Rotta per il recupero di un gate specifico tramite ID
 */
router.get('/:id', ...requireAuth, ...requireGate, GateController.getById);

/**
 * Rotta per l'aggiornamento di un gate specifico tramite ID
 */
router.put('/:id', ...requireAuth, ...requireGate, validate(updateGateSchema, 'body'), GateController.update);

/**
 * Rotta per la cancellazione di un gate specifico tramite ID
 */
router.delete('/:id', ...requireAuth, ...requireGate, GateController.delete);

export default router;
