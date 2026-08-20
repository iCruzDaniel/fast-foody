import { ProductRepositoryPort, Product, ProductId } from '@domain/product';
import { DomainError } from '@shared/kernel';

export interface GetProductByIdInput {
  id: string;
}

export class GetProductByIdUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(input: GetProductByIdInput): Promise<Product> {
    const productId = ProductId.fromString(input.id);
    const product = await this.productRepository.findById(productId);

    if (!product) {
      throw new DomainError('PRODUCT_NOT_FOUND', 'Product not found');
    }

    return product;
  }
}