import { Router } from "express";
import TransitController from "../controllers/TransitController";
import multer from "multer";
import { transitIdSchema, updateTransitSchema } from "../validation/TransitValidation";
import { validate } from "../middlewares/Validate";
import { ensureExists } from "../middlewares/EnsureExist";
import TransitService  from "../services/TransitService";
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { UserDAO } from "../dao/UserDAO";
import { consumeTokenCredit } from "../middlewares/TokenMiddleware";
import GateService from "../services/GateService";



const userDAO = new UserDAO();
const authService = new AuthService(userDAO); 
const authMiddleware = new AuthMiddleware(authService);

const router = Router();
const upload = multer({storage: multer.memoryStorage()}); 

// Middleware riutilizzabile per qualsiasi route che usa un transitId
const requireTransit = [
  validate(transitIdSchema, "params"),
  ensureExists(TransitService, "Transit"),
];

/**
 * Rotte per la creazione dei transiti random per varco
 */
router.post(
  "/gate/:id/new",
  authMiddleware.authenticateToken,
  validate(gateIdSchema, "params"),
  upload.single("file"),            
  TransitController.createFromGate
);

/**
 *  Rotte per il recupero di tutti i parcheggi
 */
router.get("/", TransitController.getAll);

router.get(
  "/history",
  authMiddleware.authenticateToken,  
  consumeTokenCredit,        // controlla + scala token alla fine
  TransitController.getHistory       // logica della rotta
);
/**
 * Rotta per il recupero di un transito specifico tramite ID
 */
router.get("/:id", ...requireTransit, TransitController.getById);

/**
 * Rotta per l'aggiornamento transito per ID
 */
router.put(
  "/:id",
  ...requireTransit,
  validate(updateTransitSchema, "body"),
  TransitController.update
);




/**
 * Rotta per la cancellazione di un transito specifico tramite ID
 */
router.delete("/:id", ...requireTransit, TransitController.delete);




export default router;