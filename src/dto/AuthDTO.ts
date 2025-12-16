import { Role } from "../enum/Role";

/**
 * DTO per la richiesta di login
 * @interface LoginRequestDTO
 */
export interface LoginResponseDTO {
  token: string;
  user: {
    id: string;
    email: string;
    role: Role;
    name: string | null;
    surname: string | null;
    tokens: number;
  };
}

/**
 * DTO per il payload del JWT
 * @interface JwtPayloadDTO
 */
export interface JwtPayloadDTO {
  id: string;
  email: string;
  role: Role;
  iat?: number;
  exp?: number;
  iss?: string;
  sub?: string;
}