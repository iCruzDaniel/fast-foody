import { DomainError } from '@shared/kernel';
import { SessionServicePort, SessionPayload } from '@domain/auth/services';
import jwt, { JwtPayload } from 'jsonwebtoken';

export interface JwtSessionServiceConfig {
  secret: string;
  ttlSeconds: number;
}

export class JwtSessionService implements SessionServicePort {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(config: JwtSessionServiceConfig) {
    this.secret = config.secret;
    this.ttlSeconds = config.ttlSeconds;
  }

  signToken(payload: SessionPayload): string {
    return jwt.sign(payload, this.secret, {
      algorithm: 'HS256',
      expiresIn: this.ttlSeconds,
    });
  }

  verifyToken(token: string): SessionPayload {
    try {
      const decoded = jwt.verify(token, this.secret, {
        algorithms: ['HS256'],
      }) as JwtPayload;
      const { sub, role } = decoded;
      if (
        typeof sub !== 'string' ||
        (role !== 'CUSTOMER' && role !== 'STAFF' && role !== 'ADMIN')
      ) {
        throw new Error('Unexpected payload shape');
      }
      return { sub, role };
    } catch {
      throw new DomainError('SESSION_INVALID', 'Invalid or expired session token');
    }
  }
}