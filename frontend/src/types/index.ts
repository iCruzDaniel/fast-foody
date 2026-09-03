// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // in cents
  currency?: string; // ISO currency from API (defaults COP)
  category: ProductCategory;
  available: boolean;
  imageUrl?: string;
}

export type ProductCategory = 'BURGERS' | 'SIDES' | 'DRINKS' | 'DESSERTS' | 'COMBOS';

// Cart types
export interface CartItem {
  product: Product;
  quantity: number;
  specialInstructions?: string;
}

export interface Cart {
  items: CartItem[];
  total: number; // in cents
}

// Order types
export type OrderStatus = 
  | 'PENDING' 
  | 'CONFIRMED' 
  | 'IN_PREPARATION' 
  | 'READY' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface Order {
  id: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number; // in cents
  createdAt: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number; // in cents
  specialInstructions?: string;
}

// Customer types
export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
}

// UI State types
export interface AppState {
  cart: Cart;
  currentOrder: Order | null;
  isLoading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// Category with icon mapping
export interface CategoryInfo {
  id: ProductCategory;
  name: string;
  icon: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'BURGERS', name: 'Burgers', icon: '🍔' },
  { id: 'SIDES', name: 'Sides', icon: '🍟' },
  { id: 'DRINKS', name: 'Drinks', icon: '🥤' },
  { id: 'DESSERTS', name: 'Desserts', icon: '🍦' },
  { id: 'COMBOS', name: 'Combos', icon: '🍽️' },
];