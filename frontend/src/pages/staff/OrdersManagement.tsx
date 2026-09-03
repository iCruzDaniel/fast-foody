import { useEffect, useState } from 'react';
import type { StaffOrder } from '../../types/staff';
import type { OrderStatus } from '../../types';
import { getStaffOrders, updateStaffOrderStatus } from '../../api/staff';
import { StatusBadge } from '../../components/staff/StatusBadge';
import { OrderDetailPanel } from '../../components/staff/OrderDetailPanel';
import { formatPrice } from '../../utils';

type Filter = 'ALL' | OrderStatus;

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'ALL', label: 'All' },
  { id: 'PENDING', label: 'Pending' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'IN_PREPARATION', label: 'Preparing' },
  { id: 'READY', label: 'Ready' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export function OrdersManagement() {
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);

  useEffect(() => {
    let mounted = true;
    getStaffOrders().then((data) => {
      if (mounted) {
        setOrders(data);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const filtered = filter === 'ALL' ? orders : orders.filter((o) => o.status === filter);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await updateStaffOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    setSelectedOrder(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Manage all incoming orders
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.id
                ? 'bg-brand-red text-white'
                : 'bg-white border border-neutral-200 text-neutral-700 hover:bg-neutral-50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="h-64 bg-neutral-200 animate-pulse rounded-lg" />
      ) : (
        <div className="bg-white rounded-lg border border-neutral-200 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Order</th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Customer</th>
                <th className="px-5 py-3 hidden sm:table-cell text-xs font-semibold text-neutral-500 uppercase tracking-wide">Type</th>
                <th className="px-5 py-3 hidden md:table-cell text-xs font-semibold text-neutral-500 uppercase tracking-wide">Items</th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Total</th>
                <th className="px-5 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((order) => (
                <tr
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="cursor-pointer hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-5 py-3 font-semibold text-neutral-900">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-neutral-800">{order.customerName}</p>
                    {order.customerPhone && (
                      <p className="text-xs text-neutral-500">{order.customerPhone}</p>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden sm:table-cell">
                    {order.deliveryType ? (
                      <span className="text-sm capitalize text-neutral-700">{order.deliveryType}</span>
                    ) : (
                      <span className="text-sm text-neutral-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-sm text-neutral-700">
                    {order.items.length} items
                  </td>
                  <td className="px-5 py-3 font-medium text-neutral-800">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filtered.length === 0 && (
            <div className="p-10 text-center text-neutral-500">
              No orders matching this filter
            </div>
          )}
        </div>
      )}

      {selectedOrder && (
        <OrderDetailPanel
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
}
