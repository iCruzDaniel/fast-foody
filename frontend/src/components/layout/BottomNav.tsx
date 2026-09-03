import type { ReactNode } from 'react';

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: number;
}

interface BottomNavProps {
  items: NavItem[];
  activeItem: string;
  onItemSelect: (id: string) => void;
  className?: string;
}

export function BottomNav({ items, activeItem, onItemSelect, className = '' }: BottomNavProps) {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 ${className}`}>
      <div className="max-w-lg mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemSelect(item.id)}
              className={`flex flex-col items-center justify-center flex-1 h-full transition-colors ${
                activeItem === item.id
                  ? 'text-brand-red'
                  : 'text-neutral-500 hover:text-neutral-700'
              }`}
              aria-label={item.label}
              aria-current={activeItem === item.id ? 'page' : undefined}
            >
              <div className="relative">
                {item.icon}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-red text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// Predefined icons for common navigation items
export const NavIcons = {
  menu: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  cart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  orders: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  profile: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
};