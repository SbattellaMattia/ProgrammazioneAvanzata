import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import AuthRoutes from "./routes/AuthRoutes";
import ParkingRoutes from "./routes/ParkingRoutes";
import GateRoutes from "./routes/GateRoutes";
import RateRoutes from "./routes/RateRoutes";
import TransitRoutes from "./routes/TransitRoutes";
import InvoiceRoutes from "./routes/InvoiceRoutes";
import StatsRoutes from "./routes/StatsRoutes";
import { errorHandler } from './middlewares/ErrorsMiddleware';
import { NotFoundError } from './errors';
import { notFoundHandler } from './middlewares/InvalidRouteMiddleware';

/** 
  * Carica le variabili d'ambiente dal file .env.
  * Questo permette di utilizzare variabili senza ancorarle nel codice.
  */
dotenv.config();

/**
 * Crea un'istanza dell'applicazione Express.
 *
 * @constant {express.Application} app
 */
const app = express();

/**
 * Questo middleware è necessario per poter leggere i dati inviati
 * in formato JSON nelle richieste POST o PUT.
 * Utilizza `express.json()` (middleware integrato in Express) per il parsing automatico dei payload JSON nelle richieste
 * e lo trasforma in un oggetto Javascript utilizzabile.
 */
app.use(express.json());

app.use('', AuthRoutes);

app.use('/parking', ParkingRoutes);

app.use('/gate', GateRoutes);

app.use('/rate', RateRoutes);

app.use('/transit', TransitRoutes);

app.use('/invoice', InvoiceRoutes);

app.use('/stats', StatsRoutes);

app.get('/xmas', (req, res, next) => {
    const filePath = path.join(process.cwd(), 'src', 'img', 'xmas.gif');
    res.sendFile(filePath, (err) => {
        if (err) {next(new NotFoundError('Immagine non trovata'));}
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

/**
 * Esporta l'istanza dell'applicazione per utilizzarla in altri moduli.
 * @exports app
 */
export default app;