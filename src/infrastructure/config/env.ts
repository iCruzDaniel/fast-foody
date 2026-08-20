import dotenv from 'dotenv'
dotenv.config()

export const config = {
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  persistenceDriver: (process.env['PERSISTENCE_DRIVER'] ?? 'memory') as 'memory' | 'postgres',
  databaseUrl: process.env['DATABASE_URL'] ?? '',
}