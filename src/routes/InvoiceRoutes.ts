import {Router} from 'express';
import InvoiceController from '../controllers/InvoiceController';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
//router.use();

//Altri middleware specifici per le rotte di fatturazione

//router.get('/invoice/:id', );
router.get('/', InvoiceController.getAll);

router.get('/:id/pdf', InvoiceController.downloadPayment);



export default router;