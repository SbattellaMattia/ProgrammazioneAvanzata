import { StatusCodes } from "http-status-codes";

/**
 * Classe per errori personalizzati con supporto a status HTTP.
 * Utilizzata per gestire errori specifici dell'applicazione.
 * @class CustomError
 * @extends {Error}
 * @property {number} statusCode - Codice di stato HTTP associato all'errore.
 * @constructor
 * @param message - Messaggio di errore.
 * @param statusCode - Codice di stato HTTP associato all'errore.
 */
class CustomError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}
 /**
  * Factory per la creazione di errori personalizzati.
  * Fornisce metodi statici per generare errori comuni con messaggi e codici di stato predefiniti.
  * @class ErrorFactory
  * @static
  */
class ErrorFactory {
  /**
   * 
   * @param message 
   * @param statusCode 
   * @returns 
   */
  static createError(message: string, statusCode: number): CustomError {
    return new CustomError(message, statusCode);
  }

  /**
   * Crea un errore di tipo "Internal Server Error" con un messaggio predefinito.
   * @param message 
   * @returns 
   */
  static badRequest(message = "Bad Request"): CustomError {
    return this.createError(message, StatusCodes.BAD_REQUEST);
  }

  /**
   * Crea un errore di tipo "Unauthorized" con un messaggio predefinito.
   * @param message 
   * @returns 
   */
  static unauthorized(message = "Unauthorized"): CustomError {
    return this.createError(message, StatusCodes.UNAUTHORIZED);
  }

  /**
   * Crea un errore di tipo "Forbidden" con un messaggio predefinito.
   * @param message 
   * @returns 
   */
  static forbidden(message = "Forbidden"): CustomError {
    return this.createError(message, StatusCodes.FORBIDDEN);
  }

  /**
   * Crea un errore di tipo "Not Found" con un messaggio predefinito.
   * @param message 
   * @returns 
   */
  static entityNotFound(entity: string): CustomError {
  return this.createError(`${entity} not found`, StatusCodes.NOT_FOUND);
  }

  /**
   * Crea un errore di tipo "Conflict" con un messaggio predefinito.
   * @param message 
   * @param statusCode 
   * @returns 
   */
  static customMessage(message: string, statusCode: number): CustomError {
    return this.createError(message, statusCode);
  }

}

export { CustomError, ErrorFactory };