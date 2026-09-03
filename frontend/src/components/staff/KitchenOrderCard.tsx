import { useEffect, useState } from 'react';
import type { StaffOrder } from '../../types/staff';
import type { OrderStatus } from '../../types';
import { StatusBadge } from './StatusBadge';

interface KitchenOrderCardProps {
  order: StaffOrder;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  size?: '1up' | '2up' | '4up';
}

function useElapsedTime(iso: string | undefined): string {
  const [text, setText] = useState('0:00');

  useEffect(() => {
    if (!iso) {
      setText('—');
      return;
    }
    const update = () => {
      const elapsed = Math.max(0, Date.now() - new Date(iso).getTime());
      const minutes = Math.floor(elapsed / 60000);
      const seconds = Math.floor((elapsed % 60000) / 1000);
      setText(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    };
    update();
    const id = window.setInterval(update, 1000);
    return () => window.clearInterval(id);
  }, [iso]);

  return text;
}

const CARD_COLORS: Record<OrderStatus, string> = {
  PENDING: 'border-yellow-300 bg-yellow-50',
  CONFIRMED: 'border-blue-300 bg-blue-50',
  IN_PREPARATION: 'border-orange-300 bg-orange-50',
  READY: 'border-green-300 bg-green-50',
  DELIVERED: 'border-neutral-300 bg-neutral-50',
  CANCELLED: 'border-red-300 bg-red-50',
};

export function KitchenOrderCard({ order, onUpdateStatus, size = '4up' }: KitchenOrderCardProps) {
  const elapsed = useElapsedTime(order.createdAt);

  const sizeClasses =
    size === '1up'
      ? 'p-6 min-h-[60vh]'
      : size === '2up'
      ? 'p-4'
      : 'p-3';

  const nameSize = size === '1up' ? 'text-2xl' : size === '2up' ? 'text-lg' : 'text-base';
  const itemSize = size === '1up' ? 'text-xl' : size === '2up' ? 'text-base' : 'text-sm';

  return (
    <div
      className={`rounded-xl border-2 ${CARD_COLORS[order.status]} flex flex-col ${sizeClasses}`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`font-bold text-neutral-900 ${size === '1up' ? 'text-3xl' : 'text-xl'}`}>
          {order.orderNumber}
        </span>
        <StatusBadge status={order.status} size={size === '1up' ? 'md' : 'sm'} />
      </div>

      <div className={`flex items-center gap-2 font-semibold text-brand-red ${nameSize}`}>
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {elapsed}
      </div>

      <div className={`flex-1 mt-3 ${size === '1up' ? 'space-y-4' : 'space-y-2'}`}>
        {order.items.map((item, i) => (
          <div key={i} className="flex items-baseline justify-between">
            <span className={`font-medium text-neutral-800 ${itemSize}`}>
              {item.quantity}× {item.productName}
            </span>
            {item.specialInstructions && (
              <span className="text-xs text-neutral-500 italic ml-2">{item.specialInstructions}</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-3">
        {order.status === 'IN_PREPARATION' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'READY')}
            className="w-full py-2.5 rounded-lg bg-green-600 text-white font-semibold hover:bg-green-700 transition-colors"
          >
            Mark Ready
          </button>
        )}
        {order.status === 'CONFIRMED' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'IN_PREPARATION')}
            className="w-full py-2.5 rounded-lg bg-orange-600 text-white font-semibold hover:bg-orange-700 transition-colors"
          >
            Start Prep
          </button>
        )}
        {order.status === 'PENDING' && (
          <button
            onClick={() => onUpdateStatus(order.id, 'CONFIRMED')}
            className="w-full py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Confirm
          </button>
        )}
        {order.status === 'READY' && (
          <div className="text-center py-2.5 rounded-lg bg-green-600 text-white font-bold">
            Ready for pickup
          </div>
        )}
      </div>
    </div>
  );
}
