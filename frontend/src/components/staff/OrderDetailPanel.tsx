import type { StaffOrder } from '../../types/staff';
import type { OrderStatus } from '../../types';
import { formatPrice } from '../../utils';
import { StatusBadge } from './StatusBadge';

interface OrderDetailPanelProps {
  order: StaffOrder;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

const NEXT_ACTIONS: Record<OrderStatus, { status: OrderStatus; label: string }[]> = {
  PENDING: [
    { status: 'CONFIRMED', label: 'Confirm Order' },
    { status: 'CANCELLED', label: 'Cancel' },
  ],
  CONFIRMED: [
    { status: 'IN_PREPARATION', label: 'Start Preparing' },
    { status: 'CANCELLED', label: 'Cancel' },
  ],
  IN_PREPARATION: [
    { status: 'READY', label: 'Mark Ready' },
    { status: 'CANCELLED', label: 'Cancel' },
  ],
  READY: [{ status: 'DELIVERED', label: 'Mark Delivered' }],
  DELIVERED: [],
  CANCELLED: [],
};

function formatDate(iso: string | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function OrderDetailPanel({ order, onClose, onUpdateStatus }: OrderDetailPanelProps) {
  const nextActions = NEXT_ACTIONS[order.status] ?? [];

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40 animate-fade-in" onClick={onClose} aria-hidden="true" />
      <aside
        className="fixed top-0 right-0 h-full w-full sm:w-[460px] bg-white z-50 shadow-2xl flex flex-col animate-slide-in-right"
        role="dialog"
        aria-label={`Order ${order.orderNumber} details`}
      >        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Order {order.orderNumber}
            </h2>
            <div className="mt-1">
              <StatusBadge status={order.status} size="md" />
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-800 rounded-lg hover:bg-neutral-100"
            aria-label="Close order details"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          <section>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Customer</h3>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-red/10 text-brand-red flex items-center justify-center font-semibold">
                {order.customerName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{order.customerName}</p>
                {order.customerPhone && (
                  <p className="text-sm text-neutral-600">{order.customerPhone}</p>
                )}
              </div>
            </div>
            {order.deliveryType && (
              <p className="mt-3 text-sm text-neutral-700">
                <span className="font-medium">Type:</span>{' '}
                {order.deliveryType === 'delivery' ? 'Delivery' : 'Pickup'}
              </p>
            )}
            {order.deliveryAddress && (
              <p className="mt-1 text-sm text-neutral-700">
                <span className="font-medium">Address:</span> {order.deliveryAddress}
              </p>
            )}
          </section>

          <section>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Items</h3>
            <ul className="divide-y divide-neutral-100">
              {order.items.map((item, i) => (
                <li key={i} className="py-2 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-neutral-900">
                      {item.quantity}× {item.productName}
                    </p>
                    {item.specialInstructions && (
                      <p className="text-xs text-neutral-500 italic">{item.specialInstructions}</p>
                    )}
                  </div>
                  <span className="font-medium">{formatPrice(item.unitPrice * item.quantity)}</span>
                </li>
              ))}
            </ul>
          </section>

          {order.specialInstructions && (
            <section>
              <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">
                Instructions
              </h3>
              <p className="text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-900">
                {order.specialInstructions}
              </p>
            </section>
          )}

          <section>
            <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-wide mb-2">Timeline</h3>
            <ul className="space-y-1.5 text-sm">
              <li className="flex justify-between">
                <span className="text-neutral-600">Placed</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-neutral-600">Last updated</span>
                <span className="font-medium">{formatDate(order.updatedAt)}</span>
              </li>
              <li className="flex justify-between">
                <span className="text-neutral-600">Current status</span>
                <span className="font-medium">{order.status.replace(/_/g, ' ').toLowerCase()}</span>
              </li>
            </ul>
          </section>
        </div>

        <div className="px-6 py-4 border-t border-neutral-200 space-x-3 flex">
          {nextActions.map((action) => (
            <button
              key={action.status}
              onClick={() => onUpdateStatus(order.id, action.status)}
              className={
                action.status === 'CANCELLED'
                  ? 'flex-1 px-4 py-2.5 rounded-lg border-2 border-error text-error font-semibold hover:bg-red-50 transition-colors'
                  : 'flex-1 px-4 py-2.5 rounded-lg bg-brand-red text-white font-semibold hover:bg-red-700 transition-colors'
              }
            >
              {action.label}
            </button>
          ))}
        </div>
      </aside>
    </>
  );
}
