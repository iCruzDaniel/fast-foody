import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  persistenceDriver: (process.env['PERSISTENCE_DRIVER'] ?? 'memory') as 'memory' | 'postgres' | 'upstash',
  databaseUrl: process.env['DATABASE_URL'] ?? '',
  upstashRedisUrl: process.env['UPSTASH_REDIS_REST_URL'] ?? '',
  upstashRedisToken: process.env['UPSTASH_REDIS_REST_TOKEN'] ?? '',
  sessionSecret: process.env['SESSION_SECRET'] ?? 'dev-secret-change-me',
  sessionTtlSeconds: parseInt(process.env['SESSION_TTL'] ?? '604800', 10),
  demoMode: process.env['DEMO_MODE'] === 'true',
  production: process.env['NODE_ENV'] === 'production',
  // Comma-separated list of allowed cross-origin frontends for credentialed
  // requests. Empty string mirrors the incoming Origin (dev/same-host proxy).
  corsOrigins: (process.env['CORS_ORIGIN'] ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter((o) => o.length > 0)
    .filter((o) => o !== '*'),
}