import { DomainEvent } from '@shared/kernel';
import { OrderId, OrderStatus, type OrderStatus as OrderStatusType } from '@domain/order';

export class OrderStatusChanged implements DomainEvent {
  readonly orderId: OrderId;
  readonly fromStatus: OrderStatusType;
  readonly toStatus: OrderStatusType;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, fromStatus: OrderStatusType, toStatus: OrderStatusType) {
    this.orderId = orderId;
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
    this.occurredAt = new Date();
  }
}