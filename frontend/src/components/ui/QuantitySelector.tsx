import { Button } from './Button';

interface QuantitySelectorProps {
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  min?: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function QuantitySelector({
  quantity,
  onQuantityChange,
  min = 1,
  max = 99,
  size = 'md',
}: QuantitySelectorProps) {
  const handleDecrement = () => {
    if (quantity > min) {
      onQuantityChange(quantity - 1);
    }
  };
  
  const handleIncrement = () => {
    if (quantity < max) {
      onQuantityChange(quantity + 1);
    }
  };
  
  const buttonSize = size === 'sm' ? 'w-8 h-8 text-sm' : size === 'lg' ? 'w-12 h-12 text-lg' : 'w-10 h-10';
  const textSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-lg';
  
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDecrement}
        disabled={quantity <= min}
        className={`${buttonSize} rounded-full border border-neutral-200 p-0`}
        aria-label="Decrease quantity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      </Button>
      
      <span className={`${textSize} font-semibold w-8 text-center`} aria-label={`Quantity: ${quantity}`}>
        {quantity}
      </span>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={handleIncrement}
        disabled={quantity >= max}
        className={`${buttonSize} rounded-full border border-neutral-200 p-0`}
        aria-label="Increase quantity"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </Button>
    </div>
  );
}