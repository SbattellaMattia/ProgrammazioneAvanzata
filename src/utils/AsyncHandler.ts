/**
 * Middleware per gestire gli errori nei controller asincroni.
 * Higher-Order Function, cioè una funzione che accetta una funzione e ne restituisce un'altra modificata.
*
* @param fn La funzione asincrona (controller) da avvolgere.
* @returns Una nuova funzione che gestisce automaticamente gli errori.
* 
* Come funziona:
* Promise.resolve(fn(req, res, next)).catch(next);
* fn(req, res, next): Esegue la tua logica (es. il tuo controller getUserById).
* Promise.resolve(...): Avvolge il risultato della tua funzione. Anche se la  funzione è già async (e quindi ritorna una Promise), 
* questo assicura che il risultato sia trattato come una Promise standard.
* .catch(next): Questa è la parte fondamentale.
* Se la tua funzione va a buon fine, non succede nulla e il tuo codice invia la risposta (res.json...).
* Se la tua funzione lancia un errore (o la Promise viene rigettata), il .catch intercetta quell'errore.
* Invece di mandare in crash tutto, passa l'errore alla funzione next di Express (next(error)).
*/
import { Request, Response, NextFunction } from 'express';

/**
 * Wrapper per gestire automaticamente gli errori nei controller async
 * Evita di dover scrivere try/catch in ogni controller
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};


/* Usage Example:

import { asyncHandler } from '../middleware/AsyncHandler'; 

getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const user = await userDAO.findById(id);

    if (!user) { throw new NotFoundError('Utente', id); }

    return res.status(200).json(user);
});
*/      