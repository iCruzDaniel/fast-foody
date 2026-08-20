import { ProductRepositoryPort, Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';

export class InMemoryProductRepository implements ProductRepositoryPort {
  private readonly store: Map<string, Product> = new Map();

  async save(product: Product): Promise<void> {
    this.store.set(product.id.value, product);
  }

  async findById(id: ProductId): Promise<Product | null> {
    const product = this.store.get(id.value);
    return product ?? null;
  }

  async findAll(filters?: { category?: ProductCategoryType; onlyAvailable?: boolean }): Promise<Product[]> {
    const products = Array.from(this.store.values());

    if (!filters) {
      return products;
    }

    return products.filter((product) => {
      if (filters.category && product.category !== filters.category) {
        return false;
      }
      if (filters.onlyAvailable && !product.available) {
        return false;
      }
      return true;
    });
  }
}