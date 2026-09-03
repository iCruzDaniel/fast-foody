import { createVercelContainer } from './infrastructure/container/container.vercel'

const app = createVercelContainer().app

// `export = app` emits `module.exports = app`, the exact (req, res) handler
// shape Vercel's Nodejs launcher invokes directly (a default export caused
// NO_RESPONSE_FROM_FUNCTION). Keep it as-is.
export = app