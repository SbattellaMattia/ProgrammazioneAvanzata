import { Router } from 'express';
import StatsController from '../controllers/StatsController';
import { validate } from '../middlewares/Validate';
import { statsQuerySchema } from '../validation/StatsValidation';
import { parkingIdSchema } from '../validation/ParkingValidation';
import { ensureExists } from '../middlewares/EnsureExist';
import ParkingService from '../services/ParkingService';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { RoleMiddleware } from '../middlewares/RoleMiddleware';
import { UserDAO } from "../dao/UserDAO";
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

const requireParking = [
  validate(parkingIdSchema, "params"),
  ensureExists(ParkingService, "Parcheggio"),
];

/**
 * Rotta per il recupero delle statistiche globali
 */
router.get('/',...requireAuth, validate(statsQuerySchema, 'query'), StatsController.getGlobalStats);

/**
 * Rotta per il recupero delle statistiche di un parcheggio specifico tramite ID
 */
router.get("/:id", ...requireAuth, ...requireParking, validate(statsQuerySchema, "query"), StatsController.getParkingStats);

export default router;