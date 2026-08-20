import { DomainEvent } from '@shared/kernel';
import { OrderId } from '@domain/order';

export class OrderCancelled implements DomainEvent {
  readonly orderId: OrderId;
  readonly reason: string | undefined;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, reason: string | undefined) {
    this.orderId = orderId;
    this.reason = reason;
    this.occurredAt = new Date();
  }
}