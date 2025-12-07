/**
 * Middleware per gestire gli errori nei controller asincroni
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