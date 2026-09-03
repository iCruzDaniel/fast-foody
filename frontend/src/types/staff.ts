import type { OrderStatus, Product, ProductCategory } from './index';
import type { OrderItem } from './index';

export interface StaffUser {
  id: string;
  name: string;
  role: 'MANAGER' | 'KITCHEN' | 'FRONT_OF_HOUSE';
  avatar?: string;
}

export interface StaffOrder {
  id: string;
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  createdAt: string;
  updatedAt: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  deliveryType?: 'pickup' | 'delivery';
  deliveryAddress?: string;
  specialInstructions?: string;
  timestamps?: {
    placed?: string;
    confirmed?: string;
    started?: string;
    ready?: string;
    delivered?: string;
  };
}

export interface DashboardStats {
  pendingOrders: number;
  ordersToday: number;
  averagePrepTime: number;
  revenueToday: number;
  customerCount: number;
}

export interface ProductInput {
  name: string;
  description: string;
  price: number;
  category: ProductCategory;
}

export type { OrderStatus, Product };
