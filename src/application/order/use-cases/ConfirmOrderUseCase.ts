import { OrderRepositoryPort, Order, OrderId, EventPublisherPort } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface ConfirmOrderInput {
  id: string;
}

export class ConfirmOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(input: ConfirmOrderInput): Promise<Order> {
    const orderId = OrderId.fromString(input.id);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    order.confirm();

    await this.orderRepository.save(order);

    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }

    return order;
  }
}