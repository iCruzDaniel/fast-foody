import { OrderRepositoryPort, Order, OrderId } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface GetOrderByIdInput {
  id: string;
}

export class GetOrderByIdUseCase {
  constructor(private readonly orderRepository: OrderRepositoryPort) {}

  async execute(input: GetOrderByIdInput): Promise<Order> {
    const orderId = OrderId.fromString(input.id);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    return order;
  }
}