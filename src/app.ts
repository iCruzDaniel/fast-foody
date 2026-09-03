import { createContainer } from './infrastructure/container/container'

// Builds the Express application with all its routes and middleware wired.
// Exported as the default handler so Vercel can serve it as a serverless
// function (see src/server.ts for the local dev listener and api/ for the
// bundled entrypoint used by the Vercel deploy workflow).
export const app = createContainer().app

export default app