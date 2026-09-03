import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Order, OrderItem } from '../types';

export interface PlacedOrder {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
}

interface OrdersContextType {
  orders: Order[];
  lastPlacedOrder: PlacedOrder | null;
  placeOrder: (order: PlacedOrder) => void;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [lastPlacedOrder, setLastPlacedOrder] = useState<PlacedOrder | null>(null);

  const placeOrder = (placed: PlacedOrder) => {
    setLastPlacedOrder(placed);
    const fullOrder: Order = {
      id: placed.id,
      items: placed.items,
      status: 'PENDING',
      total: placed.total,
      createdAt: new Date().toISOString(),
    };
    setOrders((prev) => [...prev, fullOrder]);
  };

  const value = useMemo(
    () => ({ orders, lastPlacedOrder, placeOrder }),
    [orders, lastPlacedOrder]
  );

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
