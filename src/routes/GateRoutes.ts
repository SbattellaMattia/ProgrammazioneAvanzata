import { Router} from 'express';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */
router.use();

//Altri middleware specifici per le rotte di parcheggio

router.post('/gate', middleware, GateController.create);

router.get('/gate/:id', middleware, GateController.getById);
router.get('/gates', GateController.getAll);

router.delete('/gate/:id',middleware, GateController.delete);

router.put('/gate/:id',middleware ,GateController.update);
export default router;