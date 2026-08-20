import { z } from 'zod'

const OrderStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'IN_PREPARATION', 'READY', 'DELIVERED', 'CANCELLED'])

export const CreateOrderSchema = z.object({
  customerId: z.string().uuid(),
  items: z.array(z.object({
    productId: z.string().uuid(),
    quantity: z.number().int().min(1).max(50),
  })).min(1),
})

export const AdvanceOrderStatusSchema = z.object({
  status: OrderStatusSchema,
})

export const CancelOrderSchema = z.object({
  reason: z.string().optional(),
})

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>
export type AdvanceOrderStatusInput = z.infer<typeof AdvanceOrderStatusSchema>
export type CancelOrderInput = z.infer<typeof CancelOrderSchema>