import { CancelOrderUseCase } from '@application/order/use-cases/CancelOrderUseCase'
import { InMemoryOrderRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { ConsoleEventPublisher } from '@infrastructure/adapters/out/events/ConsoleEventPublisher'
import { Order, Money, Quantity, OrderStatus } from '@domain/order'
import { Product, ProductId, ProductCategory } from '@domain/product'
import { CustomerId } from '@domain/customer'
import { DomainError } from '@shared/kernel'

describe('CancelOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let eventPublisher: ConsoleEventPublisher
  let useCase: CancelOrderUseCase

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository()
    eventPublisher = new ConsoleEventPublisher()
    useCase = new CancelOrderUseCase(orderRepository, eventPublisher)
  })

  it('cancels order -> status becomes CANCELLED', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    await orderRepository.save(order)

    const input = { id: order.id.value, reason: 'Customer requested' }
    const cancelledOrder = await useCase.execute(input)

    expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED)
    expect(cancelledOrder.id.value).toBe(order.id.value)
  })

  it('throws ORDER_NOT_FOUND if order does not exist', async () => {
    const input = { id: 'non-existent-id' }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('ORDER_NOT_FOUND')
    }
  })

  it('throws INVALID_ORDER_STATE if order already DELIVERED', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    order.confirm()
    order.advanceStatus(OrderStatus.IN_PREPARATION)
    order.advanceStatus(OrderStatus.READY)
    order.advanceStatus(OrderStatus.DELIVERED)
    await orderRepository.save(order)

    const input = { id: order.id.value }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
    }
  })

  it('throws INVALID_ORDER_STATE if order already CANCELLED', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    order.cancel()
    await orderRepository.save(order)

    const input = { id: order.id.value }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
    }
  })

  it('saves cancelled order to repository', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    await orderRepository.save(order)

    const input = { id: order.id.value }
    await useCase.execute(input)

    const savedOrder = await orderRepository.findById(order.id)
    expect(savedOrder).not.toBeNull()
    expect(savedOrder!.status).toBe(OrderStatus.CANCELLED)
  })

  it('cancels order without reason', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    await orderRepository.save(order)

    const input = { id: order.id.value }
    const cancelledOrder = await useCase.execute(input)

    expect(cancelledOrder.status).toBe(OrderStatus.CANCELLED)
  })
})