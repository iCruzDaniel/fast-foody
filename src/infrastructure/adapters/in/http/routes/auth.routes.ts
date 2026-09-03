import { Router } from 'express';

import { AuthController } from '../controllers/AuthController';
import { SessionServicePort } from '@domain/auth/services';
import { asyncHandler } from '../middlewares';
import { createAuthMiddleware } from '../middlewares/auth.middleware';

export function createAuthRoutes(
  controller: AuthController,
  sessionService: SessionServicePort
): Router {
  const router = Router();
  const { requireAuth, requireRole } = createAuthMiddleware({ sessionService });

  router.post('/register-customer', asyncHandler((req, res) => controller.handleRegisterCustomer(req, res)))
  router.post('/login/customer', asyncHandler((req, res) => controller.handleLoginCustomer(req, res)))
  router.post('/login/staff', asyncHandler((req, res) => controller.handleLoginStaff(req, res)))
  router.post(
    '/register-staff',
    requireAuth,
    requireRole(['ADMIN']),
    asyncHandler((req, res) => controller.handleRegisterStaff(req, res))
  )
  router.post('/logout', asyncHandler((req, res) => controller.handleLogout(req, res)))
  router.get('/me', requireAuth, asyncHandler((req, res) => controller.handleMe(req, res)))

  return router
}