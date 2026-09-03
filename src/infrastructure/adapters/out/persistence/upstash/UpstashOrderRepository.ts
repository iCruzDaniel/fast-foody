import { Redis } from '@upstash/redis';
import { OrderRepositoryPort, Order, OrderId, OrderStatus, type OrderStatus as OrderStatusType, Money, Quantity, OrderItem } from '@domain/order';
import { ProductId } from '@domain/product';
import { CustomerId } from '@domain/customer';

interface PersistedOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: { amount: number; currency: string };
  quantity: number;
}

interface PersistedOrder {
  id: string;
  customerId: string;
  items: PersistedOrderItem[];
  status: OrderStatusType;
  createdAt: string;
  updatedAt: string;
}

export class UpstashOrderRepository implements OrderRepositoryPort {
  private readonly redis: Redis;
  private static readonly NAMESPACE = 'fast-foodiy';
  private readonly orderKeyPrefix = `${UpstashOrderRepository.NAMESPACE}:order:`;
  private readonly ordersIndexKey = `${UpstashOrderRepository.NAMESPACE}:orders:index`;
  private readonly ordersStatusPrefix = `${UpstashOrderRepository.NAMESPACE}:orders:status:`;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async save(order: Order): Promise<void> {
    const persistedOrder = this.toPersistence(order);
    const orderKey = `${this.orderKeyPrefix}${order.id.value}`;

    // Read the previously stored order so we can remove the id from its old
    // status index set (e.g. PENDING -> DELIVERED must drop the PENDING entry).
    const previous = await this.redis.get<PersistedOrder>(orderKey);

    await this.redis.set(orderKey, persistedOrder);
    await this.redis.sadd(this.ordersIndexKey, order.id.value);

    if (previous && previous.status !== order.status) {
      await this.redis.srem(`${this.ordersStatusPrefix}${previous.status}`, order.id.value);
    }
    await this.redis.sadd(`${this.ordersStatusPrefix}${order.status}`, order.id.value);
  }

  async findById(id: OrderId): Promise<Order | null> {
    const orderKey = `${this.orderKeyPrefix}${id.value}`;
    const persistedOrder = await this.redis.get<PersistedOrder>(orderKey);

    if (!persistedOrder) {
      return null;
    }

    return this.toDomain(persistedOrder);
  }

  async findAll(filters?: { status?: OrderStatusType }): Promise<Order[]> {
    let orderIds: string[];

    if (filters?.status) {
      orderIds = (await this.redis.smembers(`${this.ordersStatusPrefix}${filters.status}`)) as string[];
    } else {
      orderIds = (await this.redis.smembers(this.ordersIndexKey)) as string[];
    }

    if (orderIds.length === 0) {
      return [];
    }

    const orders: Order[] = [];
    for (const orderId of orderIds) {
      const orderKey = `${this.orderKeyPrefix}${orderId}`;
      const persistedOrder = await this.redis.get<PersistedOrder>(orderKey);
      if (persistedOrder) {
        orders.push(this.toDomain(persistedOrder));
      }
    }

    return orders;
  }

  private toDomain(persistedOrder: PersistedOrder): Order {
    const items = persistedOrder.items.map((item) =>
      OrderItem.reconstruct(
        item.id,
        ProductId.fromString(item.productId),
        item.productName,
        Money.create(item.unitPrice.amount, item.unitPrice.currency),
        Quantity.create(item.quantity)
      )
    );

    return Order.reconstruct(
      OrderId.fromString(persistedOrder.id),
      CustomerId.fromString(persistedOrder.customerId),
      items,
      persistedOrder.status,
      new Date(persistedOrder.createdAt),
      new Date(persistedOrder.updatedAt)
    );
  }

  private toPersistence(order: Order): PersistedOrder {
    return {
      id: order.id.value,
      customerId: order.customerId.value,
      items: order.getItems().map((item) => ({
        id: item.id,
        productId: item.productId.value,
        productName: item.productName,
        unitPrice: { amount: item.unitPrice.amount, currency: item.unitPrice.currency },
        quantity: item.quantity.value,
      })),
      status: order.status,
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    };
  }
}