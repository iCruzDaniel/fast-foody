import { Request, Response, NextFunction } from 'express';
import { DomainError } from '@shared/kernel';
import {
  SessionServicePort,
  SESSION_COOKIE,
  SessionRole,
} from '@domain/auth/services';

// Attached to res.locals.session by requireAuth for downstream handlers/middleware.
interface RequestSession {
  sub: string;
  role: SessionRole;
}

export interface AuthMiddlewareDeps {
  sessionService: SessionServicePort;
}

export function createAuthMiddleware(deps: AuthMiddlewareDeps) {
  const { sessionService } = deps;

  const requireAuth = (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    const cookies = req.cookies as Record<string, string> | undefined;
    const token = cookies ? cookies[SESSION_COOKIE] : undefined;

    if (!token) {
      return next(
        new DomainError('UNAUTHENTICATED', 'Authentication required')
      );
    }

    let payload;
    try {
      payload = sessionService.verifyToken(token);
    } catch {
      return next(
        new DomainError('UNAUTHENTICATED', 'Authentication required')
      );
    }

    res.locals['session'] = { sub: payload.sub, role: payload.role };
    next();
  };

  const requireRole = (roles: SessionRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      const session = res.locals['session'] as RequestSession | undefined;

      if (!session || !roles.includes(session.role)) {
        return next(
          new DomainError('FORBIDDEN', 'Insufficient permissions')
        );
      }
      next();
    };
  };

  return { requireAuth, requireRole };
}

export type { RequestSession };