import type { Product } from '../../types';
import { Card, CardContent, CardImage, CardPrice } from '../ui/Card';
import { Button } from '../ui/Button';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  className?: string;
}

export function ProductCard({ product, onAddToCart, className = '' }: ProductCardProps) {
  return (
    <Card hover={false} className={`flex flex-col ${className}`}>
      <CardImage src={product.imageUrl} alt={product.name} />
      
      <CardContent className="flex-1 flex flex-col">
        <div className="flex-1">
          <h3 className="font-semibold text-neutral-900 text-base leading-snug">
            {product.name}
          </h3>
          <p className="text-sm text-neutral-600 mt-1 line-clamp-2">
            {product.description}
          </p>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <CardPrice amount={product.price} currency={product.currency} />
          <Button
            size="sm"
            onClick={() => onAddToCart(product)}
            aria-label={`Add ${product.name} to cart`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="ml-1">Add</span>
          </Button>
        </div>
      </CardContent>
      
      {!product.available && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <span className="bg-neutral-900 text-white text-sm font-semibold px-4 py-2 rounded-full">
            Sold Out
          </span>
        </div>
      )}
    </Card>
  );
}

interface ProductGridProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
  className?: string;
}

export function ProductGrid({ products, onAddToCart, className = '' }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="font-semibold text-neutral-900 mb-1">No items found</h3>
        <p className="text-neutral-600 text-sm">Try selecting a different category</p>
      </div>
    );
  }
  
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
        />
      ))}
    </div>
  );
}