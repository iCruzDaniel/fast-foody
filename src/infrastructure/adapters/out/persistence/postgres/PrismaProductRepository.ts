import { ProductRepositoryPort, Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';
import { Money } from '@domain/order';
import { prisma } from './prismaClient';

type PrismaProduct = NonNullable<Awaited<ReturnType<typeof prisma.product.findUnique>>>;

export class PrismaProductRepository implements ProductRepositoryPort {
  async save(product: Product): Promise<void> {
    const data = this.toPersistence(product);

    await prisma.product.upsert({
      where: { id: product.id.value },
      create: data,
      update: data,
    });
  }

  async findById(id: ProductId): Promise<Product | null> {
    const prismaProduct = await prisma.product.findUnique({
      where: { id: id.value },
    });

    if (!prismaProduct) {
      return null;
    }

    return this.toDomain(prismaProduct);
  }

  async findAll(filters?: { category?: ProductCategoryType; onlyAvailable?: boolean }): Promise<Product[]> {
    const prismaProducts = await prisma.product.findMany({
      where: {
        ...(filters?.category && { category: filters.category }),
        ...(filters?.onlyAvailable && { available: true }),
      },
      orderBy: { name: 'asc' },
    });

    return prismaProducts.map((product) => this.toDomain(product));
  }

  private toDomain(prismaProduct: PrismaProduct): Product {
    return Product.reconstruct(
      ProductId.fromString(prismaProduct.id),
      prismaProduct.name,
      prismaProduct.description,
      Money.create(prismaProduct.price, prismaProduct.currency),
      prismaProduct.category as ProductCategoryType,
      prismaProduct.available,
      prismaProduct.imageUrl
    );
  }

  private toPersistence(product: Product) {
    return {
      id: product.id.value,
      name: product.name,
      description: product.description,
      price: product.price.amount,
      currency: product.price.currency,
      category: product.category,
      available: product.available,
      imageUrl: product.imageUrl,
    };
  }
}