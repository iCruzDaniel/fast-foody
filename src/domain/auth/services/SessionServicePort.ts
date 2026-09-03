export type SessionRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface SessionPayload {
  sub: string;
  role: SessionRole;
}

export interface SessionServicePort {
  signToken(payload: SessionPayload): string;
  verifyToken(token: string): SessionPayload;
}

/** Name of the httpOnly cookie that carries the signed session token. */
export const SESSION_COOKIE = 'ff_session';