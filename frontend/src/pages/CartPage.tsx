import { useCart } from '../hooks/useCart';

interface CartPageProps {
  onCheckout: () => void;
  onContinueShopping: () => void;
}

export function CartPage({ onCheckout, onContinueShopping }: CartPageProps) {
  const { cart, updateQuantity, removeItem } = useCart();

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold text-neutral-900 mb-6">Your Cart</h1>
      
      {cart.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="font-semibold text-neutral-900 mb-1">Your cart is empty</h2>
          <p className="text-neutral-600 text-sm mb-4">
            Browse the menu and add some delicious items!
          </p>
          <button
            onClick={onContinueShopping}
            className="text-brand-red font-medium hover:underline"
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Mobile cart items */}
          <div className="lg:hidden space-y-0">
            {cart.items.map((item) => {
              const lineTotal = item.product.price * item.quantity;
              return (
                <div key={item.product.id} className="flex gap-4 py-4 border-b border-neutral-200">
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                    {item.product.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-100" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-sm">{item.product.name}</h4>
                        <p className="text-sm text-neutral-600">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(item.product.price / 100)}{' '}
                          each
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.product.id)}
                        className="text-neutral-400 hover:text-error p-1"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <QuantityControls
                        quantity={item.quantity}
                        onDecrement={() =>
                          item.quantity <= 1
                            ? removeItem(item.product.id)
                            : updateQuantity(item.product.id, item.quantity - 1)
                        }
                        onIncrement={() =>
                          updateQuantity(item.product.id, item.quantity + 1)
                        }
                      />
                      <span className="font-bold ml-auto">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                        }).format(lineTotal / 100)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop cart with sidebar */}
          <div className="hidden lg:grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {cart.items.map((item) => {
                const lineTotal = item.product.price * item.quantity;
                return (
                  <div key={item.product.id} className="flex gap-4 py-4 border-b border-neutral-200">
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-neutral-100" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold">{item.product.name}</h4>
                          <p className="text-sm text-neutral-600">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(item.product.price / 100)}{' '}
                            each
                          </p>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="text-neutral-400 hover:text-error p-1"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      <div className="flex items-center gap-2 mt-3">
                        <QuantityControls
                          quantity={item.quantity}
                          onDecrement={() =>
                            item.quantity <= 1
                              ? removeItem(item.product.id)
                              : updateQuantity(item.product.id, item.quantity - 1)
                          }
                          onIncrement={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                        />
                        <span className="font-bold ml-auto">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          }).format(lineTotal / 100)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="bg-white rounded-lg border border-neutral-200 p-6 h-fit sticky top-24">
              <h3 className="font-semibold text-neutral-900 mb-4">Order Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(cart.total / 100)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (8%)</span>
                  <span className="font-medium">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(cart.total * 0.08 / 100)}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-neutral-200">
                  <span className="font-semibold">Total</span>
                  <span className="font-bold text-brand-red">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(cart.total * 1.08 / 100)}
                  </span>
                </div>
              </div>
              <button
                onClick={onCheckout}
                className="w-full mt-6 bg-brand-red text-white font-semibold rounded-lg px-4 py-3 hover:bg-red-700 transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

          {/* Mobile checkout button */}
          <div className="lg:hidden fixed bottom-16 left-0 right-0 p-4 bg-white border-t border-neutral-200">
            <button
              onClick={onCheckout}
              className="w-full bg-brand-red text-white font-semibold rounded-lg px-4 py-3 hover:bg-red-700 transition-colors"
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}

interface QuantityControlsProps {
  quantity: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

function QuantityControls({ quantity, onDecrement, onIncrement }: QuantityControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        onClick={onDecrement}
        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
        aria-label="Decrease quantity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </button>
      <span className="font-semibold text-sm w-6 text-center">{quantity}</span>
      <button
        onClick={onIncrement}
        className="w-8 h-8 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100"
        aria-label="Increase quantity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}