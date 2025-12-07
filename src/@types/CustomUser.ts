/**
 * Payload utente contenuto nel token JWT.
 */
export interface UserPayload {
  id: string;
  role: string;
}