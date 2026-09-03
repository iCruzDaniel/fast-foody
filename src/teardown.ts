/**
 * Teardown script — deletes the demo data for this project from Upstash Redis.
 *
 * The Upstash database may be shared with other projects, so this script only
 * removes keys under the `fast-foodiy:` namespace and never touches anything
 * else. For the `memory` driver there is nothing to persist, and for `postgres`
 * use `prisma migrate reset` instead.
 *
 * Run with:
 *   npm run teardown
 */
import { Redis } from '@upstash/redis'
import { config } from './infrastructure/config/env'
import { disconnectDatabase } from './infrastructure/config/db'

const NAMESPACE = 'fast-foodiy'

async function collectNamespaceKeys(redis: Redis): Promise<string[]> {
  const keys: string[] = []
  let cursor = '0'

  do {
    const [nextCursor, batch] = await redis.scan(cursor, {
      match: `${NAMESPACE}:*`,
      count: 200,
    })
    keys.push(...batch)
    cursor = nextCursor
  } while (cursor !== '0')

  return keys
}

async function main(): Promise<void> {
  if (config.persistenceDriver !== 'upstash') {
    console.warn(
      `El driver actual es "${config.persistenceDriver}". El teardown solo aplica a Upstash ` +
        `(PERSISTENCE_DRIVER=upstash). Para postgres usa "npx prisma migrate reset"; para memory no hay datos persistentes.`
    )
    return
  }

  const redis = new Redis({
    url: config.upstashRedisUrl,
    token: config.upstashRedisToken,
  })

  const keys = await collectNamespaceKeys(redis)

  if (keys.length === 0) {
    console.log(`No hay claves bajo el namespace "${NAMESPACE}:*" — nada que borrar.`)
    return
  }

  const deleted = await redis.del(...keys)
  console.log(`🗑  Se eliminaron ${deleted} claves del namespace "${NAMESPACE}:*"`)
}

void main()
  .catch((error) => {
    console.error('Error borrando datos:', error)
    process.exit(1)
  })
  .finally(async () => {
    await disconnectDatabase()
    console.log('✅ Teardown finalizado')
  })
