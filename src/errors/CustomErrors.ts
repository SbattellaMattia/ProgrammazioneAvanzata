import { StatusCodes } from 'http-status-codes';
import { AppError } from './AppError';

/**
 * 400 - Bad Request
 * Richiesta non valida
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Richiesta non valida') {
    super(message, StatusCodes.BAD_REQUEST);
  }
}

/**
 * 401 - Unauthorized
 * Utente non autenticato
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Autenticazione richiesta') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * 403 - Forbidden
 * Utente autenticato ma senza permessi
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Accesso negato') {
    super(message, StatusCodes.FORBIDDEN);
  }
}

/**
 * 404 - Not Found
 * Risorsa non trovata
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Risorsa', identifier?: string | number) {
    const message = identifier 
      ? `${resource} con identificativo '${identifier}' non trovato`
      : `${resource} non trovato`;
    super(message, StatusCodes.NOT_FOUND);
  }
}

/**
 * 409 - Conflict
 * Conflitto con lo stato corrente (es. email già esistente)
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Risorsa già esistente') {
    super(message, StatusCodes.CONFLICT);
  }
}

/**
 * 422 - Unprocessable Entity
 * Validazione fallita
 */
export class ValidationError extends AppError {
  public readonly errors: any;

  constructor(message: string = 'Validazione fallita', errors?: any) {
    super(message, StatusCodes.UNPROCESSABLE_ENTITY);
    this.errors = errors;
  }
}

/**
 * 500 - Internal Server Error
 * Errore generico del server
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Errore interno del server') {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false);
  }
}

/**
 * 503 - Service Unavailable
 * Servizio temporaneamente non disponibile
 */
export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Servizio temporaneamente non disponibile') {
    super(message, StatusCodes.SERVICE_UNAVAILABLE);
  }
}



/**
 * Errore per token insufficienti
 */
export class InsufficientTokensError extends AppError {
  constructor(available: number = 0, required: number = 1) {
    super(
      `Token insufficienti. Disponibili: ${available}, richiesti: ${required}`,
      StatusCodes.PAYMENT_REQUIRED
    );
  }
}

/**
 * Errore per JWT non valido o scaduto
 */
export class InvalidTokenError extends AppError {
  constructor(message: string = 'Token non valido o scaduto') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * Errore per credenziali non valide
 */
export class InvalidCredentialsError extends AppError {
  constructor(message: string = 'Email o password non validi') {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}

/**
 * Errore per risorsa già in uso
 */
export class ResourceInUseError extends AppError {
  constructor(resource: string) {
    super(`${resource} è già in uso`, StatusCodes.CONFLICT);
  }
}

/**
 * Errore per operazione non permessa
 */
export class OperationNotAllowedError extends AppError {
  constructor(operation: string, reason?: string) {
    const message = reason 
      ? `Operazione '${operation}' non permessa: ${reason}`
      : `Operazione '${operation}' non permessa`;
    super(message, StatusCodes.FORBIDDEN);
  }
}

/**
 * Errore per database
 */
export class DatabaseError extends AppError {
  constructor(message: string = 'Errore nel database', originalError?: Error) {
    super(message, StatusCodes.INTERNAL_SERVER_ERROR, false);
    if (originalError) {
      this.stack = originalError.stack;
    }
  }
}

/**
 * Errore per parcheggio pieno
 */
export class ParkingFullError extends AppError {
  constructor(parkingName: string) {
    super(
      `Il parcheggio '${parkingName}' è pieno. Nessun posto disponibile`,
      StatusCodes.CONFLICT
    );
  }
}

/**
 * Errore per transito duplicato
 */
export class DuplicateTransitError extends AppError {
  constructor(plate: string) {
    super(
      `Veicolo con targa '${plate}' ha già un transito di ingresso attivo`,
      StatusCodes.CONFLICT
    );
  }
}

/**
 * Errore per fattura scaduta
 */
export class UnpaidInvoiceError extends AppError {
  constructor(invoiceId: number) {
    super(
      `Fattura #${invoiceId} non pagata. Pagamento scaduto`,
      StatusCodes.PAYMENT_REQUIRED
    );
  }
}

/**
 * Errore per fattura già pagata
 */
export class AlreadyPaidInvoiceError extends AppError {
  constructor(invoiceId: number) {
    super(
      `Fattura #${invoiceId} già pagata.`,
      StatusCodes.PAYMENT_REQUIRED
    );
  }
}
