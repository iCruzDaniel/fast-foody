import { createVercelContainer } from './infrastructure/container/container.vercel'

const app = createVercelContainer().app
export = app