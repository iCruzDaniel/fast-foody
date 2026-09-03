import type {
  DashboardStats,
  OrderStatus,
  ProductInput,
  StaffOrder,
} from '../types/staff';
import type { Product, ProductCategory, OrderItem } from '../types';
import { request, mapApiProductToProduct } from './menu';
import type { ApiProduct, ApiOrder } from './menu';

const CUSTOMER_NAMES: Record<string, string> = {
  '3aa9b487-f0f4-42ac-8c90-f3274d1da5cb': 'Maria Lopez',
  '2f9d5951-1e3f-4ceb-90e9-0eac6f81f9e3': 'Juan Perez',
  '8dd27acb-4cb3-48b2-b329-1a83872475b9': 'Ana Torres',
  '1ae1e0e8-8d8b-4a73-8037-be6cd691c5cf': 'Carlos Ruiz',
  '17022c83-f4a4-4672-bfbe-8742fd71adbb': 'Lucia Gomez',
  'e47c1144-c7fb-4e4a-ba95-4128ddfe1a11': 'Pedro Sanchez',
  '5821ac87-f7c6-4eba-b3a4-cc3f00b221e9': 'Sofia Herrera',
  '887cfd1e-5ad2-400d-9a86-53f9e95c002d': 'Diego Moreno',
};

function toOrderNumber(id: string): string {
  const tail = id.replace(/-/g, '').slice(-5).toUpperCase();
  return `A-${tail}`;
}

function toStaffOrder(o: ApiOrder): StaffOrder {
  const items: OrderItem[] = o.items.map((item) => ({
    productId: item.productId,
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice.amount,
  }));
  const total = items.reduce((sum, it) => sum + it.unitPrice * it.quantity, 0);
  return {
    id: o.id,
    customerId: o.customerId,
    items,
    status: o.status,
    total,
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
    orderNumber: toOrderNumber(o.id),
    customerName: CUSTOMER_NAMES[o.customerId] ?? 'Walk-in customer',
  };
}

export async function getStaffOrders(status?: OrderStatus): Promise<StaffOrder[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  const data = await request<ApiOrder[]>(`/orders${query}`);
  return data.map(toStaffOrder);
}

export async function getStaffOrder(id: string): Promise<StaffOrder | null> {
  const data = await request<ApiOrder>(`/orders/${id}`);
  return toStaffOrder(data);
}

export async function updateStaffOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<StaffOrder> {
  let data: ApiOrder;
  if (status === 'CANCELLED') {
    data = await request<ApiOrder>(`/orders/${orderId}/cancel`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    });
  } else if (status === 'CONFIRMED') {
    data = await request<ApiOrder>(`/orders/${orderId}/confirm`, {
      method: 'PATCH',
    });
  } else {
    data = await request<ApiOrder>(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
  return toStaffOrder(data);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const orders = await getStaffOrders();
  const active = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  );
  return {
    pendingOrders: orders.filter((o) => o.status === 'PENDING').length,
    ordersToday: orders.length,
    averagePrepTime: 16,
    revenueToday: orders
      .filter((o) => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0),
    customerCount: active.length,
  };
}

export async function getProducts(): Promise<Product[]> {
  const data = await request<ApiProduct[]>('/products');
  return data.map(mapApiProductToProduct);
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const data = await request<ApiProduct>('/products', {
    method: 'POST',
    body: JSON.stringify({
      name: input.name,
      description: input.description,
      price: input.price,
      category: input.category,
    }),
  });
  return mapApiProductToProduct(data);
}

export async function updateProductPrice(id: string, cents: number): Promise<Product> {
  const data = await request<ApiProduct>(`/products/${id}/price`, {
    method: 'PATCH',
    body: JSON.stringify({ price: cents }),
  });
  return mapApiProductToProduct(data);
}

export async function toggleProductAvailability(id: string): Promise<Product> {
  const data = await request<ApiProduct>(`/products/${id}/availability`, {
    method: 'PATCH',
  });
  return mapApiProductToProduct(data);
}

export { toOrderNumber };

export type { ProductCategory };
