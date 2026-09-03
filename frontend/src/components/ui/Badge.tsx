import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-neutral-100 text-neutral-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
}

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

export function CategoryBadge({ category, className = '' }: CategoryBadgeProps) {
  const categoryColors: Record<string, string> = {
    BURGERS: 'bg-orange-100 text-orange-800',
    SIDES: 'bg-yellow-100 text-yellow-800',
    DRINKS: 'bg-blue-100 text-blue-800',
    DESSERTS: 'bg-pink-100 text-pink-800',
    COMBOS: 'bg-purple-100 text-purple-800',
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category] || 'bg-neutral-100 text-neutral-800'} ${className}`}
    >
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PREPARATION: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  
  const statusText: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PREPARATION: 'Preparing',
    READY: 'Ready',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-neutral-100 text-neutral-800'} ${className}`}
    >
      {statusText[status] || status}
    </span>
  );
}