import { Router } from 'express';
import GateController from '../controllers/GateController';
import GateService from '../services/GateService';
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { createGateSchema, updateGateSchema, gateIdSchema } from '../validation/GateValidation';

const router = Router();

// --- Rotte senza ID ---
router.post(
  '/', 
  validate(createGateSchema, 'body'), 
  GateController.create
);

router.get('/', GateController.getAll);
// --- Rotte con ID ---

// Definisco una catena standard per le operazioni su ID:
// 1. Valido che l'ID sia un numero
// 2. Controllo che l'entità esista (e la carico)
const requireGate = [
  validate(gateIdSchema, 'params'),
  ensureExists(GateService, 'Gate')
];

router.get('/:id', ...requireGate, GateController.getById);

router.put(
  '/:id', 
  ...requireGate,                 // Prima controlla esistenza
  validate(updateGateSchema, 'body'), // Poi valida il body
  GateController.update
);

router.delete('/:id', ...requireGate, GateController.delete);

export default router;
