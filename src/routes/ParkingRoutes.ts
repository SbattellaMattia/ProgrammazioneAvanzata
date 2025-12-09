import { Router } from 'express';
import ParkingController from '../controllers/ParkingController';
import ParkingService from '../services/ParkingService'; // Necessario per il middleware
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { 
  createParkingSchema, 
  updateParkingSchema, 
  parkingIdSchema 
} from '../validation/ParkingValidator';

const router = Router();

/**
 * Rotte per la creazione dei parcheggi
 */
router.post(
  '/', 
  validate(createParkingSchema, 'body'), 
  ParkingController.create
);

/**
 * Rotte per il recupero di tutti i parcheggi
 */
router.get('/', ParkingController.getAll);

/**
 * Middleware per validare l'ID del parcheggio e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono un parcheggio specifico.
 */
const requireParking = [
  validate(parkingIdSchema, 'params'),
  ensureExists(ParkingService, 'Parcheggio')
];

/**
 * Rotta per il recupero di un parcheggio specifico tramite ID
 */
router.get('/:id', ...requireParking, ParkingController.getById);

/**
 * Rotta per l'aggiornamento di un parcheggio specifico tramite ID
 */
router.put(
  '/:id', 
  ...requireParking,                 
  validate(updateParkingSchema, 'body'), 
  ParkingController.update
);

/**
 * Rotta per la cancellazione di un parcheggio specifico tramite ID
 */
router.delete('/:id', ...requireParking, ParkingController.delete);

export default router;
