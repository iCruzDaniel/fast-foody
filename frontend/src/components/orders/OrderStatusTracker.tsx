import type { Order, OrderStatus } from '../../types';
import { formatPrice } from '../../utils';
import { StatusBadge } from '../ui/Badge';
import { Button } from '../ui/Button';

interface OrderStatusTrackerProps {
  order: Order;
  orderNumber: string;
  onContinueShopping: () => void;
  className?: string;
}

interface StatusStep {
  status: OrderStatus;
  label: string;
  description: string;
}

const STATUS_STEPS: StatusStep[] = [
  { status: 'PENDING', label: 'Order Received', description: 'Your order has been received' },
  { status: 'CONFIRMED', label: 'Confirmed', description: 'Your order has been confirmed' },
  { status: 'IN_PREPARATION', label: 'Preparing', description: 'The kitchen is preparing your food' },
  { status: 'READY', label: 'Ready', description: 'Your order is ready for pickup' },
  { status: 'DELIVERED', label: 'Delivered', description: 'Your order has been delivered' },
];

// Get current step index based on status
function getStepIndex(status: OrderStatus): number {
  const index = STATUS_STEPS.findIndex((step) => step.status === status);
  return index === -1 ? 0 : index;
}

export function OrderStatusTracker({
  order,
  orderNumber,
  onContinueShopping,
  className = '',
}: OrderStatusTrackerProps) {
  const currentStep = getStepIndex(order.status);
  const isCancelled = order.status === 'CANCELLED';
  
  return (
    <div className={`bg-white rounded-lg border border-neutral-200 p-6 ${className}`}>
      {isCancelled ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-2">Order Cancelled</h2>
          <p className="text-neutral-600 mb-6">Your order was cancelled.</p>
          <Button onClick={onContinueShopping}>Continue Shopping</Button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900">
                Order {orderNumber}
              </h2>
              <p className="text-neutral-600 text-sm mt-1">
                Track your order in real-time
              </p>
            </div>
            <StatusBadge status={order.status} />
          </div>
          
          {/* Order Items */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 text-sm mb-3">Your Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-neutral-700">
                    {item.quantity}x {item.productName}
                  </span>
                  <span className="font-medium">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-3 mt-3 border-t border-neutral-200">
              <span className="font-semibold">Total</span>
              <span className="font-bold text-brand-red">{formatPrice(order.total)}</span>
            </div>
          </div>
          
          {/* Progress Tracker */}
          <div className="mb-6">
            <h3 className="font-semibold text-neutral-900 text-sm mb-4">Order Progress</h3>
            <div className="relative">
              {/* Progress line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-neutral-200" />
              <div
                className="absolute left-5 top-0 w-0.5 bg-brand-red transition-all duration-500"
                style={{
                  height: `${currentStep === 0 ? 0 : (currentStep / (STATUS_STEPS.length - 1)) * 100}%`,
                }}
              />
              
              {/* Steps */}
              <div className="relative space-y-6">
                {STATUS_STEPS.map((step, index) => {
                  const isComplete = index <= currentStep;
                  const isCurrent = index === currentStep;
                  
                  return (
                    <div key={step.status} className="flex items-start gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isComplete
                            ? 'bg-brand-red text-white'
                            : 'bg-neutral-200 text-neutral-500'
                        } ${isCurrent ? 'ring-4 ring-red-100' : ''}`}
                      >
                        {isComplete ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          <span className="text-sm font-semibold">{index + 1}</span>
                        )}
                      </div>
                      <div className={`flex-1 ${isComplete ? '' : 'opacity-50'}`}>
                        <p className={`font-semibold ${isCurrent ? 'text-brand-red' : 'text-neutral-900'}`}>
                          {step.label}
                        </p>
                        <p className="text-sm text-neutral-600">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onContinueShopping}
            >
              Continue Shopping
            </Button>
          </div>
        </>
      )}
    </div>
  );
}