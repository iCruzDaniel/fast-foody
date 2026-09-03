import { z } from 'zod'

export const registerCustomerSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  nationality: z.string().regex(/^\+\d{1,4}$/),
  password: z.string().min(8),
})

export const loginCustomerSchema = z.object({
  phone: z.string().min(1),
  nationality: z.string().regex(/^\+\d{1,4}$/),
  password: z.string().min(1),
})

export const loginStaffSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

export const registerStaffSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(8),
})

export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>
export type LoginCustomerInput = z.infer<typeof loginCustomerSchema>
export type LoginStaffInput = z.infer<typeof loginStaffSchema>
export type RegisterStaffInput = z.infer<typeof registerStaffSchema>