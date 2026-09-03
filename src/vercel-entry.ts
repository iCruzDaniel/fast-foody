import { createVercelContainer } from './infrastructure/container/container.vercel'

const app = createVercelContainer().app

// Named `handler` export: with shouldAddHelpers:true Vercel bridges the Lambda
// event into real Node req/res and invokes this as (req, res). A default export
// made Vercel call app(event, context) (res=context, no .status()) -> 502.
export const handler = (req: unknown, res: unknown) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  app(req as any, res as any)
}