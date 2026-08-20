import { ConfirmOrderUseCase } from '@application/order/use-cases/ConfirmOrderUseCase'
import { InMemoryOrderRepository } from '@infrastructure/adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { ConsoleEventPublisher } from '@infrastructure/adapters/out/events/ConsoleEventPublisher'
import { Order, Money, Quantity, OrderStatus } from '@domain/order'
import { Product, ProductId, ProductCategory } from '@domain/product'
import { CustomerId } from '@domain/customer'
import { DomainError } from '@shared/kernel'

describe('ConfirmOrderUseCase', () => {
  let orderRepository: InMemoryOrderRepository
  let eventPublisher: ConsoleEventPublisher
  let useCase: ConfirmOrderUseCase

  beforeEach(() => {
    orderRepository = new InMemoryOrderRepository()
    eventPublisher = new ConsoleEventPublisher()
    useCase = new ConfirmOrderUseCase(orderRepository, eventPublisher)
  })

  it('confirms order with items -> status becomes CONFIRMED', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    await orderRepository.save(order)

    const input = { id: order.id.value }
    const confirmedOrder = await useCase.execute(input)

    expect(confirmedOrder.status).toBe(OrderStatus.CONFIRMED)
    expect(confirmedOrder.id.value).toBe(order.id.value)
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

  it('throws EMPTY_ORDER if order has no items', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    await orderRepository.save(order)

    const input = { id: order.id.value }

    await expect(useCase.execute(input)).rejects.toThrow(DomainError)
    try {
      await useCase.execute(input)
    } catch (e) {
      expect((e as DomainError).code).toBe('EMPTY_ORDER')
    }
  })

  it('saves confirmed order to repository', async () => {
    const customerId = CustomerId.create()
    const order = Order.create(customerId)
    const product = Product.create(ProductId.create(), 'Burger', 'Delicious burger', Money.create(10000, 'COP'), ProductCategory.BURGERS, true)
    order.addItem(product, Quantity.create(2))
    await orderRepository.save(order)

    const input = { id: order.id.value }
    await useCase.execute(input)

    const savedOrder = await orderRepository.findById(order.id)
    expect(savedOrder).not.toBeNull()
    expect(savedOrder!.status).toBe(OrderStatus.CONFIRMED)
  })
})