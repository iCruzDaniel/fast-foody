import { OrderRepositoryPort, EventPublisherPort, Order, OrderId, Quantity, OrderCompositionService } from '@domain/order';
import { DomainError } from '@shared/kernel';
import { ProductRepositoryPort, ProductId } from '@domain/product';
import { CustomerRepositoryPort, CustomerId } from '@domain/customer';

export interface CreateOrderInput {
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepository: OrderRepositoryPort,
    private readonly productRepository: ProductRepositoryPort,
    private readonly customerRepository: CustomerRepositoryPort,
    private readonly eventPublisher: EventPublisherPort,
    private readonly orderCompositionService: OrderCompositionService
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    const customerId = CustomerId.fromString(input.customerId);

    const customer = await this.customerRepository.findById(customerId);
    if (!customer) {
      throw new DomainError('CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    const order = Order.create(customerId);

    for (const item of input.items) {
      const productId = ProductId.fromString(item.productId);
      const product = await this.productRepository.findById(productId);

      if (!product) {
        throw new DomainError('PRODUCT_NOT_FOUND', `Product with id ${item.productId} not found`);
      }

      const quantity = Quantity.create(item.quantity);
      this.orderCompositionService.addProductToOrder(order, product, quantity);
    }

    await this.orderRepository.save(order);

    const events = order.pullDomainEvents();
    for (const event of events) {
      await this.eventPublisher.publish(event);
    }

    return order;
  }
}