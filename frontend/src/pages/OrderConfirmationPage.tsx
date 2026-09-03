import type { Order, OrderItem } from '../types';
import { OrderStatusTracker } from '../components/orders/OrderStatusTracker';

interface OrderConfirmationProps {
  orderId: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  onContinueShopping: () => void;
}

export function OrderConfirmation({
  orderId,
  orderNumber,
  items,
  total,
  onContinueShopping,
}: OrderConfirmationProps) {
  const order: Order = {
    id: orderId,
    items,
    status: 'PENDING',
    total,
    createdAt: new Date().toISOString(),
  };
  
  return (
    <OrderStatusTracker
      order={order}
      orderNumber={orderNumber}
      onContinueShopping={onContinueShopping}
    />
  );
}