import { Router } from 'express';

const router = Router();



/**
 * Cerca transiti per una o più targhe in un periodo
 * Query params:
 * - plates: targa singola o array (ABC123 o ABC123,XYZ789)
 * - startDate: data inizio (YYYY-MM-DD)
 * - endDate: data fine (YYYY-MM-DD)
 * - format: json|pdf (default: json)
 * 
 * Operatore: vede tutti i transiti
 * Automobilista: solo veicoli associati
 */
//router.get('/transits/search', );


// ============================================
// [U] ROTTA 2: STATO PAGAMENTO FATTURE
// ============================================

/**
 * Ottieni le fatture dell'utente autenticato con filtri
 * Query params:
 * - status: paid|unpaid|overdue (opzionale)
 * - startDate: filtra per data ingresso >= startDate (opzionale)
 * - endDate: filtra per data uscita <= endDate (opzionale)
 * - vehicleId: filtra per veicolo specifico (opzionale)
 * 
 * Automobilista: vede solo le sue fatture
 * Operatore: vede tutte le fatture (aggiungere /invoices/all)
 */
//router.get('/invoices/my-invoices',);

/**
 * Fatture per un veicolo specifico
 * Params: vehicleId
 * Query: status, startDate, endDate
 */
//router.get('/:vehicleId/invoices', );



export default router;
