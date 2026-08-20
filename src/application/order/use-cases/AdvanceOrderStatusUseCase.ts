import { OrderRepositoryPort, Order, OrderId, OrderStatus, type OrderStatus as OrderStatusType, EventPublisherPort } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface AdvanceOrderStatusInput {
  id: string;
  status: OrderStatusType;
}

export class AdvanceOrderStatusUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly eventPublisher: EventPublisherPort
  ) {}

  async execute(input: AdvanceOrderStatusInput): Promise<Order> {
    const orderId = OrderId.fromString(input.id);
    const order = await this.orderRepository.findById(orderId);

    if (!order) {
      throw new DomainError('ORDER_NOT_FOUND', 'Order not found');
    }

    if (!isValidOrderStatus(input.status)) {
      throw new DomainError('INVALID_ORDER_STATUS', 'Invalid order status');
    }

    order.advanceStatus(input.status);

    await this.orderRepository.save(order);

    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }

    return order;
  }
}

function isValidOrderStatus(value: string): value is OrderStatusType {
  return Object.values(OrderStatus).includes(value as OrderStatusType);
}