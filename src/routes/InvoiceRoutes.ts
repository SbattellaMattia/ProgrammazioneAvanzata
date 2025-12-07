import {Router} from 'express';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
router.use();

//Altri middleware specifici per le rotte di fatturazione

router.get('/invoice/:id', middleware, InvoiceController.getById);
router.get('/invoices', InvoiceController.getAll);



export default router;