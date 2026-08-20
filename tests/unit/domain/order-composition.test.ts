import { Order, Money, Quantity, OrderCompositionService } from '@domain/order'
import { Product, ProductId, ProductCategory } from '@domain/product'
import { CustomerId } from '@domain/customer'
import { DomainError } from '@shared/kernel'

describe('OrderCompositionService', () => {
  const service = new OrderCompositionService()
  const customerId = CustomerId.create()
  const productId = ProductId.create()
  const price = Money.create(10000, 'COP')
  const quantity = Quantity.create(2)

  describe('addProductToOrder', () => {
    it('adds item when product is available', () => {
      const order = Order.create(customerId)
      const product = Product.create(productId, 'Burger', 'Delicious burger', price, ProductCategory.BURGERS, true)

      service.addProductToOrder(order, product, quantity)

      const items = order.getItems()
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe(productId)
      expect(items[0].productName).toBe('Burger')
      expect(items[0].unitPrice.amount).toBe(10000)
      expect(items[0].quantity.value).toBe(2)
    })

    it('throws PRODUCT_NOT_AVAILABLE when product unavailable', () => {
      const order = Order.create(customerId)
      const product = Product.create(productId, 'Burger', 'Delicious burger', price, ProductCategory.BURGERS, false)

      expect(() => service.addProductToOrder(order, product, quantity)).toThrow(DomainError)
      try {
        service.addProductToOrder(order, product, quantity)
      } catch (e) {
        expect((e as DomainError).code).toBe('PRODUCT_NOT_AVAILABLE')
      }
    })
  })
})