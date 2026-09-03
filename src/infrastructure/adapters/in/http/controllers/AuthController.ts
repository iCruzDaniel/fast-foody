import { Request, Response } from 'express'
import { DomainError } from '@shared/kernel'
import { z } from 'zod'

import { SESSION_COOKIE } from '@domain/auth/services'
import { registerCustomerSchema, loginCustomerSchema, loginStaffSchema, registerStaffSchema } from '../dtos/auth.dto'

import type {
  RegisterCustomerAccountUseCase,
  LoginCustomerUseCase,
  LoginStaffUseCase,
  RegisterStaffUseCase,
  RegisterStaffUseCaseInput,
  GetCurrentSessionUseCase,
  LogoutUseCase,
} from '@application/auth/use-cases'

export class AuthController {
  constructor(
    private readonly registerCustomerUC: RegisterCustomerAccountUseCase,
    private readonly loginCustomerUC: LoginCustomerUseCase,
    private readonly loginStaffUC: LoginStaffUseCase,
    private readonly registerStaffUC: RegisterStaffUseCase,
    private readonly getCurrentSessionUC: GetCurrentSessionUseCase,
    private readonly logoutUC: LogoutUseCase,
    private readonly sessionService: import('@domain/auth/services').SessionServicePort,
    private readonly config: { sessionTtlSeconds: number; production: boolean },
  ) {}

  async handleRegisterCustomer(req: Request, res: Response): Promise<void> {
    const parsed = registerCustomerSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      })
      return
    }

    const input = parsed.data
    const result = await this.registerCustomerUC.execute(input)

    const ttlMs = this.config.sessionTtlSeconds * 1000
    const secure = this.config.production ? true : false

    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secure,
      maxAge: ttlMs,
      path: '/',
    })

    res.status(201).json({
      customer: {
        id: result.customer.id,
        name: result.customer.name,
        phone: result.customer.phone,
        nationality: result.customer.nationality,
      },
    })
  }

  async handleLoginCustomer(req: Request, res: Response): Promise<void> {
    const parsed = loginCustomerSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      })
      return
    }

    const input = parsed.data
    const result = await this.loginCustomerUC.execute(input)

    const ttlMs = this.config.sessionTtlSeconds * 1000
    const secure = this.config.production ? true : false

    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secure,
      maxAge: ttlMs,
      path: '/',
    })

    res.json({
      customer: {
        id: result.customer.id,
        name: result.customer.name,
        phone: result.customer.phone,
        nationality: result.customer.nationality,
      },
    })
  }

  async handleLoginStaff(req: Request, res: Response): Promise<void> {
    const parsed = loginStaffSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      })
      return
    }

    const input = parsed.data
    const result = await this.loginStaffUC.execute(input)

    const ttlMs = this.config.sessionTtlSeconds * 1000
    const secure = this.config.production ? true : false

    res.cookie(SESSION_COOKIE, result.token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: secure,
      maxAge: ttlMs,
      path: '/',
    })

    res.json({
      staff: {
        id: result.staff.id,
        username: result.staff.username,
        role: result.staff.role,
      },
    })
  }

  async handleRegisterStaff(req: Request, res: Response): Promise<void> {
    const parsed = registerStaffSchema.safeParse(req.body)

    if (!parsed.success) {
      res.status(400).json({
        error: 'VALIDATION_ERROR',
        message: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
      })
      return
    }

    const input: RegisterStaffUseCaseInput = {
      actorRole: (res.locals as { session: { role: string } }).session.role,
      username: parsed.data.username,
      password: parsed.data.password,
    }
    const result = await this.registerStaffUC.execute(input)

    res.status(201).json({
      staff: {
        id: result.staff.id,
        username: result.staff.username,
        role: result.staff.role,
      },
    })
  }

  async handleLogout(req: Request, res: Response): Promise<void> {
    res.clearCookie(SESSION_COOKIE, { path: '/' })
    res.json({ ok: true })
  }

  async handleMe(req: Request, res: Response): Promise<void> {
    const session = res.locals['session']

    if (!session) {
      res.status(401).json({ error: 'UNAUTHENTICATED', message: 'Authentication required' })
      return
    }

    const result = await this.getCurrentSessionUC.execute({
      sub: session.sub,
      role: session.role,
    })

    if (result.role === 'CUSTOMER') {
      res.json({
        role: 'CUSTOMER',
        customer: {
          id: result.id,
          name: result.name,
          phone: result.phone,
          nationality: result.nationality,
        },
      })
      return
    }

    res.json({
      role: result.role,
      staff: {
        id: result.id,
        username: result.username,
        role: result.role,
      },
    })
  }
}