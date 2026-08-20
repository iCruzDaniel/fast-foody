import { ProductRepositoryPort, Product, ProductId } from '@domain/product';
import { Money } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface UpdateProductPriceInput {
  id: string;
  price: number;
  currency?: string;
}

export class UpdateProductPriceUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(input: UpdateProductPriceInput): Promise<Product> {
    const productId = ProductId.fromString(input.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new DomainError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    const newPrice = Money.create(input.price, input.currency ?? 'COP');
    const updatedProduct = product.changePrice(newPrice);

    await this.productRepository.save(updatedProduct);
    return updatedProduct;
  }
}