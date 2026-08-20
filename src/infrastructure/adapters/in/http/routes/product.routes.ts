import { Router } from 'express'
import { ProductController } from '../controllers/ProductController'

export function createProductRoutes(controller: ProductController): Router {
  const router = Router()
  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.patch('/:id/price', (req, res) => controller.updatePrice(req, res))
  router.patch('/:id/availability', (req, res) => controller.toggleAvailability(req, res))
  return router
}