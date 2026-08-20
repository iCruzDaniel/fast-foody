import express from 'express'
import { config } from '../config/env'

// InMemory adapters
import { InMemoryOrderRepository } from '../adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { InMemoryProductRepository } from '../adapters/out/persistence/in-memory/InMemoryProductRepository'
import { InMemoryCustomerRepository } from '../adapters/out/persistence/in-memory/InMemoryCustomerRepository'
import { ConsoleEventPublisher } from '../adapters/out/events/ConsoleEventPublisher'

// Postgres adapters (only imported when needed)
import { PrismaOrderRepository } from '../adapters/out/persistence/postgres/PrismaOrderRepository'
import { PrismaProductRepository } from '../adapters/out/persistence/postgres/PrismaProductRepository'
import { PrismaCustomerRepository } from '../adapters/out/persistence/postgres/PrismaCustomerRepository'

// Use cases - Product
import { CreateProductUseCase } from '@application/product/use-cases/CreateProductUseCase'
import { ListProductsUseCase } from '@application/product/use-cases/ListProductsUseCase'
import { GetProductByIdUseCase } from '@application/product/use-cases/GetProductByIdUseCase'
import { UpdateProductPriceUseCase } from '@application/product/use-cases/UpdateProductPriceUseCase'
import { ToggleProductAvailabilityUseCase } from '@application/product/use-cases/ToggleProductAvailabilityUseCase'

// Use cases - Order
import { CreateOrderUseCase } from '@application/order/use-cases/CreateOrderUseCase'
import { ListOrdersUseCase } from '@application/order/use-cases/ListOrdersUseCase'
import { GetOrderByIdUseCase } from '@application/order/use-cases/GetOrderByIdUseCase'
import { ConfirmOrderUseCase } from '@application/order/use-cases/ConfirmOrderUseCase'
import { AdvanceOrderStatusUseCase } from '@application/order/use-cases/AdvanceOrderStatusUseCase'
import { CancelOrderUseCase } from '@application/order/use-cases/CancelOrderUseCase'

// Domain services
import { OrderCompositionService } from '@domain/order'

// Controllers
import { ProductController } from '../adapters/in/http/controllers/ProductController'
import { OrderController } from '../adapters/in/http/controllers/OrderController'

// Routes
import { createProductRoutes } from '../adapters/in/http/routes/product.routes'
import { createOrderRoutes } from '../adapters/in/http/routes/order.routes'

// Middleware
import { errorHandler } from '../adapters/in/http/middlewares/error.middleware'

export interface Container {
  app: express.Express
  orderRepo: InMemoryOrderRepository | PrismaOrderRepository
  productRepo: InMemoryProductRepository | PrismaProductRepository
  customerRepo: InMemoryCustomerRepository | PrismaCustomerRepository
  eventPublisher: ConsoleEventPublisher
}

export function createContainer(): Container {
  // 1. Create adapters based on config
  let orderRepo: InMemoryOrderRepository | PrismaOrderRepository
  let productRepo: InMemoryProductRepository | PrismaProductRepository
  let customerRepo: InMemoryCustomerRepository | PrismaCustomerRepository

  if (config.persistenceDriver === 'postgres') {
    orderRepo = new PrismaOrderRepository()
    productRepo = new PrismaProductRepository()
    customerRepo = new PrismaCustomerRepository()
  } else {
    orderRepo = new InMemoryOrderRepository()
    productRepo = new InMemoryProductRepository()
    customerRepo = new InMemoryCustomerRepository()
  }

  const eventPublisher = new ConsoleEventPublisher()

  // 2. Create domain services
  const orderCompositionService = new OrderCompositionService()

  // 3. Create use cases - Product
  const createProduct = new CreateProductUseCase(productRepo)
  const listProducts = new ListProductsUseCase(productRepo)
  const getProductById = new GetProductByIdUseCase(productRepo)
  const updateProductPrice = new UpdateProductPriceUseCase(productRepo)
  const toggleProductAvailability = new ToggleProductAvailabilityUseCase(productRepo)

  // 4. Create use cases - Order
  const createOrder = new CreateOrderUseCase(
    orderRepo,
    productRepo,
    customerRepo,
    eventPublisher,
    orderCompositionService
  )
  const listOrders = new ListOrdersUseCase(orderRepo)
  const getOrderById = new GetOrderByIdUseCase(orderRepo)
  const confirmOrder = new ConfirmOrderUseCase(orderRepo, eventPublisher)
  const advanceOrderStatus = new AdvanceOrderStatusUseCase(orderRepo, eventPublisher)
  const cancelOrder = new CancelOrderUseCase(orderRepo, eventPublisher)

  // 5. Create controllers
  const productController = new ProductController(
    createProduct,
    listProducts,
    getProductById,
    updateProductPrice,
    toggleProductAvailability
  )

  const orderController = new OrderController(
    createOrder,
    listOrders,
    getOrderById,
    confirmOrder,
    advanceOrderStatus,
    cancelOrder
  )

  // 6. Create Express app
  const app = express()
  app.use(express.json())
  app.use('/api/v1/products', createProductRoutes(productController))
  app.use('/api/v1/orders', createOrderRoutes(orderController))
  app.use(errorHandler)

  return { app, orderRepo, productRepo, customerRepo, eventPublisher }
}