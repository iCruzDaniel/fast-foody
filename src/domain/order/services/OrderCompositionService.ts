import { Order, Quantity } from '@domain/order';
import { Product } from '@domain/product';
import { DomainError } from '@shared/kernel';

export class OrderCompositionService {
  addProductToOrder(order: Order, product: Product, quantity: Quantity): void {
    if (!product.available) {
      throw new DomainError('PRODUCT_NOT_AVAILABLE', 'Product is not available');
    }
    order.addItem(product, quantity);
  }
}