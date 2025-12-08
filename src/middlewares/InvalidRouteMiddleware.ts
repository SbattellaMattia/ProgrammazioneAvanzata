import { Request, Response, NextFunction } from 'express';
import { NotFoundError } from '../errors';

export const notFoundHandler = (req: Request, res: Response, next: NextFunction) => {
    const error = new NotFoundError('Rotta', req.originalUrl);
    next(error);
};
