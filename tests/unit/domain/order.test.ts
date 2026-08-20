import { Order, OrderItem, OrderStatus, Money, Quantity, OrderCreated, OrderConfirmed, OrderStatusChanged, OrderCancelled } from '@domain/order'
import { Product, ProductId, ProductCategory } from '@domain/product'
import { CustomerId } from '@domain/customer'
import { DomainError } from '@shared/kernel'

describe('Order', () => {
  const customerId = CustomerId.create()
  const productId = ProductId.create()
  const price = Money.create(10000, 'COP')
  const product = Product.create(productId, 'Burger', 'Delicious burger', price, ProductCategory.BURGERS, true)
  const quantity = Quantity.create(2)

  describe('create', () => {
    it('starts in PENDING with empty items', () => {
      const order = Order.create(customerId)

      expect(order.status).toBe(OrderStatus.PENDING)
      expect(order.getItems()).toHaveLength(0)
      expect(order.customerId).toBe(customerId)
    })

    it('emits OrderCreated event', () => {
      const order = Order.create(customerId)
      const events = order.pullDomainEvents()

      expect(events).toHaveLength(1)
      expect(events[0]).toBeInstanceOf(OrderCreated)
      expect((events[0] as OrderCreated).orderId).toBe(order.id)
      expect((events[0] as OrderCreated).customerId).toBe(customerId)
    })
  })

  describe('addItem', () => {
    it('adds an item to pending order', () => {
      const order = Order.create(customerId)

      order.addItem(product, quantity)

      const items = order.getItems()
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe(productId)
      expect(items[0].productName).toBe('Burger')
      expect(items[0].unitPrice.amount).toBe(10000)
      expect(items[0].quantity.value).toBe(2)
    })

    it('throws INVALID_ORDER_STATE if order not PENDING', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      order.confirm()

      expect(() => order.addItem(product, quantity)).toThrow(DomainError)
      try {
        order.addItem(product, quantity)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
      }
    })

    it('throws PRODUCT_NOT_AVAILABLE if product unavailable', () => {
      const order = Order.create(customerId)
      const unavailableProduct = product.markUnavailable()

      expect(() => order.addItem(unavailableProduct, quantity)).toThrow(DomainError)
      try {
        order.addItem(unavailableProduct, quantity)
      } catch (e) {
        expect((e as DomainError).code).toBe('PRODUCT_NOT_AVAILABLE')
      }
    })

    it('increments quantity if same product added twice', () => {
      const order = Order.create(customerId)

      order.addItem(product, Quantity.create(2))
      order.addItem(product, Quantity.create(3))

      const items = order.getItems()
      expect(items).toHaveLength(1)
      expect(items[0].quantity.value).toBe(5)
    })
  })

  describe('removeItem', () => {
    it('removes an item from pending order', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      const itemId = order.getItems()[0].id

      order.removeItem(itemId)

      expect(order.getItems()).toHaveLength(0)
    })

    it('throws INVALID_ORDER_STATE if order not PENDING', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      const itemId = order.getItems()[0].id
      order.confirm()

      expect(() => order.removeItem(itemId)).toThrow(DomainError)
      try {
        order.removeItem(itemId)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
      }
    })

    it('throws ORDER_ITEM_NOT_FOUND if item does not exist', () => {
      const order = Order.create(customerId)

      expect(() => order.removeItem('non-existent-id')).toThrow(DomainError)
      try {
        order.removeItem('non-existent-id')
      } catch (e) {
        expect((e as DomainError).code).toBe('ORDER_ITEM_NOT_FOUND')
      }
    })
  })

  describe('changeItemQuantity', () => {
    it('changes quantity of pending order item', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      const itemId = order.getItems()[0].id

      order.changeItemQuantity(itemId, Quantity.create(5))

      expect(order.getItems()[0].quantity.value).toBe(5)
    })

    it('throws INVALID_ORDER_STATE if order not PENDING', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      const itemId = order.getItems()[0].id
      order.confirm()

      expect(() => order.changeItemQuantity(itemId, Quantity.create(5))).toThrow(DomainError)
      try {
        order.changeItemQuantity(itemId, Quantity.create(5))
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
      }
    })

    it('throws ORDER_ITEM_NOT_FOUND if item does not exist', () => {
      const order = Order.create(customerId)

      expect(() => order.changeItemQuantity('non-existent-id', Quantity.create(5))).toThrow(DomainError)
      try {
        order.changeItemQuantity('non-existent-id', Quantity.create(5))
      } catch (e) {
        expect((e as DomainError).code).toBe('ORDER_ITEM_NOT_FOUND')
      }
    })
  })

  describe('confirm', () => {
    it('throws EMPTY_ORDER if no items', () => {
      const order = Order.create(customerId)

      expect(() => order.confirm()).toThrow(DomainError)
      try {
        order.confirm()
      } catch (e) {
        expect((e as DomainError).code).toBe('EMPTY_ORDER')
      }
    })

    it('transitions to CONFIRMED and emits OrderConfirmed event', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      order.confirm()

      expect(order.status).toBe(OrderStatus.CONFIRMED)
      const events = order.pullDomainEvents()
      expect(events).toHaveLength(3) // OrderCreated, OrderStatusChanged, OrderConfirmed
      expect(events[1]).toBeInstanceOf(OrderStatusChanged)
      expect(events[2]).toBeInstanceOf(OrderConfirmed)
      expect((events[2] as OrderConfirmed).total.amount).toBe(20000)
    })
  })

  describe('advanceStatus', () => {
    it('transitions correctly PENDING to CONFIRMED', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      order.advanceStatus(OrderStatus.CONFIRMED)

      expect(order.status).toBe(OrderStatus.CONFIRMED)
    })

    it('throws INVALID_STATUS_TRANSITION on invalid transition', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      expect(() => order.advanceStatus(OrderStatus.IN_PREPARATION)).toThrow(DomainError)
      try {
        order.advanceStatus(OrderStatus.IN_PREPARATION)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_STATUS_TRANSITION')
      }
    })

    it('emits OrderStatusChanged event', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      order.advanceStatus(OrderStatus.CONFIRMED)

      const events = order.pullDomainEvents()
      expect(events).toHaveLength(2) // OrderCreated + OrderStatusChanged
      expect(events[1]).toBeInstanceOf(OrderStatusChanged)
      expect((events[1] as OrderStatusChanged).fromStatus).toBe(OrderStatus.PENDING)
      expect((events[1] as OrderStatusChanged).toStatus).toBe(OrderStatus.CONFIRMED)
    })
  })

  describe('cancel', () => {
    it('transitions to CANCELLED and emits OrderCancelled event', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      order.cancel('Customer requested')

      expect(order.status).toBe(OrderStatus.CANCELLED)
      const events = order.pullDomainEvents()
      expect(events).toHaveLength(2) // OrderCreated, OrderCancelled
      expect(events[1]).toBeInstanceOf(OrderCancelled)
      expect((events[1] as OrderCancelled).reason).toBe('Customer requested')
    })

    it('throws INVALID_ORDER_STATE if already DELIVERED', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      order.confirm()
      order.advanceStatus(OrderStatus.IN_PREPARATION)
      order.advanceStatus(OrderStatus.READY)
      order.advanceStatus(OrderStatus.DELIVERED)

      expect(() => order.cancel()).toThrow(DomainError)
      try {
        order.cancel()
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
      }
    })

    it('throws INVALID_ORDER_STATE if already CANCELLED', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      order.cancel()

      expect(() => order.cancel()).toThrow(DomainError)
      try {
        order.cancel()
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_ORDER_STATE')
      }
    })
  })

  describe('calculateTotal', () => {
    it('sums item subtotals correctly', () => {
      const order = Order.create(customerId)
      order.addItem(product, Quantity.create(2)) // 2 * 10000 = 20000
      const product2 = Product.create(ProductId.create(), 'Fries', 'Tasty fries', Money.create(5000, 'COP'), ProductCategory.SIDES, true)
      order.addItem(product2, Quantity.create(3)) // 3 * 5000 = 15000

      const total = order.calculateTotal()

      expect(total.amount).toBe(35000)
      expect(total.currency).toBe('COP')
    })

    it('returns 0 Money for empty order', () => {
      const order = Order.create(customerId)

      const total = order.calculateTotal()

      expect(total.amount).toBe(0)
      expect(total.currency).toBe('COP')
    })
  })

  describe('getItems', () => {
    it('returns readonly copy (mutation does not affect internal state)', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)

      const items = order.getItems()
      items.push({} as any) // Attempt to mutate the returned array

      expect(order.getItems()).toHaveLength(1)
    })
  })

  describe('domain events', () => {
    it('accumulates events and can be pulled', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      order.confirm()
      order.advanceStatus(OrderStatus.IN_PREPARATION)

      const events = order.pullDomainEvents()

      expect(events).toHaveLength(4) // OrderCreated, OrderStatusChanged (PENDING->CONFIRMED), OrderConfirmed, OrderStatusChanged (CONFIRMED->IN_PREPARATION)
      expect(events[0]).toBeInstanceOf(OrderCreated)
      expect(events[1]).toBeInstanceOf(OrderStatusChanged)
      expect(events[2]).toBeInstanceOf(OrderConfirmed)
      expect(events[3]).toBeInstanceOf(OrderStatusChanged)
    })

    it('clears events after pull', () => {
      const order = Order.create(customerId)
      order.addItem(product, quantity)
      order.confirm()

      order.pullDomainEvents()
      const events = order.pullDomainEvents()

      expect(events).toHaveLength(0)
    })
  })
})