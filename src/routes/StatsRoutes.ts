import { Router} from 'express';

const router = Router();

/** Middleware per autenticazione e autorizzazione degli operatori
 * @middleware authenticateToken
 * */

//Middleware di autenticazione (solo operatori)
//router.use();

//Altri middleware specifici per le rotte di parcheggio


//router.get('/stats/fatturato', AuthMiddleware, StatsController.getAll);
//router.get('/stats/fatturato/:id', middleware, StatsController.getById);

//router.get('/stats/capacity/:fasciaOraria', middleware, StatsController.getById);
//router.get('/stats/capacity/:id:fasciaOraria', middleware, StatsController.getById);

//router.get('/stats/:id/transits/:fasciaOraria', middleware, StatsController.getById);


// Tutte le rotte devono avere la possibilità di filtrare per fascia oraria, JSON o PDF.


//router.get('/stats', AuthMiddleware, StatsController.getAll);

export default router;