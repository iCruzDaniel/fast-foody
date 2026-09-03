import type { OrderStatus } from '../../types/staff';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  className?: string;
}

const STATUS_STYLES: Record<OrderStatus, { bg: string; text: string; dot: string; label: string }> = {
  PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', dot: 'bg-yellow-500', label: 'Pending' },
  CONFIRMED: { bg: 'bg-blue-100', text: 'text-blue-800', dot: 'bg-blue-500', label: 'Confirmed' },
  IN_PREPARATION: { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500', label: 'Preparing' },
  READY: { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500', label: 'Ready' },
  DELIVERED: { bg: 'bg-neutral-100', text: 'text-neutral-700', dot: 'bg-neutral-500', label: 'Delivered' },
  CANCELLED: { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500', label: 'Cancelled' },
};

export function StatusBadge({ status, size = 'sm', className = '' }: StatusBadgeProps) {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  const sizeClass = size === 'md' ? 'px-3 py-1 text-sm' : 'px-2 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${style.bg} ${style.text} ${sizeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}
