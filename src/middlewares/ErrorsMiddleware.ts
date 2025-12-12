import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors';
import { StatusCodes } from 'http-status-codes';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err instanceof AppError) {
        const statusCode = err.statusCode; 
        
        res.status(statusCode).json({
            success: false,
            statusCode: statusCode,
            message: err.message,
            //stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
        return;
    }

    // Se è un errore generico non gestito (es. crash del codice)
    console.error('Errore non gestito:', err);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        statusCode: 500,
        message: 'Errore interno del server'
    });
};