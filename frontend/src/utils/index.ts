// Format price from cents to display string (backend uses COP by default)
export function formatPrice(cents: number, currency = 'COP'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

// Format time estimate
export function formatTimeEstimate(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

// Generate order number
export function generateOrderNumber(): string {
  return `#${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Get status color for order status
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PREPARATION: 'bg-orange-100 text-orange-800',
    READY: 'bg-green-100 text-green-800',
    DELIVERED: 'bg-gray-100 text-gray-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

// Get human-readable status text
export function getStatusText(status: string): string {
  const texts: Record<string, string> = {
    PENDING: 'Pending',
    CONFIRMED: 'Confirmed',
    IN_PREPARATION: 'Preparing',
    READY: 'Ready for Pickup',
    DELIVERED: 'Delivered',
    CANCELLED: 'Cancelled',
  };
  return texts[status] || status;
}

// Debounce function
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}