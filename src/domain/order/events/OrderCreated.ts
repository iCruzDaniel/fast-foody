import { DomainEvent } from '@shared/kernel';
import { OrderId } from '@domain/order';
import { CustomerId } from '@domain/customer';

export class OrderCreated implements DomainEvent {
  readonly orderId: OrderId;
  readonly customerId: CustomerId;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, customerId: CustomerId) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.occurredAt = new Date();
  }
}