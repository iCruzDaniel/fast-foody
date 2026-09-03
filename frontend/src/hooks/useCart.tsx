import { createContext, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Cart, CartItem, Product } from '../types';

interface CartContextType {
  cart: Cart;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [isCartOpen, setIsCartOpen] = useState(false);

  const addItem = (product: Product) => {
    setCart((prev) => {
      const existingItem = prev.items.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Increment quantity if already in cart
        const updatedItems = prev.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: updatedItems.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          ),
        };
      }

      // Add new item
      const newItem: CartItem = { product, quantity: 1 };
      const newItems = [...prev.items, newItem];
      return {
        items: newItems,
        total: newItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    });
  };

  const removeItem = (productId: string) => {
    setCart((prev) => {
      const updatedItems = prev.items.filter(
        (item) => item.product.id !== productId
      );
      return {
        items: updatedItems,
        total: updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) => {
      const updatedItems = prev.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      );
      return {
        items: updatedItems,
        total: updatedItems.reduce(
          (sum, item) => sum + item.product.price * item.quantity,
          0
        ),
      };
    });
  };

  const clearCart = () => {
    setCart({ items: [], total: 0 });
  };

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const itemCount = useMemo(
    () => cart.items.reduce((sum, item) => sum + item.quantity, 0),
    [cart.items]
  );

  const value = useMemo(
    () => ({
      cart,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      isCartOpen,
      openCart,
      closeCart,
    }),
    [cart, itemCount, isCartOpen]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}