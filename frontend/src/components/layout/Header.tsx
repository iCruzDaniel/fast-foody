import type { ReactNode } from 'react';

interface HeaderProps {
  children?: ReactNode;
  className?: string;
}

export function Header({ children, className = '' }: HeaderProps) {
  return (
    <header className={`sticky top-0 z-50 bg-white border-b border-neutral-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {children}
        </div>
      </div>
    </header>
  );
}

interface LogoProps {
  className?: string;
}

export function Logo({ className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="w-10 h-10 bg-brand-red rounded-lg flex items-center justify-center">
        <span className="text-white font-bold text-xl">FF</span>
      </div>
      <span className="text-xl font-bold text-neutral-900">Fast Foodiy</span>
    </div>
  );
}

interface CartButtonProps {
  itemCount: number;
  onClick?: () => void;
  className?: string;
}

export function CartButton({ itemCount, onClick, className = '' }: CartButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`relative p-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors ${className}`}
      aria-label={`Cart with ${itemCount} items`}
    >
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-red text-white text-xs font-bold rounded-full flex items-center justify-center">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </button>
  );
}