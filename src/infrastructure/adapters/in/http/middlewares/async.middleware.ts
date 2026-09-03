import { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async Express request handler so that rejected promises are
 * forwarded to the error middleware via `next(err)`.
 *
 * Express 4 does not catch rejected promises from async handlers — without
 * this wrapper, a `DomainError` thrown in a controller rejects the promise,
 * which is never handled and crashes the process instead of returning the
 * mapped HTTP status (400/404/409) from `errorHandler`.
 */
export function asyncHandler(fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}
