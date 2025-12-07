/**
 * Classe per la gestione degli errori applicativi.
 * Estende la classe base Error per includere informazioni aggiuntive come il codice di stato HTTP.
 * Utilizzata per rappresentare errori specifici dell'applicazione in modo strutturato.
 */
import { StatusCodes } from 'http-status-codes';

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR, isOperational: boolean = true) {
    super(message);
    
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    /**
     * Setta il prototipo corretto per estendere Error in TypeScript
     * @see https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
     * 
     * @example
     * const error = new AppError('test');
     * console.log(error instanceof AppError);  FALSE (dovrebbe essere true!)
     * console.log(error.name);                "Error" (dovrebbe essere "AppError")
     */
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace(this, this.constructor);
    
    this.name = this.constructor.name;
  }
}
