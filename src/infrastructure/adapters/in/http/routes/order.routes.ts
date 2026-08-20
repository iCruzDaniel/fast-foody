import { Router } from 'express'
import { OrderController } from '../controllers/OrderController'

export function createOrderRoutes(controller: OrderController): Router {
  const router = Router()
  router.post('/', (req, res) => controller.create(req, res))
  router.get('/', (req, res) => controller.list(req, res))
  router.get('/:id', (req, res) => controller.getById(req, res))
  router.patch('/:id/confirm', (req, res) => controller.confirm(req, res))
  router.patch('/:id/status', (req, res) => controller.advanceStatus(req, res))
  router.patch('/:id/cancel', (req, res) => controller.cancel(req, res))
  return router
}