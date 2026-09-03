import { useState } from 'react';
import { CheckoutForm } from '../components/checkout/CheckoutForm';
import type { CheckoutData } from '../components/checkout/CheckoutForm';
import { useCart } from '../hooks/useCart';
import { useOrders } from '../hooks/useOrders';
import { createOrder, getErrorMessage } from '../api/menu';
import { generateOrderNumber } from '../utils';
import type { OrderItem } from '../types';
import { useCustomerId } from '../hooks/useAuth';

interface CheckoutPageProps {
  onOrderPlaced: (order: { id: string; orderNumber: string }) => void;
  onBack: () => void;
}

export function CheckoutPage({ onOrderPlaced, onBack }: CheckoutPageProps) {
  const { cart, clearCart } = useCart();
  const { placeOrder } = useOrders();
  const customerId = useCustomerId();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CheckoutData) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      const order = await createOrder({
        items: cart.items.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          specialInstructions: data.instructions || undefined,
        })),
        customerId,
      });
      
      const orderNumber = generateOrderNumber();
      const capturedItems: OrderItem[] = cart.items.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: item.product.price,
      }));
      placeOrder({
        id: order.id,
        orderNumber,
        items: capturedItems,
        total: cart.total,
      });
      clearCart();
      onOrderPlaced({ id: order.id, orderNumber });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Checkout</h1>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-error text-sm">
          {error}
        </div>
      )}
      
      <div className="grid lg:grid-cols-2 gap-6">
        <CheckoutForm
          cart={cart}
          onSubmit={handleSubmit}
          onBack={onBack}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
}