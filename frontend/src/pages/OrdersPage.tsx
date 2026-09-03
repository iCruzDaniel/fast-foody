import type { Order } from '../types';
import { OrderHistory } from '../components/orders/OrderHistory';

interface OrdersPageProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  onBackToMenu: () => void;
}

export function OrdersPage({ orders, onOrderSelect, onBackToMenu }: OrdersPageProps) {
  return (
    <div className="py-6">
      <OrderHistory
        orders={orders}
        onOrderSelect={onOrderSelect}
      />
      
      <button
        onClick={onBackToMenu}
        className="mt-6 text-brand-red font-medium hover:underline inline-flex items-center gap-1"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to Menu
      </button>
    </div>
  );
}