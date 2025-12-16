import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserDAO } from '../dao/UserDAO';
import { privateKey, publicKey} from '../secrets/keys';
import { InvalidCredentialsError } from '../errors';
import { Role } from '../enum/Role';
import { JwtPayloadDTO, LoginResponseDTO } from '../dto/AuthDTO';


/**
 * Service per la gestione dell'autenticazione
 * 
 * Responsabilità:
 * - Login utenti
 * - Generazione token JWT
 * - Verifica token JWT
 * 
 * @class AuthService
 */
export class AuthService {
  private readonly SALT_ROUNDS = 10;
  private readonly TOKEN_EXPIRATION = '24h';

  constructor(private userDAO: UserDAO) {}

  /**
   * Effettua il login di un utente
   * 
   * @param email - Email dell'utente
   * @param password - Password dell'utente
   * @returns Token JWT e dati utente
   * @throws {InvalidCredentialsError} - Se le credenziali sono errate
   * 
   * @example
   * const result = await authService.login('mario@email.com', 'password123');
   * console.log(result.token); // eyJhbGci...
   */
  login = async (email: string, password: string): Promise<LoginResponseDTO> => {
    // Trova l'utente per email
    const user = await this.userDAO.findByEmail(email);
    if (!user) {
      throw new InvalidCredentialsError();
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    const token = this.generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        surname: user.surname,
        tokens: user.tokens,
      },
    };
  };

  /**
   * Genera un token JWT per un utente
   * 
   * @param payload - Dati da includere nel token (id, email, role)
   * @returns Token JWT firmato con chiave privata RS256
   * 
   * @example
   * const token = authService.generateToken({
   *   id: 1,
   *   email: 'mario@email.com',
   *   role: 'automobilista'
   * });
   */
  generateToken = (payload: { id: string; email: string; role: Role }): string => {
    // Genera e firma il token
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
      },
      privateKey,
      {
        algorithm: 'RS256',
        expiresIn: this.TOKEN_EXPIRATION,
        issuer: 'parking-system',
        subject: payload.id.toString(),
      }
    );
  };
 
  /**
   * Verifica e decodifica un token JWT
   * 
   * @param token - Token JWT da verificare
   * @returns Payload decodificato del token
   * @throws {Error} - Se il token non è valido o è scaduto
   * 
   * @example
   * try {
   *   const payload = authService.verifyToken('eyJhbGci...');
   *   console.log(payload.id); // 1
   *   console.log(payload.email); // mario@email.com
   * } catch (error) {
   *   console.error('Token non valido');
   * }
   */
  verifyToken = (token: string): JwtPayloadDTO => {
    try {
      const decoded = jwt.verify(token, publicKey, { 
        algorithms: ['RS256'],
        issuer: 'parking-system',
      }) as JwtPayloadDTO;
      return decoded;
    } catch (error) {
      
      if (error instanceof jwt.TokenExpiredError) {
         throw new InvalidCredentialsError('Token scaduto');
      }
      if (error instanceof jwt.JsonWebTokenError) {
         throw new InvalidCredentialsError('Token non valido');
      }
       throw new InvalidCredentialsError('Errore nella verifica del token');
    }
  };
}

export default AuthService;
