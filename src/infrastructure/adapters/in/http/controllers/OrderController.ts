import { Request, Response } from 'express'
import { CreateOrderUseCase } from '@application/order/use-cases/CreateOrderUseCase'
import { ListOrdersUseCase } from '@application/order/use-cases/ListOrdersUseCase'
import { GetOrderByIdUseCase } from '@application/order/use-cases/GetOrderByIdUseCase'
import { ConfirmOrderUseCase } from '@application/order/use-cases/ConfirmOrderUseCase'
import { AdvanceOrderStatusUseCase } from '@application/order/use-cases/AdvanceOrderStatusUseCase'
import { CancelOrderUseCase } from '@application/order/use-cases/CancelOrderUseCase'
import { CreateOrderSchema, AdvanceOrderStatusSchema, CancelOrderSchema } from '../dtos/order.dto'
import { Order, OrderItem, OrderStatus } from '@domain/order'
import { DomainError } from '@shared/kernel'

export class OrderController {
  constructor(
    private readonly createOrder: CreateOrderUseCase,
    private readonly listOrders: ListOrdersUseCase,
    private readonly getOrderById: GetOrderByIdUseCase,
    private readonly confirmOrder: ConfirmOrderUseCase,
    private readonly advanceOrderStatus: AdvanceOrderStatusUseCase,
    private readonly cancelOrder: CancelOrderUseCase
  ) {}

  async create(req: Request, res: Response): Promise<void> {
    const input = CreateOrderSchema.parse(req.body)
    const order = await this.createOrder.execute(input)
    res.status(201).json(this.toOrderResponse(order))
  }

  async list(req: Request, res: Response): Promise<void> {
    const status = req.query['status']
    const input: { status?: OrderStatus } = {}
    if (typeof status === 'string') {
      input.status = status as OrderStatus
    }
    const orders = await this.listOrders.execute(input)
    res.json(orders.map((order) => this.toOrderResponse(order)))
  }

  async getById(req: Request, res: Response): Promise<void> {
    const order = await this.getOrderById.execute({ id: this.getParamId(req) })
    res.json(this.toOrderResponse(order))
  }

  async confirm(req: Request, res: Response): Promise<void> {
    const order = await this.confirmOrder.execute({ id: this.getParamId(req) })
    res.json(this.toOrderResponse(order))
  }

  async advanceStatus(req: Request, res: Response): Promise<void> {
    const parsed = AdvanceOrderStatusSchema.parse(req.body)
    const order = await this.advanceOrderStatus.execute({
      id: this.getParamId(req),
      status: parsed.status,
    })
    res.json(this.toOrderResponse(order))
  }

  async cancel(req: Request, res: Response): Promise<void> {
    const parsed = CancelOrderSchema.parse(req.body)
    const input: { id: string; reason?: string } = { id: this.getParamId(req) }
    if (parsed.reason !== undefined) {
      input.reason = parsed.reason
    }
    const order = await this.cancelOrder.execute(input)
    res.json(this.toOrderResponse(order))
  }

  private getParamId(req: Request): string {
    const id = req.params['id']
    if (!id) {
      throw new DomainError('INVALID_ID', 'Missing id parameter')
    }
    return id
  }

  private toOrderResponse(order: Order) {
    return {
      id: order.id.value,
      customerId: order.customerId.value,
      items: order.getItems().map((item) => this.toOrderItemResponse(item)),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    }
  }

  private toOrderItemResponse(item: OrderItem) {
    return {
      id: item.id,
      productId: item.productId.value,
      productName: item.productName,
      unitPrice: {
        amount: item.unitPrice.amount,
        currency: item.unitPrice.currency,
      },
      quantity: item.quantity.value,
    }
  }
}