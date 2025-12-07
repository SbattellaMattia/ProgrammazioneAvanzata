import { Router} from 'express';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
router.use();

//Altri middleware specifici per le rotte di parcheggio

router.post('/rate', middleware, RateController.create);

router.get('/rate/:id', middleware, RateController.getById);
router.get('/rates', RateController.getAll);

router.delete('/rate/:id',middleware, RateController.delete);

router.put('/rate/:id',middleware ,RateController.update);

export default router;