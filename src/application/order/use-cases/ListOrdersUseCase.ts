import { OrderRepositoryPort, Order, OrderStatus, type OrderStatus as OrderStatusType } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface ListOrdersInput {
  status?: OrderStatusType;
}

export class ListOrdersUseCase {
  constructor(private readonly orderRepository: OrderRepositoryPort) {}

  async execute(input: ListOrdersInput = {}): Promise<Order[]> {
    if (input.status && !isValidOrderStatus(input.status)) {
      throw new DomainError('INVALID_ORDER_STATUS', 'Invalid order status');
    }

    const filters: { status?: OrderStatusType } = {};
    if (input.status) {
      filters.status = input.status;
    }

    return this.orderRepository.findAll(filters);
  }
}

function isValidOrderStatus(value: string): value is OrderStatusType {
  return Object.values(OrderStatus).includes(value as OrderStatusType);
}