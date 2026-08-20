import { Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';

export interface ProductRepositoryPort {
  save(product: Product): Promise<void>;
  findById(id: ProductId): Promise<Product | null>;
  findAll(filters?: { category?: ProductCategoryType; onlyAvailable?: boolean }): Promise<Product[]>;
}