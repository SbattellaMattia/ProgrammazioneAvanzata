import { Role } from "../enum/Role";


/**
 * DTO per il login
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
 * DTO per il payload del token JWT
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