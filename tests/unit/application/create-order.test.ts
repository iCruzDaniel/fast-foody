import { CreateOrderUseCase } from '@application/order/use-cases/CreateOrderUseCase'
import { InMemoryOrderRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { InMemoryProductRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryProductRepository'
import { InMemoryCustomerRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryCustomerRepository'
import { ConsoleEventPublisher } from '@infrastructure/adapters/out/events/ConsoleEventPublisher'
import { Money, OrderCompositionService } from '@domain/order'
import { Product, ProductId, ProductCategory } from '@domain/product'
import { Customer, CustomerId } from '@domain/customer'
import { DomainError } from '@shared/kernel'

describe('CreateOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let productRepository: InMemoryProductRepository
  let customerRepository: InMemoryCustomerRepository
  let eventPublisher: ConsoleEventPublisher
  let orderCompositionService: OrderCompositionService
  let useCase: CreateOrderUseCase

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository()
    productRepository = new InMemoryProductRepository()
    customerRepository = new InMemoryCustomerRepository()
    eventPublisher = new ConsoleEventPublisher()
    orderCompositionService = new OrderCompositionService()
    useCase = new CreateOrderUseCase(
      orderRepository,
      productRepository,
      customerRepository,
      eventPublisher,
      orderCompositionService
    )
  })

  it('creates order with valid customer and items', async () => {
    const customerId = CustomerId.create()
    const customer = Customer.create(customerId, 'John Doe', '+1234567890')
    await customerRepository.save(customer)

    const productId = ProductId.create()
    const product = Product.create(productId, 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    await productRepository.save(product)

    const input = {
      customerId: customerId.value,
      items: [{ productId: productId.value, quantity: 2 }],
    }

    const order = await useCase.execute(input)

    expect(order.customerId.value).toBe(customerId.value)
    expect(order.status).toBe('PENDING')
    expect(order.getItems()).toHaveLength(1)
    expect(order.getItems()[0].productId.value).toBe(productId.value)
    expect(order.getItems()[0].quantity.value).toBe(2)

    const savedOrder = await orderRepository.findById(order.id)
    expect(savedOrder).not.toBeNull()
  })

  it('saves order to InMemoryOrderRepository', async () => {
    const customerId = CustomerId.create()
    const customer = Customer.create(customerId, 'John Doe', '+1234567890')
    await customerRepository.save(customer)

    const productId = ProductId.create()
    const product = Product.create(productId, 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    await productRepository.save(product)

    const input = {
      customerId: customerId.value,
      items: [{ productId: productId.value, quantity: 2 }],
    }

    const order = await useCase.execute(input)

    const savedOrder = await orderRepository.findById(order.id)
    expect(savedOrder).not.toBeNull()
    expect(savedOrder!.id.value).toBe(order.id.value)
  })

  it('throws PRODUCT_NOT_FOUND if product does not exist', async () => {
    const customerId = CustomerId.create()
    const customer = Customer.create(customerId, 'John Doe', '+1234567890')
    await customerRepository.save(customer)

    const input = {
      customerId: customerId.value,
      items: [{ productId: 'non-existent-id', quantity: 2 }],
    }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('PRODUCT_NOT_FOUND')
    }
  })

  it('throws PRODUCT_NOT_AVAILABLE if product unavailable', async () => {
    const customerId = CustomerId.create()
    const customer = Customer.create(customerId, 'John Doe', '+1234567890')
    await customerRepository.save(customer)

    const productId = ProductId.create()
    const product = Product.create(productId, 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, false)
    await productRepository.save(product)

    const input = {
      customerId: customerId.value,
      items: [{ productId: productId.value, quantity: 2 }],
    }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('PRODUCT_NOT_AVAILABLE')
    }
  })

  it('throws CUSTOMER_NOT_FOUND if customer does not exist', async () => {
    const productId = ProductId.create()
    const product = Product.create(productId, 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    await productRepository.save(product)

    const input = {
      customerId: 'non-existent-customer-id',
      items: [{ productId: productId.value, quantity: 2 }],
    }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('CUSTOMER_NOT_FOUND')
    }
  })

  it('creates order with multiple items', async () => {
    const customerId = CustomerId.create()
    const customer = Customer.create(customerId, 'John Doe', '+1234567890')
    await customerRepository.save(customer)

    const productId1 = ProductId.create()
    const product1 = Product.create(productId1, 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    await productRepository.save(product1)

    const productId2 = ProductId.create()
    const product2 = Product.create(productId2, 'Fries', 'Tasty fries', Money.create(5000, 'COP'), ProductCategory.SIDES, true)
    await productRepository.save(product2)

    const input = {
      customerId: customerId.value,
      items: [
        { productId: productId1.value, quantity: 2 },
        { productId: productId2.value, quantity: 3 },
      ],
    }

    const order = await useCase.execute(input)

    expect(order.getItems()).toHaveLength(2)
    expect(order.calculateTotal().amount).toBe(35000) // 2*10000 + 3*5000
  })
})