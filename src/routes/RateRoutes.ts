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

/**
 * Rotte per la creazione dei tariffe
 */
router.post(
  '/', 
  validate(createRateSchema, 'body'), 
  RateController.create
);

/**
 * Rotte per il recupero di tutte le tariffe
 */
router.get('/', RateController.getAll);

/**
 * Middleware per validare l'ID della tariffa e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono una tariffa specifica.
 */
const requireRate = [
  validate(rateIdSchema, 'params'),
  ensureExists(RateService, 'Tariffa')
];

/**
 * Rotta per il recupero di una tariffa specifica tramite ID
 */
router.get('/:id', ...requireRate, RateController.getById);

/**
 * Rotta per l'aggiornamento di una tariffa specifica tramite ID
 */
router.put(
  '/:id', 
  ...requireRate,                 
  validate(updateRateSchema, 'body'), 
  RateController.update
);

/** 
 * Rotta per la cancellazione di una tariffa specifica tramite ID
 */
router.delete('/:id', ...requireRate, RateController.delete);

export default router;
