// src/services/BaseAuthService.ts
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { InvalidTokenError } from '../../errors';

/**
 * Service base per autenticazione JWT
 */
export abstract class BaseAuthService {
  protected readonly SALT_ROUNDS = 10;
  protected readonly TOKEN_EXPIRATION = '24h';
  protected readonly REFRESH_TOKEN_EXPIRATION = '7d';

  constructor(
    protected readonly privateKey: string,
    protected readonly publicKey: string,
    protected readonly issuer: string = 'app'
  ) {}

  /**
   * Hash una password
   */
  protected async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  /**
   * Verifica una password contro un hash
   */
  protected async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }


  /**
   * Verifica e decodifica un token JWT
   */
  protected verifyToken(token: string): any {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: this.issuer,
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new InvalidTokenError('Token scaduto');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new InvalidTokenError('Token non valido');
      }
      throw new InvalidTokenError('Errore nella verifica del token');
    }
  }
}
