import { Entity, DomainError } from '@shared/kernel';
import { Money, Quantity } from '@domain/order';
import { ProductId } from '@domain/product';
import { v4 as uuidv4 } from 'uuid';

interface OrderItemProps {
  id: string;
  productId: ProductId;
  productName: string;
  unitPrice: Money;
  quantity: Quantity;
}

export class OrderItem extends Entity<string> {
  private readonly _productId: ProductId;
  private readonly _productName: string;
  private readonly _unitPrice: Money;
  private readonly _quantity: Quantity;

  private constructor(props: OrderItemProps) {
    super(props.id);
    this._productId = props.productId;
    this._productName = props.productName;
    this._unitPrice = props.unitPrice;
    this._quantity = props.quantity;
  }

  get productId(): ProductId {
    return this._productId;
  }

  get productName(): string {
    return this._productName;
  }

  get unitPrice(): Money {
    return this._unitPrice;
  }

  get quantity(): Quantity {
    return this._quantity;
  }

  static create(
    productId: ProductId,
    productName: string,
    unitPrice: Money,
    quantity: Quantity
  ): OrderItem {
    if (!productName || productName.trim() === '') {
      throw new DomainError('INVALID_ORDER_ITEM', 'Product name snapshot cannot be empty');
    }
    if (unitPrice.amount <= 0) {
      throw new DomainError('INVALID_ORDER_ITEM', 'Unit price must be greater than zero');
    }

    return new OrderItem({
      id: uuidv4(),
      productId,
      productName: productName.trim(),
      unitPrice,
      quantity,
    });
  }

  subtotal(): Money {
    return this._unitPrice.multiply(this._quantity.value);
  }

  changeQuantity(newQuantity: Quantity): OrderItem {
    return new OrderItem({
      id: this.id,
      productId: this._productId,
      productName: this._productName,
      unitPrice: this._unitPrice,
      quantity: newQuantity,
    });
  }

  static reconstruct(
    id: string,
    productId: ProductId,
    productName: string,
    unitPrice: Money,
    quantity: Quantity
  ): OrderItem {
    return new OrderItem({
      id,
      productId,
      productName,
      unitPrice,
      quantity,
    });
  }
}