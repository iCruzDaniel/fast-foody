import { Product, ProductId, ProductCategory } from '@domain/product'
import { Money } from '@domain/order'
import { DomainError } from '@shared/kernel'

describe('Product', () => {
  const productId = ProductId.create()
  const price = Money.create(10000, 'COP')

  describe('create', () => {
    it('creates product with valid data', () => {
      const product = Product.create(productId, 'Burger', 'Delicious burger', price, ProductCategory.BURGERS, true)

      expect(product.id).toBe(productId)
      expect(product.name).toBe('Burger')
      expect(product.description).toBe('Delicious burger')
      expect(product.price.amount).toBe(10000)
      expect(product.category).toBe(ProductCategory.BURGERS)
      expect(product.available).toBe(true)
    })

    it('creates product with default available=true', () => {
      const product = Product.create(productId, 'Burger', 'Delicious burger', price, ProductCategory.BURGERS)

      expect(product.available).toBe(true)
    })

    it('trims name and description', () => {
      const product = Product.create(productId, '  Burger  ', '  Delicious burger  ', price, ProductCategory.BURGERS)

      expect(product.name).toBe('Burger')
      expect(product.description).toBe('Delicious burger')
    })

    it('rejects empty name', () => {
      expect(() => Product.create(productId, '', 'Description', price, ProductCategory.BURGERS)).toThrow(DomainError)
      try {
        Product.create(productId, '', 'Description', price, ProductCategory.BURGERS)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_NAME')
      }
    })

    it('rejects name with only whitespace', () => {
      expect(() => Product.create(productId, '   ', 'Description', price, ProductCategory.BURGERS)).toThrow(DomainError)
      try {
        Product.create(productId, '   ', 'Description', price, ProductCategory.BURGERS)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_NAME')
      }
    })

    it('rejects name longer than 80 characters', () => {
      const longName = 'a'.repeat(81)

      expect(() => Product.create(productId, longName, 'Description', price, ProductCategory.BURGERS)).toThrow(DomainError)
      try {
        Product.create(productId, longName, 'Description', price, ProductCategory.BURGERS)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_NAME')
      }
    })

    it('rejects price <= 0', () => {
      expect(() => Product.create(productId, 'Burger', 'Description', Money.create(0), ProductCategory.BURGERS)).toThrow(DomainError)
      try {
        Product.create(productId, 'Burger', 'Description', Money.create(0), ProductCategory.BURGERS)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_PRICE')
      }
    })

    it('rejects description longer than 300 characters', () => {
      const longDescription = 'a'.repeat(301)

      expect(() => Product.create(productId, 'Burger', longDescription, price, ProductCategory.BURGERS)).toThrow(DomainError)
      try {
        Product.create(productId, 'Burger', longDescription, price, ProductCategory.BURGERS)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_DESCRIPTION')
      }
    })
  })

  describe('changePrice', () => {
    it('returns new Product with updated price', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)
      const newPrice = Money.create(15000, 'COP')

      const updatedProduct = product.changePrice(newPrice)

      expect(updatedProduct.price.amount).toBe(15000)
      expect(updatedProduct.name).toBe('Burger')
      expect(updatedProduct.id).toBe(productId)
    })

    it('rejects price <= 0', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)

      expect(() => product.changePrice(Money.create(0))).toThrow(DomainError)
      try {
        product.changePrice(Money.create(0))
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_PRICE')
      }
    })

    it('does not mutate original product', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)
      const newPrice = Money.create(15000, 'COP')

      product.changePrice(newPrice)

      expect(product.price.amount).toBe(10000)
    })
  })

  describe('markUnavailable', () => {
    it('returns new Product with available=false', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS, true)

      const updatedProduct = product.markUnavailable()

      expect(updatedProduct.available).toBe(false)
      expect(updatedProduct.name).toBe('Burger')
      expect(updatedProduct.id).toBe(productId)
    })

    it('does not mutate original product', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS, true)

      product.markUnavailable()

      expect(product.available).toBe(true)
    })
  })

  describe('markAvailable', () => {
    it('returns new Product with available=true', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS, false)

      const updatedProduct = product.markAvailable()

      expect(updatedProduct.available).toBe(true)
      expect(updatedProduct.name).toBe('Burger')
      expect(updatedProduct.id).toBe(productId)
    })

    it('does not mutate original product', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS, false)

      product.markAvailable()

      expect(product.available).toBe(false)
    })
  })

  describe('rename', () => {
    it('returns new Product with new name', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)

      const updatedProduct = product.rename('Cheese Burger')

      expect(updatedProduct.name).toBe('Cheese Burger')
      expect(updatedProduct.id).toBe(productId)
      expect(updatedProduct.price.amount).toBe(10000)
    })

    it('trims new name', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)

      const updatedProduct = product.rename('  Cheese Burger  ')

      expect(updatedProduct.name).toBe('Cheese Burger')
    })

    it('rejects empty name', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)

      expect(() => product.rename('')).toThrow(DomainError)
      try {
        product.rename('')
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_NAME')
      }
    })

    it('rejects name longer than 80 characters', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)
      const longName = 'a'.repeat(81)

      expect(() => product.rename(longName)).toThrow(DomainError)
      try {
        product.rename(longName)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_PRODUCT_NAME')
      }
    })

    it('does not mutate original product', () => {
      const product = Product.create(productId, 'Burger', 'Description', price, ProductCategory.BURGERS)

      product.rename('Cheese Burger')

      expect(product.name).toBe('Burger')
    })
  })
})