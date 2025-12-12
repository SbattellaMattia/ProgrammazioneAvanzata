import { Router } from "express";
import TransitController from "../controllers/TransitController";
import multer from "multer";
import { transitIdSchema, updateTransitSchema, transitHistorySchema } from "../validation/TransitValidation";
import { validate } from "../middlewares/Validate";
import { ensureExists } from "../middlewares/EnsureExist";
import TransitService  from "../services/TransitService";
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { UserDAO } from "../dao/UserDAO";
import { consumeTokenCredit } from "../middlewares/TokenMiddleware";
import GateService from "../services/GateService";
import { gateIdSchema } from "../validation/GateValidation";
import { RoleMiddleware } from '../middlewares/RoleMiddleware';

const router = Router();
const userDAO = new UserDAO();
const authService = new AuthService(userDAO); 
const authMiddleware = new AuthMiddleware(authService);
const roleMiddleware = new RoleMiddleware(authService);
const upload = multer({storage: multer.memoryStorage()}); 

/**
 * Middleware per richiedere l'autenticazione e il ruolo di operatore
 * prima di accedere alle rotte protette.
 */
const requireAuth = [
  authMiddleware.authenticateToken,
  consumeTokenCredit,
  roleMiddleware.isOperator,
];

/**
 * Middleware per validare l'ID del transito e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono una tariffa specifica.
 */
const requireTransit = [
  validate(transitIdSchema, "params"),
  ensureExists(TransitService, "Transit"),
];

/**
 * Middleware per validare l'ID del varco e assicurarsi che esista
 * prima di procedere con le operazioni che richiedono un varco specifico.
 */
const requireGate = [
  validate(gateIdSchema, "params"),
  ensureExists(GateService, "Gate"),
];

/**
 * Rotte per la creazione dei transiti random per varco
 */
router.post("/gate/:id/new", ...requireAuth, ...requireGate, upload.single("file"), TransitController.createFromGate );


/**
 * Rotta per il recupero della cronologia transiti dell'utente autenticato
 */
router.get("/history", authMiddleware.authenticateToken, consumeTokenCredit, validate(transitHistorySchema, 'query'),TransitController.getHistory);

/**
 *  Rotte per il recupero di tutti i transti
 */
router.get("/", ...requireAuth, TransitController.getAll);

/**
 * Rotta per il recupero di un transito specifico tramite ID
 */
router.get("/:id", ...requireAuth, ...requireTransit, TransitController.getById);

/**
 * Rotta per l'aggiornamento transito per ID
 */
router.put("/:id", ...requireAuth, ...requireTransit, validate(updateTransitSchema, "body"), TransitController.update);

/**
 * Rotta per la cancellazione di un transito specifico tramite ID
 */
router.delete("/:id", ...requireAuth, ...requireTransit, TransitController.delete);





export default router;