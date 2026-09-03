import { config } from '../config/env'
import { Redis } from '@upstash/redis'

import { buildApplication } from './application'
import type { Application } from './application'

// InMemory adapters
import { InMemoryOrderRepository } from '../adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { InMemoryProductRepository } from '../adapters/out/persistence/in-memory/InMemoryProductRepository'
import { InMemoryCustomerRepository } from '../adapters/out/persistence/in-memory/InMemoryCustomerRepository'
import { ConsoleEventPublisher } from '../adapters/out/events/ConsoleEventPublisher'

// Upstash adapters
import { UpstashOrderRepository } from '../adapters/out/persistence/upstash/UpstashOrderRepository'
import { UpstashProductRepository } from '../adapters/out/persistence/upstash/UpstashProductRepository'
import { UpstashCustomerRepository } from '../adapters/out/persistence/upstash/UpstashCustomerRepository'

// Postgres adapters: type-only import (no runtime require) + a lazy loader so
// @prisma/client is only resolved when the postgres driver actually runs.
// This file is NOT used by the Vercel bundle (which uses container.vercel.ts),
// so the require below never reaches the deployment.
import type { PrismaOrderRepository } from '../adapters/out/persistence/postgres/PrismaOrderRepository'
import type { PrismaProductRepository } from '../adapters/out/persistence/postgres/PrismaProductRepository'
import type { PrismaCustomerRepository } from '../adapters/out/persistence/postgres/PrismaCustomerRepository'

type OrderRepository = InMemoryOrderRepository | PrismaOrderRepository | UpstashOrderRepository
type ProductRepository = InMemoryProductRepository | PrismaProductRepository | UpstashProductRepository
type CustomerRepository = InMemoryCustomerRepository | PrismaCustomerRepository | UpstashCustomerRepository

interface PrismaRepos {
  orderRepo: PrismaOrderRepository
  productRepo: PrismaProductRepository
  customerRepo: PrismaCustomerRepository
}

function createPrismaRepos(): PrismaRepos {
  const { PrismaOrderRepository: OrderRepo } = require('../adapters/out/persistence/postgres/PrismaOrderRepository')
  const { PrismaProductRepository: ProductRepo } = require('../adapters/out/persistence/postgres/PrismaProductRepository')
  const { PrismaCustomerRepository: CustomerRepo } = require('../adapters/out/persistence/postgres/PrismaCustomerRepository')
  return {
    orderRepo: new OrderRepo(),
    productRepo: new ProductRepo(),
    customerRepo: new CustomerRepo(),
  }
}

export interface Container extends Application {}

export function createContainer(): Container {
  let orderRepo: OrderRepository
  let productRepo: ProductRepository
  let customerRepo: CustomerRepository

  if (config.persistenceDriver === 'postgres') {
    const prisma = createPrismaRepos()
    orderRepo = prisma.orderRepo
    productRepo = prisma.productRepo
    customerRepo = prisma.customerRepo
  } else {
    const redis =
      config.persistenceDriver === 'upstash'
        ? new Redis({
            url: config.upstashRedisUrl,
            token: config.upstashRedisToken,
          })
        : null

    if (redis !== null) {
      orderRepo = new UpstashOrderRepository(redis)
      productRepo = new UpstashProductRepository(redis)
      customerRepo = new UpstashCustomerRepository(redis)
    } else {
      orderRepo = new InMemoryOrderRepository()
      productRepo = new InMemoryProductRepository()
      customerRepo = new InMemoryCustomerRepository()
    }
  }

  const eventPublisher = new ConsoleEventPublisher()
  return buildApplication({ orderRepo, productRepo, customerRepo, eventPublisher })
}
