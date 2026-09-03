import { useEffect, useState } from 'react';
import type { StaffOrder } from '../../types/staff';
import type { OrderStatus } from '../../types';
import { getStaffOrders, updateStaffOrderStatus } from '../../api/staff';
import { KitchenOrderCard } from '../../components/staff/KitchenOrderCard';

type View = '1up' | '2up' | '4up';

const VIEW_OPTIONS: { id: View; label: string }[] = [
  { id: '1up', label: '1' },
  { id: '2up', label: '2' },
  { id: '4up', label: '4' },
];

const STATUS_FILTERS: { id: OrderStatus | 'ALL'; label: string }[] = [
  { id: 'ALL', label: 'All Active' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'IN_PREPARATION', label: 'Preparing' },
  { id: 'READY', label: 'Ready' },
];

export function KitchenDisplay() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [view, setView] = useState<View>('4up');
  const [filter, setFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getStaffOrders().then((data) => {
      if (mounted) {
        setOrders(
          data.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
        );
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered =
    filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await updateStaffOrderStatus(orderId, status);
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === orderId ? updated : o));
      return next.filter((o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED');
    });
  };

  const gridClass =
    view === '1up'
      ? 'grid-cols-1'
      : view === '2up'
      ? 'grid-cols-1 md:grid-cols-2'
      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Kitchen Display</h1>
          <p className="text-neutral-600 text-sm mt-1">
            Live orders in the kitchen
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  filter === f.id
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-white border border-neutral-200 rounded-lg p-1" role="group" aria-label="Grid size">
            {VIEW_OPTIONS.map((v) => (
              <button
                key={v.id}
                onClick={() => setView(v.id)}
                className={`w-8 h-8 rounded-md text-sm font-semibold transition-colors ${
                  view === v.id
                    ? 'bg-brand-red text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                aria-label={`${v.label} column${v.label === '1' ? '' : 's'}`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className={`grid ${gridClass} gap-4`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-48 bg-neutral-200 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-dashed border-neutral-200 p-16 text-center">
          <p className="text-2xl font-bold text-neutral-700">All caught up!</p>
          <p className="text-neutral-500 mt-1">No active orders in this view</p>
        </div>
      ) : (
        <div className={`grid ${gridClass} gap-4`}>
          {filtered.map((order) => (
            <KitchenOrderCard
              key={order.id}
              order={order}
              size={view}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
