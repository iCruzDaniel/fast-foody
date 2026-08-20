import { OrderRepositoryPort, Order, OrderItem, OrderId, OrderStatus, type OrderStatus as OrderStatusType, Money, Quantity } from '@domain/order';
import { ProductId } from '@domain/product';
import { CustomerId } from '@domain/customer';
import { prisma } from './prismaClient';

type PrismaOrderWithItems = Awaited<ReturnType<typeof prisma.order.findUnique>> & {
  items: Awaited<ReturnType<typeof prisma.orderItem.findMany>>;
};

export class PrismaOrderRepository implements OrderRepositoryPort {
  async save(order: Order): Promise<void> {
    const data = this.toPersistence(order);

    await prisma.order.upsert({
      where: { id: order.id.value },
      create: data,
      update: data,
    });
  }

  async findById(id: OrderId): Promise<Order | null> {
    const prismaOrder = await prisma.order.findUnique({
      where: { id: id.value },
      include: { items: true },
    });

    if (!prismaOrder) {
      return null;
    }

    return this.toDomain(prismaOrder as PrismaOrderWithItems);
  }

  async findAll(filters?: { status?: OrderStatusType }): Promise<Order[]> {
    const where = filters?.status ? { status: filters.status } : {};

    const prismaOrders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });

    return prismaOrders.map((order) => this.toDomain(order as PrismaOrderWithItems));
  }

  private toDomain(prismaOrder: PrismaOrderWithItems): Order {
    const items = prismaOrder.items.map((item) =>
      OrderItem.reconstruct(
        item.id,
        ProductId.fromString(item.productId),
        item.productName,
        Money.create(item.unitPrice, item.currency),
        Quantity.create(item.quantity)
      )
    );

    return Order.reconstruct(
      OrderId.fromString(prismaOrder.id),
      CustomerId.fromString(prismaOrder.customerId),
      items,
      prismaOrder.status as OrderStatusType,
      prismaOrder.createdAt,
      prismaOrder.updatedAt
    );
  }

  private toPersistence(order: Order) {
    return {
      id: order.id.value,
      customerId: order.customerId.value,
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      items: {
        deleteMany: {},
        create: order.getItems().map((item) => ({
          id: item.id,
          productId: item.productId.value,
          productName: item.productName,
          unitPrice: item.unitPrice.amount,
          currency: item.unitPrice.currency,
          quantity: item.quantity.value,
        })),
      },
    };
  }
}