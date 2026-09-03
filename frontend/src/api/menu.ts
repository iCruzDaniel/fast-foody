import type { Order, Product, ProductCategory } from '../types';
import { API_BASE_URL, WALK_IN_CUSTOMER_ID } from './config';

interface ApiErrorBody {
  error?: string;
  message?: string;
}

class ApiError extends Error {
  code: string;
  status: number;

  constructor(message: string, code: string, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      body.message ?? 'Request failed',
      body.error ?? 'REQUEST_FAILED',
      res.status
    );
  }

  return (await res.json()) as T;
}

interface ApiProduct {
  id: string;
  name: string;
  description: string;
  price: { amount: number; currency: string };
  category: ProductCategory;
  available: boolean;
  imageUrl?: string;
}

function toProduct(p: ApiProduct): Product {
  return {
    id: p.id,
    name: p.name,
    description: p.description,
    price: p.price.amount,
    currency: p.price.currency,
    category: p.category,
    available: p.available,
    imageUrl: p.imageUrl,
  };
}

export function mapApiProductToProduct(p: ApiProduct): Product {
  return toProduct(p);
}

export type { ApiProduct, ApiOrder, ApiOrderItem };

interface ApiOrder {
  id: string;
  customerId: string;
  items: ApiOrderItem[];
  status: Order['status'];
  createdAt: string;
  updatedAt: string;
}

interface ApiOrderItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: { amount: number; currency: string };
  quantity: number;
}

export async function getProducts(category?: ProductCategory): Promise<Product[]> {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  const data = await request<ApiProduct[]>(`/products${query}`);
  return data.map(toProduct);
}

export async function getProduct(id: string): Promise<Product | undefined> {
  const data = await request<ApiProduct>(`/products/${id}`);
  return toProduct(data);
}

export async function createOrder(orderData: {
  items: { productId: string; quantity: number; specialInstructions?: string }[];
  customerId?: string;
}): Promise<{ id: string; status: string }> {
  const data = await request<ApiOrder>('/orders', {
    method: 'POST',
    credentials: 'include',
    body: JSON.stringify({
      customerId: orderData.customerId ?? WALK_IN_CUSTOMER_ID,
      items: orderData.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
    }),
  });
  return { id: data.id, status: data.status };
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    return err.message;
  }
  if (err instanceof Error) {
    return err.message;
  }
  return 'An unexpected error occurred';
}

export { ApiError };
