import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from '../config/env'
import { Redis } from '@upstash/redis'

// InMemory adapters
import { InMemoryOrderRepository } from '../adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { InMemoryProductRepository } from '../adapters/out/persistence/in-memory/InMemoryProductRepository'
import { InMemoryCustomerRepository } from '../adapters/out/persistence/in-memory/InMemoryCustomerRepository'
import { ConsoleEventPublisher } from '../adapters/out/events/ConsoleEventPublisher'

// Postgres adapters: type-only import (no runtime require) + a lazy loader so
// @prisma/client is never pulled in for the memory/upstash drivers, which are
// the defaults on Vercel. Prisma's generated client is only resolved when the
// postgres driver branch actually runs, avoiding a module-load crash there.
import type { PrismaOrderRepository } from '../adapters/out/persistence/postgres/PrismaOrderRepository'
import type { PrismaProductRepository } from '../adapters/out/persistence/postgres/PrismaProductRepository'
import type { PrismaCustomerRepository } from '../adapters/out/persistence/postgres/PrismaCustomerRepository'

interface PrismaRepos {
  orderRepo: PrismaOrderRepository
  productRepo: PrismaProductRepository
  customerRepo: PrismaCustomerRepository
}

function createPrismaRepos(): PrismaRepos {
  // require() runs only when the postgres driver is active; esbuild still
  // bundles the required modules (and keeps @prisma/client external).
  const { PrismaOrderRepository: OrderRepo } = require('../adapters/out/persistence/postgres/PrismaOrderRepository')
  const { PrismaProductRepository: ProductRepo } = require('../adapters/out/persistence/postgres/PrismaProductRepository')
  const { PrismaCustomerRepository: CustomerRepo } = require('../adapters/out/persistence/postgres/PrismaCustomerRepository')
  return {
    orderRepo: new OrderRepo(),
    productRepo: new ProductRepo(),
    customerRepo: new CustomerRepo(),
  }
}

// Upstash adapters
import { UpstashOrderRepository } from '../adapters/out/persistence/upstash/UpstashOrderRepository'
import { UpstashProductRepository } from '../adapters/out/persistence/upstash/UpstashProductRepository'
import { UpstashCustomerRepository } from '../adapters/out/persistence/upstash/UpstashCustomerRepository'
import { UpstashStaffAccountRepository } from '../adapters/out/persistence/upstash/UpstashStaffAccountRepository'
import { UpstashCustomerAccountRepository } from '../adapters/out/persistence/upstash/UpstashCustomerAccountRepository'

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

// Use cases - Auth
import { RegisterCustomerAccountUseCase } from '@application/auth/use-cases/RegisterCustomerAccountUseCase'
import { LoginCustomerUseCase } from '@application/auth/use-cases/LoginCustomerUseCase'
import { RegisterStaffUseCase } from '@application/auth/use-cases/RegisterStaffUseCase'
import { LoginStaffUseCase } from '@application/auth/use-cases/LoginStaffUseCase'
import { GetCurrentSessionUseCase } from '@application/auth/use-cases/GetCurrentSessionUseCase'
import { LogoutUseCase } from '@application/auth/use-cases/LogoutUseCase'

// Ports (Auth)
import type { StaffRepositoryPort } from '@domain/auth/repositories/StaffRepositoryPort'
import type { CustomerAccountRepositoryPort } from '@domain/auth/repositories/CustomerAccountRepositoryPort'

// Domain services
import { OrderCompositionService } from '@domain/order'

// Controllers
import { ProductController } from '../adapters/in/http/controllers/ProductController'
import { OrderController } from '../adapters/in/http/controllers/OrderController'
import { AuthController } from '../adapters/in/http/controllers/AuthController'

// Routes
import { createProductRoutes } from '../adapters/in/http/routes/product.routes'
import { createOrderRoutes } from '../adapters/in/http/routes/order.routes'
import { createAuthRoutes } from '../adapters/in/http/routes/auth.routes'

// Middleware
import { errorHandler } from '../adapters/in/http/middlewares/error.middleware'

// Security
import { BcryptPasswordHasher } from '../adapters/out/security/PasswordHasher'
import { JwtSessionService } from '../adapters/out/security/JsonWebTokenSession'

export interface Container {
  app: express.Express
  orderRepo: InMemoryOrderRepository | PrismaOrderRepository | UpstashOrderRepository
  productRepo: InMemoryProductRepository | PrismaProductRepository | UpstashProductRepository
  customerRepo: InMemoryCustomerRepository | PrismaCustomerRepository | UpstashCustomerRepository
  eventPublisher: ConsoleEventPublisher
  authController: AuthController | null
}

