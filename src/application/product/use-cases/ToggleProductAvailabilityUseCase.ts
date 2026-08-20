import { ProductRepositoryPort, Product, ProductId } from '@domain/product';
import { DomainError } from '@shared/kernel';

export interface ToggleProductAvailabilityInput {
  id: string;
}

export class ToggleProductAvailabilityUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(input: ToggleProductAvailabilityInput): Promise<Product> {
    const productId = ProductId.fromString(input.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new DomainError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    const updatedProduct = product.available
      ? product.markUnavailable()
      : product.markAvailable();

    await this.productRepository.save(updatedProduct);
    return updatedProduct;
  }
}