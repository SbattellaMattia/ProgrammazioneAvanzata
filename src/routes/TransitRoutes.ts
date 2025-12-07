import { Router} from 'express';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
router.use();

//Altri middleware specifici per le rotte di parcheggio

router.post('/transit', middleware, TransitController.create);

router.get('/transit/:id', middleware, TransitController.getById);
router.get('/transits', TransitController.getAll);

router.delete('/transit/:id',middleware, TransitController.delete);

router.put('/transit/:id',middleware ,TransitController.update);

export default router;