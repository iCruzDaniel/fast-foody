import { OrderRepositoryPort, Order, OrderId, EventPublisherPort } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface CancelOrderInput {
  id: string;
  reason?: string;
}

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(input: CancelOrderInput): Promise<Order> {
    const orderId = OrderId.fromString(input.id);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    order.cancel(input.reason);

    await this.orderRepository.save(order);

    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }

    return order;
  }
}