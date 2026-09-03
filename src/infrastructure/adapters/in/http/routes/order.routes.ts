import { Router } from 'express'
import { OrderController } from '../controllers/OrderController'
import { asyncHandler } from '../middlewares'

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router()
  router.post('/', asyncHandler((req, res, next) => controller.create(req, res)))
  router.get('/', asyncHandler((req, res, next) => controller.list(req, res)))
  router.get('/:id', asyncHandler((req, res, next) => controller.getById(req, res)))
  router.patch('/:id/confirm', asyncHandler((req, res, next) => controller.confirm(req, res)))
  router.patch('/:id/status', asyncHandler((req, res, next) => controller.advanceStatus(req, res)))
  router.patch('/:id/cancel', asyncHandler((req, res, next) => controller.cancel(req, res)))
  return router
}