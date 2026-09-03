import { createVercelContainer } from './infrastructure/container/container.vercel'

// Vercel entrypoint: uses the postgres-free container so the deployed bundle
// never references the Prisma adapters or @prisma/client.
export const app = createVercelContainer().app

export default app