export function createContainer(): Container {
  // 1. Create the Redis client first so both the persistence layer and the
  //    auth layer can share one connection when the upstash driver is active.
  const redis =
    config.persistenceDriver === 'upstash'
      ? new Redis({
          url: config.upstashRedisUrl,
          token: config.upstashRedisToken,
        })
      : null

  let orderRepo: InMemoryOrderRepository | PrismaOrderRepository | UpstashOrderRepository
  let productRepo: InMemoryProductRepository | PrismaProductRepository | UpstashProductRepository
  let customerRepo: InMemoryCustomerRepository | PrismaCustomerRepository | UpstashCustomerRepository

  if (config.persistenceDriver === 'postgres') {
    const prisma = createPrismaRepos()
    orderRepo = prisma.orderRepo
    productRepo = prisma.productRepo
    customerRepo = prisma.customerRepo
  } else if (redis !== null) {
    orderRepo = new UpstashOrderRepository(redis)
    productRepo = new UpstashProductRepository(redis)
    customerRepo = new UpstashCustomerRepository(redis)
  } else {
    orderRepo = new InMemoryOrderRepository()
    productRepo = new InMemoryProductRepository()
    customerRepo = new InMemoryCustomerRepository()
  }

  const eventPublisher = new ConsoleEventPublisher()

  // 2. Create domain services
  const orderCompositionService = new OrderCompositionService()

  // 3. Create security adapters
  const passwordHasher = new BcryptPasswordHasher()
  const jwtSessionService = new JwtSessionService({
    secret: config.sessionSecret,
    ttlSeconds: config.sessionTtlSeconds,
  })

  // 4. Auth is wired ONLY for the upstash driver (per project decision). For
  //    memory/postgres the `/api/v1/auth` routes are not mounted.
  let authController: AuthController | null = null
  if (redis !== null) {
    const authStaffRepo: StaffRepositoryPort = new UpstashStaffAccountRepository(redis)
    const authCustomerAccountRepo: CustomerAccountRepositoryPort =
      new UpstashCustomerAccountRepository(redis, customerRepo)

    const registerCustomerUC = new RegisterCustomerAccountUseCase(
      customerRepo,
      authCustomerAccountRepo,
      passwordHasher,
      jwtSessionService
    )
    const loginCustomerUC = new LoginCustomerUseCase(
      authCustomerAccountRepo,
      passwordHasher,
      jwtSessionService
    )
    const registerStaffUC = new RegisterStaffUseCase(authStaffRepo, passwordHasher)
    const loginStaffUC = new LoginStaffUseCase(
      authStaffRepo,
      passwordHasher,
      jwtSessionService
    )
    const getCurrentSessionUC = new GetCurrentSessionUseCase(
      authCustomerAccountRepo,
      authStaffRepo,
      customerRepo
    )
    const logoutUC = new LogoutUseCase()

    authController = new AuthController(
      registerCustomerUC,
      loginCustomerUC,
      loginStaffUC,
      registerStaffUC,
      getCurrentSessionUC,
      logoutUC,
      jwtSessionService,
      {
        sessionTtlSeconds: config.sessionTtlSeconds,
        production: config.production,
      }
    )
  }

  // 5. Create product use cases + controller
  const createProduct = new CreateProductUseCase(productRepo)
  const listProducts = new ListProductsUseCase(productRepo)
  const getProductById = new GetProductByIdUseCase(productRepo)
  const updateProductPrice = new UpdateProductPriceUseCase(productRepo)
  const toggleProductAvailability = new ToggleProductAvailabilityUseCase(productRepo)

  const productController = new ProductController(
    createProduct,
    listProducts,
    getProductById,
    updateProductPrice,
    toggleProductAvailability
  )

  // 6. Create order use cases + controller
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

  const orderController = new OrderController(
    createOrder,
    listOrders,
    getOrderById,
    confirmOrder,
    advanceOrderStatus,
    cancelOrder
  )

  // 7. Create Express app
  const app = express()
  app.use(express.json())
  app.use(cookieParser())
  app.use(
    cors({
      origin(origin, cb) {
        if (!origin || config.corsOrigins.length === 0) {
          cb(null, true)
          return
        }
        if (config.corsOrigins.includes(origin)) {
          cb(null, origin)
          return
        }
        cb(new Error(`Origin ${origin} not allowed by CORS`))
      },
      credentials: true,
    })
  )

  app.use('/api/v1/products', createProductRoutes(productController))
  app.use('/api/v1/orders', createOrderRoutes(orderController))
  if (authController !== null) {
    app.use('/api/v1/auth', createAuthRoutes(authController, jwtSessionService))
  }
  app.use(errorHandler)

  return {
    app,
    orderRepo,
    productRepo,
    customerRepo,
    eventPublisher,
    authController,
  }
}