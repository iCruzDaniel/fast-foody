import { DomainEvent } from '@shared/kernel';
import { OrderId, Money } from '@domain/order';

export class OrderConfirmed implements DomainEvent {
  readonly orderId: OrderId;
  readonly total: Money;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, total: Money) {
    this.orderId = orderId;
    this.total = total;
    this.occurredAt = new Date();
  }
}