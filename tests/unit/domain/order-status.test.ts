import { OrderStatus, canTransitionTo, validateTransition, isTerminalStatus } from '@domain/order'
import { DomainError } from '@shared/kernel'

describe('OrderStatus', () => {
  describe('canTransitionTo', () => {
    it('allows PENDING to CONFIRMED', () => {
      expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.CONFIRMED)).toBe(true)
    })

    it('allows PENDING to CANCELLED', () => {
      expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.CANCELLED)).toBe(true)
    })

    it('rejects PENDING to IN_PREPARATION', () => {
      expect(canTransitionTo(OrderStatus.PENDING, OrderStatus.IN_PREPARATION)).toBe(false)
    })

    it('allows CONFIRMED to IN_PREPARATION', () => {
      expect(canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.IN_PREPARATION)).toBe(true)
    })

    it('allows CONFIRMED to CANCELLED', () => {
      expect(canTransitionTo(OrderStatus.CONFIRMED, OrderStatus.CANCELLED)).toBe(true)
    })

    it('allows IN_PREPARATION to READY', () => {
      expect(canTransitionTo(OrderStatus.IN_PREPARATION, OrderStatus.READY)).toBe(true)
    })

    it('allows IN_PREPARATION to CANCELLED', () => {
      expect(canTransitionTo(OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED)).toBe(true)
    })

    it('allows READY to DELIVERED', () => {
      expect(canTransitionTo(OrderStatus.READY, OrderStatus.DELIVERED)).toBe(true)
    })

    it('rejects DELIVERED to anything', () => {
      expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.PENDING)).toBe(false)
      expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.CONFIRMED)).toBe(false)
      expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.IN_PREPARATION)).toBe(false)
      expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.READY)).toBe(false)
      expect(canTransitionTo(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toBe(false)
    })

    it('rejects CANCELLED to anything', () => {
      expect(canTransitionTo(OrderStatus.CANCELLED, OrderStatus.PENDING)).toBe(false)
      expect(canTransitionTo(OrderStatus.CANCELLED, OrderStatus.CONFIRMED)).toBe(false)
      expect(canTransitionTo(OrderStatus.CANCELLED, OrderStatus.IN_PREPARATION)).toBe(false)
      expect(canTransitionTo(OrderStatus.CANCELLED, OrderStatus.READY)).toBe(false)
      expect(canTransitionTo(OrderStatus.CANCELLED, OrderStatus.DELIVERED)).toBe(false)
    })
  })

  describe('validateTransition', () => {
    it('does not throw for valid transitions', () => {
      expect(() => validateTransition(OrderStatus.PENDING, OrderStatus.CONFIRMED)).not.toThrow()
      expect(() => validateTransition(OrderStatus.CONFIRMED, OrderStatus.IN_PREPARATION)).not.toThrow()
      expect(() => validateTransition(OrderStatus.IN_PREPARATION, OrderStatus.READY)).not.toThrow()
      expect(() => validateTransition(OrderStatus.READY, OrderStatus.DELIVERED)).not.toThrow()
    })

    it('throws DomainError for invalid transitions', () => {
      expect(() => validateTransition(OrderStatus.PENDING, OrderStatus.IN_PREPARATION)).toThrow(DomainError)
      try {
        validateTransition(OrderStatus.PENDING, OrderStatus.IN_PREPARATION)
      } catch (e) {
        expect((e as DomainError).code).toBe('INVALID_STATUS_TRANSITION')
      }
    })

    it('throws DomainError for terminal state transitions', () => {
      expect(() => validateTransition(OrderStatus.DELIVERED, OrderStatus.CANCELLED)).toThrow(DomainError)
      expect(() => validateTransition(OrderStatus.CANCELLED, OrderStatus.PENDING)).toThrow(DomainError)
    })
  })

  describe('isTerminalStatus', () => {
    it('returns true for DELIVERED', () => {
      expect(isTerminalStatus(OrderStatus.DELIVERED)).toBe(true)
    })

    it('returns true for CANCELLED', () => {
      expect(isTerminalStatus(OrderStatus.CANCELLED)).toBe(true)
    })

    it('returns false for PENDING', () => {
      expect(isTerminalStatus(OrderStatus.PENDING)).toBe(false)
    })

    it('returns false for CONFIRMED', () => {
      expect(isTerminalStatus(OrderStatus.CONFIRMED)).toBe(false)
    })

    it('returns false for IN_PREPARATION', () => {
      expect(isTerminalStatus(OrderStatus.IN_PREPARATION)).toBe(false)
    })

    it('returns false for READY', () => {
      expect(isTerminalStatus(OrderStatus.READY)).toBe(false)
    })
  })
})