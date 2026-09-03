import type { Order } from '../../types';
import { formatPrice, getStatusColor, getStatusText } from '../../utils';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';

interface OrderHistoryProps {
  orders: Order[];
  onOrderSelect: (order: Order) => void;
  className?: string;
}

export function OrderHistory({ orders, onOrderSelect, className = '' }: OrderHistoryProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
          </svg>
        </div>
        <h3 className="font-semibold text-neutral-900 mb-1">No orders yet</h3>
        <p className="text-neutral-600 text-sm">Your order history will appear here</p>
      </div>
    );
  }
  
  return (
    <div className={`space-y-4 ${className}`}>
      <h2 className="text-2xl font-bold text-neutral-900">Your Orders</h2>
      
      {orders.map((order) => {
        const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
        
        return (
          <Card
            key={order.id}
            hover
            onClick={() => onOrderSelect(order)}
            className="cursor-pointer"
          >
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-neutral-900">
                      Order {order.id.toUpperCase().slice(0, 6)}
                    </span>
                    <Badge variant={getStatusColor(order.status) as 'default'}>
                      {getStatusText(order.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-neutral-600 mt-1">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} · {formatPrice(order.total)}
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({ title, description, actionText, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h3 className="font-semibold text-neutral-900 mb-1">{title}</h3>
      <p className="text-neutral-600 text-sm mb-4">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="text-brand-red font-medium hover:underline"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}