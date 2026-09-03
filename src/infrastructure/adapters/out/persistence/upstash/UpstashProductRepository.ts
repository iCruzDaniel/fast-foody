import { Redis } from '@upstash/redis';
import { ProductRepositoryPort, Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';
import { Money } from '@domain/order';

interface PersistedProduct {
  id: string;
  name: string;
  description: string;
  price: { amount: number; currency: string };
  category: ProductCategoryType;
  available: boolean;
  imageUrl: string;
}

export class UpstashProductRepository implements ProductRepositoryPort {
  private readonly redis: Redis;
  private static readonly NAMESPACE = 'fast-foodiy';
  private readonly productKeyPrefix = `${UpstashProductRepository.NAMESPACE}:product:`;
  private readonly productsIndexKey = `${UpstashProductRepository.NAMESPACE}:products:index`;
  private readonly productsCategoryPrefix = `${UpstashProductRepository.NAMESPACE}:products:category:`;
  private readonly productsAvailableKey = `${UpstashProductRepository.NAMESPACE}:products:available`;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async save(product: Product): Promise<void> {
    const persistedProduct = this.toPersistence(product);
    const productKey = `${this.productKeyPrefix}${product.id.value}`;

    await this.redis.set(productKey, persistedProduct);
    await this.redis.sadd(this.productsIndexKey, product.id.value);
    await this.redis.sadd(`${this.productsCategoryPrefix}${product.category}`, product.id.value);

    if (product.available) {
      await this.redis.sadd(this.productsAvailableKey, product.id.value);
    } else {
      await this.redis.srem(this.productsAvailableKey, product.id.value);
    }
  }

  async findById(id: ProductId): Promise<Product | null> {
    const productKey = `${this.productKeyPrefix}${id.value}`;
    const persistedProduct = await this.redis.get<PersistedProduct>(productKey);

    if (!persistedProduct) {
      return null;
    }

    return this.toDomain(persistedProduct);
  }

  async findAll(filters?: { category?: ProductCategoryType; onlyAvailable?: boolean }): Promise<Product[]> {
    let productIds: string[];

    if (filters?.category && filters?.onlyAvailable) {
      const categoryIds = (await this.redis.smembers(`${this.productsCategoryPrefix}${filters.category}`)) as string[];
      const availableIds = (await this.redis.smembers(this.productsAvailableKey)) as string[];
      const availableSet = new Set(availableIds);
      productIds = categoryIds.filter((id: string) => availableSet.has(id));
    } else if (filters?.category) {
      productIds = (await this.redis.smembers(`${this.productsCategoryPrefix}${filters.category}`)) as string[];
    } else if (filters?.onlyAvailable) {
      productIds = (await this.redis.smembers(this.productsAvailableKey)) as string[];
    } else {
      productIds = (await this.redis.smembers(this.productsIndexKey)) as string[];
    }

    if (productIds.length === 0) {
      return [];
    }

    const products: Product[] = [];
    for (const productId of productIds) {
      const productKey = `${this.productKeyPrefix}${productId}`;
      const persistedProduct = await this.redis.get<PersistedProduct>(productKey);
      if (persistedProduct) {
        products.push(this.toDomain(persistedProduct));
      }
    }

    return products;
  }

  private toDomain(persistedProduct: PersistedProduct): Product {
    return Product.reconstruct(
      ProductId.fromString(persistedProduct.id),
      persistedProduct.name,
      persistedProduct.description,
      Money.create(persistedProduct.price.amount, persistedProduct.price.currency),
      persistedProduct.category,
      persistedProduct.available,
      persistedProduct.imageUrl
    );
  }

  private toPersistence(product: Product): PersistedProduct {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      price: { amount: product.price.amount, currency: product.price.currency },
      category: product.category,
      available: product.available,
      imageUrl: product.imageUrl,
    };
  }
}