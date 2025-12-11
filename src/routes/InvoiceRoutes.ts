import {Router} from 'express';
import InvoiceController from '../controllers/InvoiceController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';
import { AuthService } from '../services/AuthService';
import { UserDAO } from '../dao/UserDAO';

const userDAO = new UserDAO();
const authService = new AuthService(userDAO); 
const authMiddleware = new AuthMiddleware(authService);

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
//router.use();


/**
 * Rotta per trovare tutte le fatture
 * GET /invoices - Recupera tutte le fatture (protetta)
 * 
 * Se l'utente è un DRIVER, recupera solo le fatture associate al suo userId.
 * Se l'utente è un OPERATOR, recupera tutte le fatture.
 */
router.get('/',authMiddleware.authenticateToken, InvoiceController.getAll);


/**
 * Rotte per trovare una fattura per ID
 * GET /invoices/:id - Recupera una fattura per ID (protetta)
 * 
 * Se l'utente è un DRIVER, recupera solo le fatture associate al suo userId.
 * Se l'utente è un OPERATOR, può recuperare tutte le fatture.
 */
router.get('/:id', InvoiceController.getById);


/**
 * Rotta per scaricare il bollettino PDF con QR Code
 * GET /invoices/:id/pdf - Scarica il bollettino PDF con QR Code per una fattura specifica
 * 
 * Se l'utente è un DRIVER, può scaricare solo i bollettini delle fatture associate al suo userId.
 * Se l'utente è un OPERATOR, può scaricare i bollettini di tutte le fatture.
 */

router.get('/:id/pdf', InvoiceController.downloadPayment);



/** 
 * Rotta per pagare la fattura specifica
 * GET /invoices/:id/pay 
 * Si limita a modificare lo stato della fattura a "paid"
*/
router.get('/:id/pay',authMiddleware.authenticateToken, InvoiceController.pay);

export default router;