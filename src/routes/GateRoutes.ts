import { Router } from 'express';
import GateController from '../controllers/GateController';
import GateService from '../services/GateService';
import { validate } from '../middlewares/Validate';
import { ensureExists } from '../middlewares/EnsureExist';
import { createGateSchema, updateGateSchema, gateIdSchema } from '../validation/GateValidation';

const router = Router();

/**
 * Rotte per la creazione dei gate
 */
router.post(
  '/', 
  validate(createGateSchema, 'body'), 
  GateController.create
);

/**
 * Rotte per il recupero di tutti gate
 */
router.get('/', GateController.getAll);


/**
 * Middleware per validare l'ID del gate e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono un gate specifico.
 */
const requireGate = [
  validate(gateIdSchema, 'params'),
  ensureExists(GateService, 'Gate')
];

/**
 * Rotta per il recupero di un gate specifico tramite ID
 */
router.get('/:id', ...requireGate, GateController.getById);

/**
 * Rotta per l'aggiornamento di un gate specifico tramite ID
 */
router.put(
  '/:id', 
  ...requireGate,                 // Prima controlla esistenza
  validate(updateGateSchema, 'body'), // Poi valida il body
  GateController.update
);

/**
 * Rotta per la cancellazione di un gate specifico tramite ID
 */
router.delete('/:id', ...requireGate, GateController.delete);

export default router;
