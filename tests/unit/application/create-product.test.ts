import { CreateProductUseCase } from '@application/product/use-cases/CreateProductUseCase'
import { InMemoryProductRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryProductRepository'
import { ProductCategory } from '@domain/product'
import { DomainError } from '@shared/kernel'

describe('CreateProductUseCase', () => {
  let productRepository: InMemoryProductRepository
  let useCase: CreateProductUseCase

  beforeEach(() => {
    productRepository = new InMemoryProductRepository()
    useCase = new CreateProductUseCase(productRepository)
  })

  it('creates product and saves to InMemoryProductRepository', async () => {
    const input = {
      name: 'Burger',
      description: 'Delicious burger',
      price: 10000,
      currency: 'COP',
      category: ProductCategory.BURGERS,
      available: true,
    }

    const product = await useCase.execute(input)

    expect(product.name).toBe('Burger')
    expect(product.description).toBe('Delicious burger')
    expect(product.price.amount).toBe(10000)
    expect(product.price.currency).toBe('COP')
    expect(product.category).toBe(ProductCategory.BURGERS)
    expect(product.available).toBe(true)

    const savedProduct = await productRepository.findById(product.id)
    expect(savedProduct).not.toBeNull()
    expect(savedProduct!.name).toBe('Burger')
  })

  it('returns product with correct name, price, category', async () => {
    const input = {
      name: 'Cheese Burger',
      description: 'With extra cheese',
      price: 15000,
      currency: 'USD',
      category: ProductCategory.BURGERS,
      available: false,
    }

    const product = await useCase.execute(input)

    expect(product.name).toBe('Cheese Burger')
    expect(product.price.amount).toBe(15000)
    expect(product.price.currency).toBe('USD')
    expect(product.category).toBe(ProductCategory.BURGERS)
    expect(product.available).toBe(false)
  })

  it('uses default currency COP when not provided', async () => {
    const input = {
      name: 'Burger',
      description: 'Delicious burger',
      price: 10000,
      category: ProductCategory.BURGERS,
    }

    const product = await useCase.execute(input)

    expect(product.price.currency).toBe('COP')
  })

  it('uses default available true when not provided', async () => {
    const input = {
      name: 'Burger',
      description: 'Delicious burger',
      price: 10000,
      category: ProductCategory.BURGERS,
    }

    const product = await useCase.execute(input)

    expect(product.available).toBe(true)
  })

  it('throws INVALID_PRODUCT_CATEGORY for invalid category', async () => {
    const input = {
      name: 'Burger',
      description: 'Delicious burger',
      price: 10000,
      category: 'INVALID_CATEGORY' as any,
    }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('INVALID_PRODUCT_CATEGORY')
    }
  })
})