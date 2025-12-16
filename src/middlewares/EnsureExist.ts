import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';
import { asyncHandler } from '../utils/AsyncHandler';

/* Interfaccia generica per i Service
evita la duplicazione del tipo in più middleware 
*/
interface ReadService<T> {
  getById(id: string): Promise<T | null>;
}

/**
 * Middleware Factory per verificare l'esistenza di una risorsa.
 * Se esiste, la salva in res.locals.entity
 * Se non esiste, lancia NotFoundError
 * @param service - il service usato per la ricerca
 * @param resourceName - il nome della risorsa (es. "Utente", "Prodotto")
 */
export const ensureExists = (service: ReadService<any>, resourceName: string) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id;
    
    // Eseguiamo la ricerca
    const entity = await service.getById(id);

    if (!entity) {
      throw new NotFoundError(resourceName, id);
    }

    // Salviamo l'entità trovata in res.locals per passarla al controller
    // "entity" è un nome generico, nel controller lo recupereremo da qui
    res.locals.entity = entity;
    
    next();
  });
};
