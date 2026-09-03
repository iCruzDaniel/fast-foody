import type { Cart as CartType } from '../../types';
import { formatPrice } from '../../utils';
import { Button } from '../ui/Button';
import { CartItemCard } from './CartItemCard';

interface CartSidebarProps {
  cart: CartType;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
  onClose: () => void;
  className?: string;
}

export function CartSidebar({
  cart,
  onQuantityChange,
  onRemove,
  onCheckout,
  onClose,
  className = '',
}: CartSidebarProps) {
  if (cart.items.length === 0) {
    return (
      <div className={`bg-white rounded-lg border border-neutral-200 p-6 text-center ${className}`}>
        <div className="w-20 h-20 mx-auto bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        </div>
        <h3 className="font-semibold text-neutral-900 mb-1">Your cart is empty</h3>
        <p className="text-sm text-neutral-600">Add some delicious items to get started!</p>
      </div>
    );
  }
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900">
          Your Order
          <span className="text-neutral-500 font-normal text-sm ml-2">
            ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})
          </span>
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600 p-1 lg:hidden"
          aria-label="Close cart"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Items */}
      <div className="px-4 max-h-72 overflow-y-auto">
        {cart.items.map((item) => (
          <CartItemCard
            key={item.product.id}
            product={item.product}
            quantity={item.quantity}
            onQuantityChange={onQuantityChange}
            onRemove={onRemove}
          />
        ))}
      </div>
      
      {/* Summary */}
      <div className="px-4 py-4 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-1">
          <span className="text-neutral-600">Subtotal</span>
          <span className="font-medium">{formatPrice(cart.total)}</span>
        </div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-neutral-600">Tax (8%)</span>
          <span className="font-medium">{formatPrice(Math.round(cart.total * 0.08))}</span>
        </div>
        <div className="flex items-center justify-between mb-4 pt-3 border-t border-neutral-200">
          <span className="font-semibold text-neutral-900 text-lg">Total</span>
          <span className="font-bold text-brand-red text-lg">
            {formatPrice(cart.total + Math.round(cart.total * 0.08))}
          </span>
        </div>
        
        <Button
          size="lg"
          className="w-full"
          onClick={onCheckout}
        >
          <span>Checkout</span>
          <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Button>
      </div>
    </div>
  );
}