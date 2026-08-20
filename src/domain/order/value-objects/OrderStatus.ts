import { DomainError } from '@shared/kernel';

export const OrderStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PREPARATION: 'IN_PREPARATION',
  READY: 'READY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

const validTransitions: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.IN_PREPARATION, OrderStatus.CANCELLED],
  [OrderStatus.IN_PREPARATION]: [OrderStatus.READY, OrderStatus.CANCELLED],
  [OrderStatus.READY]: [OrderStatus.DELIVERED],
  [OrderStatus.DELIVERED]: [],
  [OrderStatus.CANCELLED]: [],
};

export function canTransitionTo(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
  const allowed = validTransitions[currentStatus];
  return allowed.includes(newStatus);
}

export function validateTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
  if (!canTransitionTo(currentStatus, newStatus)) {
    throw new DomainError(
      'INVALID_STATUS_TRANSITION',
      `Cannot transition from ${currentStatus} to ${newStatus}`
    );
  }
}

export function isTerminalStatus(status: OrderStatus): boolean {
  return status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED;
}