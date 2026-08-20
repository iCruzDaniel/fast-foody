import { Money } from '@domain/order'
import { DomainError } from '@shared/kernel'

describe('Money', () => {
  describe('create', () => {
    it('creates money with valid amount and default currency COP', () => {
      const money = Money.create(1000)

      expect(money.amount).toBe(1000)
      expect(money.currency).toBe('COP')
    })

    it('creates money with valid amount and custom currency', () => {
      const money = Money.create(5000, 'USD')

      expect(money.amount).toBe(5000)
      expect(money.currency).toBe('USD')
    })

    it('rejects negative amounts', () => {
      expect(() => Money.create(-100)).toThrow(DomainError)
      try {
        Money.create(-100)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_MONEY_AMOUNT')
      }
    })

    it('rejects non-integer amounts', () => {
      expect(() => Money.create(100.5)).toThrow(DomainError)
      try {
        Money.create(100.5)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_MONEY_AMOUNT')
      }
    })

    it('rejects empty currency', () => {
      expect(() => Money.create(1000, '')).toThrow(DomainError)
      try {
        Money.create(1000, '')
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_CURRENCY')
      }
    })

    it('normalizes currency to uppercase', () => {
      const money = Money.create(1000, 'cop')

      expect(money.currency).toBe('COP')
    })
  })

  describe('add', () => {
    it('adds two Money objects with same currency', () => {
      const money1 = Money.create(1000, 'COP')
      const money2 = Money.create(2000, 'COP')

      const result = money1.add(money2)

      expect(result.amount).toBe(3000)
      expect(result.currency).toBe('COP')
    })

    it('throws on adding Money with different currencies', () => {
      const money1 = Money.create(1000, 'COP')
      const money2 = Money.create(2000, 'USD')

      expect(() => money1.add(money2)).toThrow(DomainError)
      try {
        money1.add(money2)
      } catch (e) {
        expect((e as DomainError).code).toBe('CURRENCY_MISMATCH')
      }
    })
  })

  describe('multiply', () => {
    it('multiplies Money by integer factor', () => {
      const money = Money.create(1000, 'COP')

      const result = money.multiply(3)

      expect(result.amount).toBe(3000)
      expect(result.currency).toBe('COP')
    })

    it('rejects negative factor', () => {
      const money = Money.create(1000, 'COP')

      expect(() => money.multiply(-1)).toThrow(DomainError)
      try {
        money.multiply(-1)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_FACTOR')
      }
    })

    it('rejects non-integer factor', () => {
      const money = Money.create(1000, 'COP')

      expect(() => money.multiply(1.5)).toThrow(DomainError)
      try {
        money.multiply(1.5)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_FACTOR')
      }
    })

    it('allows factor of 0', () => {
      const money = Money.create(1000, 'COP')

      const result = money.multiply(0)

      expect(result.amount).toBe(0)
      expect(result.currency).toBe('COP')
    })
  })

  describe('equals', () => {
    it('returns true for same amount and currency', () => {
      const money1 = Money.create(1000, 'COP')
      const money2 = Money.create(1000, 'COP')

      expect(money1.equals(money2)).toBe(true)
    })

    it('returns false for different amount', () => {
      const money1 = Money.create(1000, 'COP')
      const money2 = Money.create(2000, 'COP')

      expect(money1.equals(money2)).toBe(false)
    })

    it('returns false for different currency', () => {
      const money1 = Money.create(1000, 'COP')
      const money2 = Money.create(1000, 'USD')

      expect(money1.equals(money2)).toBe(false)
    })

    it('returns false for null or undefined', () => {
      const money = Money.create(1000, 'COP')

      expect(money.equals(null as any)).toBe(false)
      expect(money.equals(undefined as any)).toBe(false)
    })
  })

  describe('toString', () => {
    it('formats money as string with 2 decimal places', () => {
      const money = Money.create(1500, 'COP')

      expect(money.toString()).toBe('15.00 COP')
    })
  })
})