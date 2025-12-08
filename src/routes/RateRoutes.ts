import { Router } from 'express';
import RateController from '../controllers/RateController';
import RateService from '../services/RateService'; 
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { 
  createRateSchema, 
  updateRateSchema, 
  rateIdSchema 
} from '../validation/RateValidation';

const router = Router();

// --- Rotte senza ID ---
router.post(
  '/', 
  validate(createRateSchema, 'body'), 
  RateController.create
);

router.get('/', RateController.getAll);
// --- Rotte con ID ---

// Definisco una catena standard per le operazioni su ID:
// 1. Valido che l'ID sia un numero
// 2. Controllo che l'entità esista (e la carico)
const requireRate = [
  validate(rateIdSchema, 'params'),
  ensureExists(RateService, 'Tariffa')
];

router.get('/:id', ...requireRate, RateController.getById);
router.put(
  '/:id', 
  ...requireRate,                 // Prima controlla esistenza
  validate(updateRateSchema, 'body'), // Poi valida il body
  RateController.update
);

router.delete('/:id', ...requireRate, RateController.delete);

export default router;
