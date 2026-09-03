import { useState } from 'react';
import type { Cart } from '../../types';
import { formatPrice } from '../../utils';
import { Button } from '../ui/Button';

interface CheckoutFormProps {
  cart: Cart;
  onSubmit: (data: CheckoutData) => void;
  onBack: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export interface CheckoutData {
  name: string;
  phone: string;
  deliveryType: 'pickup' | 'delivery';
  address?: string;
  paymentMethod: 'card' | 'cash';
  instructions?: string;
}

export function CheckoutForm({
  cart,
  onSubmit,
  onBack,
  isSubmitting = false,
  className = '',
}: CheckoutFormProps) {
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'delivery'>('pickup');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash'>('card');
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    instructions: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };
  
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[+()\-\s\d]{7,20}$/.test(formData.phone)) {
      newErrors.phone = 'Enter a valid phone number';
    }
    
    if (deliveryType === 'delivery' && !formData.address.trim()) {
      newErrors.address = 'Delivery address is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        deliveryType,
        paymentMethod,
      });
    }
  };
  
  const inputClasses = (field: string) => `
    w-full rounded-lg border px-4 py-2.5 text-neutral-900 placeholder-neutral-400
    focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent
    ${errors[field] ? 'border-error' : 'border-neutral-300'}
  `;
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 ${className}`}>
      <div className="px-6 py-4 border-b border-neutral-200">
        <h3 className="font-semibold text-neutral-900 text-lg">Checkout</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Delivery Type */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            How would you like your order?
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setDeliveryType('pickup')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                deliveryType === 'pickup'
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Pickup</span>
            </button>
            <button
              type="button"
              onClick={() => setDeliveryType('delivery')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                deliveryType === 'delivery'
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4" />
                </svg>
              </div>
              <span className="text-sm font-medium">Delivery</span>
            </button>
          </div>
        </div>
        
        {/* Customer Info */}
        <div className="grid gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-neutral-700 mb-1">
              Full Name *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your name"
              className={inputClasses('name')}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-error text-sm mt-1">{errors.name}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-neutral-700 mb-1">
              Phone Number *
            </label>
            <input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="(555) 555-5555"
              className={inputClasses('phone')}
              aria-invalid={!!errors.phone}
            />
            {errors.phone && (
              <p className="text-error text-sm mt-1">{errors.phone}</p>
            )}
          </div>
          
          {deliveryType === 'delivery' && (
            <div className="animate-fade-in">
              <label htmlFor="address" className="block text-sm font-medium text-neutral-700 mb-1">
                Delivery Address *
              </label>
              <input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="Street, number, city"
                className={inputClasses('address')}
                aria-invalid={!!errors.address}
              />
              {errors.address && (
                <p className="text-error text-sm mt-1">{errors.address}</p>
              )}
            </div>
          )}
        </div>
        
        {/* Payment Method */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Payment Method
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('card')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                paymentMethod === 'card'
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h3m-6-8h16a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Card</span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`p-3 rounded-lg border-2 text-center transition-colors ${
                paymentMethod === 'cash'
                  ? 'border-brand-red bg-red-50 text-brand-red'
                  : 'border-neutral-200 hover:border-neutral-300'
              }`}
            >
              <div className="flex items-center justify-center mb-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium">Cash</span>
            </button>
          </div>
        </div>
        
        {/* Special Instructions */}
        <div>
          <label htmlFor="instructions" className="block text-sm font-medium text-neutral-700 mb-1">
            Special Instructions
          </label>
          <textarea
            id="instructions"
            value={formData.instructions}
            onChange={(e) => handleInputChange('instructions', e.target.value)}
            placeholder="Any special requests for your order?"
            rows={3}
            className={`w-full rounded-lg border px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-red focus:border-transparent border-neutral-300 resize-none`}
          />
        </div>
        
        {/* Order Summary */}
        <div className="bg-neutral-100 rounded-lg p-4">
          <h4 className="font-semibold text-neutral-900 text-sm mb-3">Order Summary</h4>
          <div className="space-y-2 text-sm">
            {cart.items.map((item) => (
              <div key={item.product.id} className="flex justify-between">
                <span className="text-neutral-700">
                  {item.quantity}x {item.product.name}
                </span>
                <span className="font-medium">
                  {formatPrice(item.product.price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between pt-2 border-t border-neutral-200 mt-2">
              <span className="font-medium">Subtotal</span>
              <span>{formatPrice(cart.total)}</span>
            </div>
            {deliveryType === 'delivery' && (
              <div className="flex justify-between">
                <span className="font-medium">Delivery Fee</span>
                <span>{formatPrice(299)}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-neutral-200 font-bold text-lg">
              <span>Total</span>
              <span className="text-brand-red">
                {formatPrice(
                  cart.total + (deliveryType === 'delivery' ? 299 : 0)
                )}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="ghost"
            onClick={onBack}
            className="flex-1"
            type="button"
          >
            Back
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-1"
            isLoading={isSubmitting}
          >
            Place Order
          </Button>
        </div>
      </form>
    </div>
  );
}