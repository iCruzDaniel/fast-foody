import { ProductRepositoryPort, Product, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';
import { DomainError } from '@shared/kernel';

export interface ListProductsInput {
  category?: ProductCategoryType;
  onlyAvailable?: boolean;
}

export class ListProductsUseCase {
  constructor(private readonly productRepository: ProductRepositoryPort) {}

  async execute(input: ListProductsInput = {}): Promise<Product[]> {
    if (input.category && !isValidProductCategory(input.category)) {
      throw new DomainError('INVALID_PRODUCT_CATEGORY', 'Invalid product category');
    }

    const filters: { category?: ProductCategoryType; onlyAvailable?: boolean } = {};
    if (input.category) {
      filters.category = input.category;
    }
    if (input.onlyAvailable !== undefined) {
      filters.onlyAvailable = input.onlyAvailable;
    }

    return this.productRepository.findAll(filters);
  }
}

function isValidProductCategory(value: string): value is ProductCategoryType {
  return Object.values(ProductCategory).includes(value as ProductCategoryType);
}