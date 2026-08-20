import { Order, OrderId, OrderStatus, type OrderStatus as OrderStatusType } from '@domain/order';

export interface OrderRepositoryPort {
  save(order: Order): Promise<void>;
  findById(id: OrderId): Promise<Order | null>;
  findAll(filters?: { status?: OrderStatusType }): Promise<Order[]>;
}