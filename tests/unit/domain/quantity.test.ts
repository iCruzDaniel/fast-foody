import { Quantity } from '@domain/order'
import { DomainError } from '@shared/kernel'

describe('Quantity', () => {
  describe('create', () => {
    it('creates quantity with valid value', () => {
      const quantity = Quantity.create(5)

      expect(quantity.value).toBe(5)
    })

    it('creates quantity at boundary 1', () => {
      const quantity = Quantity.create(1)

      expect(quantity.value).toBe(1)
    })

    it('creates quantity at boundary 50', () => {
      const quantity = Quantity.create(50)

      expect(quantity.value).toBe(50)
    })

    it('rejects quantity 0', () => {
      expect(() => Quantity.create(0)).toThrow(DomainError)
      try {
        Quantity.create(0)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_QUANTITY')
      }
    })

    it('rejects quantity 51', () => {
      expect(() => Quantity.create(51)).toThrow(DomainError)
      try {
        Quantity.create(51)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_QUANTITY')
      }
    })

    it('rejects negative quantity', () => {
      expect(() => Quantity.create(-1)).toThrow(DomainError)
      try {
        Quantity.create(-1)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_QUANTITY')
      }
    })

    it('rejects non-integer quantity', () => {
      expect(() => Quantity.create(1.5)).toThrow(DomainError)
      try {
        Quantity.create(1.5)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_QUANTITY')
      }
    })
  })

  describe('equals', () => {
    it('returns true for same value', () => {
      const quantity1 = Quantity.create(5)
      const quantity2 = Quantity.create(5)

      expect(quantity1.equals(quantity2)).toBe(true)
    })

    it('returns false for different value', () => {
      const quantity1 = Quantity.create(5)
      const quantity2 = Quantity.create(10)

      expect(quantity1.equals(quantity2)).toBe(false)
    })

    it('returns false for null or undefined', () => {
      const quantity = Quantity.create(5)

      expect(quantity.equals(null as any)).toBe(false)
      expect(quantity.equals(undefined as any)).toBe(false)
    })
  })
})