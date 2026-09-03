import { z } from 'zod'

const ProductCategorySchema = z.enum(['BURGERS', 'SIDES', 'DRINKS', 'DESSERTS', 'COMBOS'])

export const CreateProductSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  price: z.number().int().positive(),
  currency: z.string().default('COP'),
  category: ProductCategorySchema,
  available: z.boolean().default(true),
  imageUrl: z.string().url().optional(),
})

export const UpdateProductPriceSchema = z.object({
  price: z.number().int().positive(),
  currency: z.string().default('COP'),
})

export type CreateProductInput = z.infer<typeof CreateProductSchema>
export type UpdateProductPriceInput = z.infer<typeof UpdateProductPriceSchema>