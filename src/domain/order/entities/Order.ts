import { AggregateRoot, DomainError, DomainEvent } from '@shared/kernel';
import { OrderId, OrderItem, OrderStatus, type OrderStatus as OrderStatusType, Money, Quantity, OrderCreated, OrderConfirmed, OrderStatusChanged, OrderCancelled, canTransitionTo, isTerminalStatus } from '@domain/order';
import { CustomerId } from '@domain/customer';
import { Product } from '@domain/product';

interface OrderProps {
  id: OrderId;
  customerId: CustomerId;
  items: OrderItem[];
  status: OrderStatusType;
  createdAt: Date;
  updatedAt: Date;
}

export class Order extends AggregateRoot<OrderId> {
  private readonly _customerId: CustomerId;
  private _items: OrderItem[];
  private _status: OrderStatusType;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: OrderProps) {
    super(props.id);
    this._customerId = props.customerId;
    this._items = [...props.items];
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get customerId(): CustomerId {
    return this._customerId;
  }

  getItems(): ReadonlyArray<OrderItem> {
    return [...this._items];
  }

  get status(): OrderStatusType {
    return this._status;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(customerId: CustomerId): Order {
    const now = new Date();
    const order = new Order({
      id: OrderId.create(),
      customerId,
      items: [],
      status: OrderStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    });
    order.addDomainEvent(new OrderCreated(order.id, customerId));
    return order;
  }

  addItem(product: Product, quantity: Quantity): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new DomainError('INVALID_ORDER_STATE', 'Cannot add items to a non-pending order');
    }
    if (!product.available) {
      throw new DomainError('PRODUCT_NOT_AVAILABLE', 'Product is not available');
    }

    const existingItem = this._items.find((item) => item.productId.equals(product.id));
    if (existingItem) {
      const newQuantity = Quantity.create(existingItem.quantity.value + quantity.value);
      this._items = this._items.map((item) =>
        item.id === existingItem.id ? item.changeQuantity(newQuantity) : item
      );
    } else {
      const newItem = OrderItem.create(product.id, product.name, product.price, quantity);
      this._items.push(newItem);
    }
    this._updatedAt = new Date();
  }

  removeItem(orderItemId: string): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new DomainError('INVALID_ORDER_STATE', 'Cannot remove items from a non-pending order');
    }
    const itemIndex = this._items.findIndex((item) => item.id === orderItemId);
    if (itemIndex === -1) {
      throw new DomainError('ORDER_ITEM_NOT_FOUND', 'Order item not found');
    }
    this._items.splice(itemIndex, 1);
    this._updatedAt = new Date();
  }

  changeItemQuantity(orderItemId: string, quantity: Quantity): void {
    if (this._status !== OrderStatus.PENDING) {
      throw new DomainError('INVALID_ORDER_STATE', 'Cannot change item quantity in a non-pending order');
    }
    const itemIndex = this._items.findIndex((item) => item.id === orderItemId);
    if (itemIndex === -1) {
      throw new DomainError('ORDER_ITEM_NOT_FOUND', 'Order item not found');
    }
    const item = this._items[itemIndex];
    if (!item) {
      throw new DomainError('ORDER_ITEM_NOT_FOUND', 'Order item not found');
    }
    this._items[itemIndex] = item.changeQuantity(quantity);
    this._updatedAt = new Date();
  }

  calculateTotal(): Money {
    if (this._items.length === 0) {
      return Money.create(0);
    }
    return this._items.reduce((total, item) => total.add(item.subtotal()), Money.create(0));
  }

  confirm(): void {
    if (this._items.length === 0) {
      throw new DomainError('EMPTY_ORDER', 'Cannot confirm an order with no items');
    }
    this.advanceStatus(OrderStatus.CONFIRMED);
    this.addDomainEvent(new OrderConfirmed(this.id, this.calculateTotal()));
  }

  advanceStatus(newStatus: OrderStatusType): void {
    if (!canTransitionTo(this._status, newStatus)) {
      throw new DomainError(
        'INVALID_STATUS_TRANSITION',
        `Cannot transition from ${this._status} to ${newStatus}`
      );
    }
    const fromStatus = this._status;
    this._status = newStatus;
    this._updatedAt = new Date();
    this.addDomainEvent(new OrderStatusChanged(this.id, fromStatus, newStatus));
  }

  cancel(reason?: string): void {
    if (this._status === OrderStatus.DELIVERED) {
      throw new DomainError('INVALID_ORDER_STATE', 'Cannot cancel a delivered order');
    }
    if (isTerminalStatus(this._status)) {
      throw new DomainError('INVALID_ORDER_STATE', `Order is already in terminal state: ${this._status}`);
    }
    this._status = OrderStatus.CANCELLED;
    this._updatedAt = new Date();
    this.addDomainEvent(new OrderCancelled(this.id, reason));
  }

  static reconstruct(
    id: OrderId,
    customerId: CustomerId,
    items: OrderItem[],
    status: OrderStatusType,
    createdAt: Date,
    updatedAt: Date
  ): Order {
    return new Order({
      id,
      customerId,
      items,
      status,
      createdAt,
      updatedAt,
    });
  }
}