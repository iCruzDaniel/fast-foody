import { Request, Response, NextFunction } from 'express'
import { DomainError } from '@shared/kernel'
import { ZodError } from 'zod'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction): void {
  if (err instanceof DomainError) {
    const statusCode = err.code.includes('NOT_FOUND') ? 404 :
                       err.code.includes('TRANSITION') ? 409 :
                       err.code === 'UNAUTHENTICATED' ? 401 :
                       err.code === 'FORBIDDEN' ? 403 : 400
    res.status(statusCode).json({
      error: err.code,
      message: err.message,
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'VALIDATION_ERROR',
      message: err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', '),
    })
    return
  }

  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: 'An unexpected error occurred',
  })
}