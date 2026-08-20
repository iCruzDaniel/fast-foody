import { OrderRepositoryPort, Order, OrderId, OrderStatus, type OrderStatus as OrderStatusType } from '@domain/order';

export class InMemoryOrderRepository implements OrderRepositoryPort {
  private readonly store: Map<string, Order> = new Map();

  async save(order: Order): Promise<void> {
    this.store.set(order.id.value, order);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const order = this.store.get(id.value);
    return order ?? null;
  }

  async findAll(filters?: { status?: OrderStatusType }): Promise<Order[]> {
    const orders = Array.from(this.store.values());

    if (!filters?.status) {
      return orders;
    }

    return orders.filter((order) => order.status === filters.status);
  }
}