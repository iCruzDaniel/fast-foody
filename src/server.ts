import { config } from './infrastructure/config/env'
import { app } from './app'
import { disconnectDatabase } from './infrastructure/config/db'

const server = app.listen(config.port, () => {
  console.log(`Fast Foodiy API running on port ${config.port}`)
  console.log(`Persistence driver: ${config.persistenceDriver}`)
})

async function shutdown(): Promise<void> {
  server.close()
  await disconnectDatabase()
  process.exit(0)
}

process.on('SIGINT', () => { void shutdown() })
process.on('SIGTERM', () => { void shutdown() })