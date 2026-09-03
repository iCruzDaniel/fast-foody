import { Router } from 'express'
import { ProductController } from '../controllers/ProductController'
import { asyncHandler } from '../middlewares'

export function createProductRoutes(controller: ProductController): Router {
  const router = Router()
  router.post('/', asyncHandler((req, res, next) => controller.create(req, res)))
  router.get('/', asyncHandler((req, res, next) => controller.list(req, res)))
  router.get('/:id', asyncHandler((req, res, next) => controller.getById(req, res)))
  router.patch('/:id/price', asyncHandler((req, res, next) => controller.updatePrice(req, res)))
  router.patch('/:id/availability', asyncHandler((req, res, next) => controller.toggleAvailability(req, res)))
  return router
}