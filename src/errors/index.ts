/**
 * @module Errors
 * This module exports custom error classes for handling various error scenarios in the application.
 * Each error class extends the base AppError class to provide specific error handling capabilities.
 * @see {@link AppError}
 */
export { AppError } from './AppError';
export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ValidationError,
  InternalServerError,
  ServiceUnavailableError,
  InsufficientTokensError,
  InvalidTokenError,
  InvalidCredentialsError,
  ResourceInUseError,
  OperationNotAllowedError,
  DatabaseError,
  ParkingFullError,
  DuplicateTransitError,
  UnpaidInvoiceError,
} from './CustomErrors';
