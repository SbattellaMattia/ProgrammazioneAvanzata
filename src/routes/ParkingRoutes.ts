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

// --- Rotte senza ID ---
router.post(
  '/', 
  validate(createParkingSchema, 'body'), 
  ParkingController.create
);

router.get('/', ParkingController.getAll);

// --- Rotte con ID ---

// Definisco una catena standard per le operazioni su ID:
// 1. Valido che l'ID sia un numero
// 2. Controllo che l'entità esista (e la carico)
const requireParking = [
  validate(parkingIdSchema, 'params'),
  ensureExists(ParkingService, 'Parcheggio')
];

router.get('/:id', ...requireParking, ParkingController.getById);

router.put(
  '/:id', 
  ...requireParking,                 // Prima controlla esistenza
  validate(updateParkingSchema, 'body'), // Poi valida il body
  ParkingController.update
);

router.delete('/:id', ...requireParking, ParkingController.delete);

export default router;
