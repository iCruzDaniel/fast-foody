import type { Product } from '../../types';
import { formatPrice } from '../../utils';
import { QuantitySelector } from '../ui/QuantitySelector';

interface CartItemCardProps {
  product: Product;
  quantity: number;
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
  className?: string;
}

export function CartItemCard({
  product,
  quantity,
  onQuantityChange,
  onRemove,
  className = '',
}: CartItemCardProps) {
  const lineTotal = product.price * quantity;
  
  return (
    <div className={`flex gap-4 py-4 border-b border-neutral-200 last:border-0 ${className}`}>
      {/* Item image */}
      <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-100 flex-shrink-0">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Item details */}
      <div className="flex-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-semibold text-neutral-900 text-sm">{product.name}</h4>
            <p className="text-sm text-neutral-600">{formatPrice(product.price)} each</p>
          </div>
          <button
            onClick={() => onRemove(product.id)}
            className="text-neutral-400 hover:text-error transition-colors p-1"
            aria-label={`Remove ${product.name} from cart`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            quantity={quantity}
            onQuantityChange={(q) => onQuantityChange(product.id, q)}
            size="sm"
          />
          <span className="font-bold text-neutral-900">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  );
}