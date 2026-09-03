import { useEffect, useState } from 'react';
import type { DashboardStats, StaffOrder } from '../../types/staff';
import {
  getDashboardStats,
  getStaffOrders,
  updateStaffOrderStatus,
} from '../../api/staff';
import type { OrderStatus } from '../../types';
import { StatCard } from '../../components/staff/StatCard';
import { StatusBadge } from '../../components/staff/StatusBadge';
import { OrderDetailPanel } from '../../components/staff/OrderDetailPanel';
import { formatPrice } from '../../utils';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [orders, setOrders] = useState<StaffOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<StaffOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    Promise.all([getDashboardStats(), getStaffOrders()]).then(
      ([statsData, ordersData]) => {
        if (mounted) {
          setStats(statsData);
          setOrders(ordersData);
          setLoading(false);
        }
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const handleUpdateStatus = async (orderId: string, status: OrderStatus) => {
    const updated = await updateStaffOrderStatus(orderId, status);
    setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
    setSelectedOrder(updated);
    const statsData = await getDashboardStats();
    setStats(statsData);
  };

  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-neutral-200 animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="h-64 bg-neutral-200 animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600 text-sm mt-1">
          Overview of today's operations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Pending Orders"
          value={stats?.pendingOrders ?? 0}
          change="Needs attention"
          trend={stats && stats.pendingOrders > 0 ? 'down' : 'neutral'}
          accentClass="bg-yellow-100/60 text-yellow-800"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Orders Today"
          value={stats?.ordersToday ?? 0}
          change="Total orders"
          accentClass="bg-blue-100/60 text-blue-800"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <StatCard
          title="Avg. Prep Time"
          value={`${stats?.averagePrepTime ?? 0}m`}
          change="Per order"
          accentClass="bg-orange-100/60 text-orange-800"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
        <StatCard
          title="Revenue Today"
          value={formatPrice(stats?.revenueToday ?? 0)}
          change="Before taxes"
          trend="up"
          accentClass="bg-green-100/60 text-green-800"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      <div className="bg-white rounded-lg border border-neutral-200">
        <div className="px-5 py-4 border-b border-neutral-200">
          <h2 className="font-semibold text-neutral-900">Active Orders</h2>
        </div>
        {activeOrders.length === 0 ? (
          <div className="p-10 text-center text-neutral-500">
            No active orders right now
          </div>
        ) : (
          <ul className="divide-y divide-neutral-100">
            {activeOrders.map((order) => (
              <li key={order.id}>
                <button
                  onClick={() => setSelectedOrder(order)}
                  className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors text-left"
                >
                  <div>
                    <p className="font-semibold text-neutral-900">
                      Order {order.orderNumber}
                    </p>
                    <p className="text-sm text-neutral-600">
                      {order.customerName} · {order.items.length} items
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm text-neutral-700">
                      {formatPrice(order.total)}
                    </span>
                    <StatusBadge status={order.status} />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

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
