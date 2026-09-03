import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { config } from '../config/env'
import { Redis } from '@upstash/redis'

// Domain ports & services (implementation-agnostic).
import type { OrderRepositoryPort } from '@domain/order'
import type { ProductRepositoryPort } from '@domain/product'
import type { CustomerRepositoryPort } from '@domain/customer'
import { OrderCompositionService } from '@domain/order'
import type { StaffRepositoryPort } from '@domain/auth/repositories/StaffRepositoryPort'
import type { CustomerAccountRepositoryPort } from '@domain/auth/repositories/CustomerAccountRepositoryPort'

// Persistence-agnostic adapter types that are always available.
import type { ConsoleEventPublisher } from '../adapters/out/events/ConsoleEventPublisher'

// Upstash auth repositories (auth is wired only for the upstash driver).
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

export interface ApplicationRepositories {
  orderRepo: OrderRepositoryPort
  productRepo: ProductRepositoryPort
  customerRepo: CustomerRepositoryPort
  eventPublisher: ConsoleEventPublisher
}

export interface Application {
  app: express.Express
  orderRepo: OrderRepositoryPort
  productRepo: ProductRepositoryPort
  customerRepo: CustomerRepositoryPort
  eventPublisher: ConsoleEventPublisher
  authController: AuthController | null
}

/**
 * Builds the Express application (security adapters, auth, use cases,
 * controllers, routes, CORS, error middleware) from a set of repositories.
 * Shared by the local (postgres-capable) container and the Vercel container so
 * the deployed bundle never references the postgres/Prisma adapters.
 */
export function buildApplication(repos: ApplicationRepositories): Application {
  const { orderRepo, productRepo, customerRepo, eventPublisher } = repos

  const redis =
    config.persistenceDriver === 'upstash'
      ? new Redis({
          url: config.upstashRedisUrl,
          token: config.upstashRedisToken,
        })
      : null

  const orderCompositionService = new OrderCompositionService()

  const passwordHasher = new BcryptPasswordHasher()
  const jwtSessionService = new JwtSessionService({
    secret: config.sessionSecret,
    ttlSeconds: config.sessionTtlSeconds,
  })

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
  app.use((req, res) => {
    if (process.env['NODE_ENV'] !== 'production') {
      console.log(`[fast-foody] unmatched ${req.method} ${req.url}`)
    }
    res.status(404).json({ error: 'NOT_FOUND', message: 'Route not found' })
  })

  return {
    app,
    orderRepo,
    productRepo,
    customerRepo,
    eventPublisher,
    authController,
  }
}