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

// Vercel deploy container: memory/upstash ONLY. It does not import the
// postgres/Prisma adapters or @prisma/client at all, so the bundled artifact
// has zero references to them and the AWS Lambda loader never pre-resolves it.

export interface VercelContainer extends Application {}

export function createVercelContainer(): VercelContainer {
  const redis =
    config.persistenceDriver === 'upstash'
      ? new Redis({
          url: config.upstashRedisUrl,
          token: config.upstashRedisToken,
        })
      : null

  let orderRepo
  let productRepo
  let customerRepo

  if (redis !== null) {
    orderRepo = new UpstashOrderRepository(redis)
    productRepo = new UpstashProductRepository(redis)
    customerRepo = new UpstashCustomerRepository(redis)
  } else {
    orderRepo = new InMemoryOrderRepository()
    productRepo = new InMemoryProductRepository()
    customerRepo = new InMemoryCustomerRepository()
  }

  const eventPublisher = new ConsoleEventPublisher()
  return buildApplication({ orderRepo, productRepo, customerRepo, eventPublisher })
}
