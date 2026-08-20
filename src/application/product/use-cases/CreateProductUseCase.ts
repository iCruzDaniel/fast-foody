import { ProductRepositoryPort, Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';
import { Money } from '@domain/order';
import { DomainError } from '@shared/kernel';

export interface CreateProductInput {
  name: string;
  description?: string;
  price: number;
  currency?: string;
  category: ProductCategoryType;
  available?: boolean;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(input: CreateProductInput): Promise<Product> {
    const productId = ProductId.create();
    const price = Money.create(input.price, input.currency ?? 'COP');

    if (!isValidProductCategory(input.category)) {
      throw new DomainError('INVALID_PRODUCT_CATEGORY', 'Invalid product category');
    }

    const product = Product.create(
      productId,
      input.name,
      input.description ?? '',
      price,
      input.category,
      input.available ?? true
    );

    await this.productRepository.save(product);
    return product;
  }
}

function isValidProductCategory(value: string): value is ProductCategoryType {
  return Object.values(ProductCategory).includes(value as ProductCategoryType);
}