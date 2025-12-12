import { Router } from 'express';
import ParkingController from '../controllers/ParkingController';
import ParkingService from '../services/ParkingService'; 
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { RoleMiddleware } from '../middlewares/RoleMiddleware';
import { UserDAO } from "../dao/UserDAO";
import { consumeTokenCredit } from "../middlewares/TokenMiddleware";
import { createParkingSchema, updateParkingSchema, parkingIdSchema } from '../validation/ParkingValidation';

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
 * Middleware per validare l'ID del parcheggio e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono un parcheggio specifico.
 */
const requireParking = [
  validate(parkingIdSchema, 'params'),
  ensureExists(ParkingService, 'Parcheggio')
];

/**
 * Rotte per la creazione dei parcheggi
 */
router.post('/', ...requireAuth, validate(createParkingSchema, 'body'), ParkingController.create);

/**
 * Rotte per il recupero di tutti i parcheggi
 */
router.get('/', ...requireAuth, ParkingController.getAll);

/**
 * Rotta per il recupero di un parcheggio specifico tramite ID
 */
router.get('/:id', ...requireAuth, ...requireParking, ParkingController.getById);

/**
 * Rotta per l'aggiornamento di un parcheggio specifico tramite ID
 */
router.put('/:id', ...requireAuth, ...requireParking, validate(updateParkingSchema, 'body'), ParkingController.update);

/**
 * Rotta per la cancellazione di un parcheggio specifico tramite ID
 */
router.delete('/:id', ...requireAuth, ...requireParking, ParkingController.delete);

export default router;
