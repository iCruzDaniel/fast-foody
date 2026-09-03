import { useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header, Logo, CartButton } from './Header';
import { BottomNav, NavIcons } from './BottomNav';
import { useCart } from '../../hooks/useCart';
import { AuthStatus } from '../auth/AuthStatus';

interface CustomerLayoutProps {
  currentPage: 'menu' | 'cart' | 'checkout' | 'confirmation' | 'orders';
  children: ReactNode;
}

export function CustomerLayout({ currentPage, children }: CustomerLayoutProps) {
  const navigate = useNavigate();
  const { itemCount, closeCart } = useCart();

  const go = useCallback(
    (page: string) => {
      closeCart();
      navigate(`/${page}`);
    },
    [navigate, closeCart]
  );

  const navItems = [
    { id: 'menu', label: 'Menu', icon: NavIcons.menu },
    { id: 'cart', label: 'Cart', icon: NavIcons.cart, badge: itemCount },
    { id: 'orders', label: 'Orders', icon: NavIcons.orders },
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header (desktop) */}
      <Header>
        <Logo />
        <div className="hidden sm:flex items-center gap-6">
          <nav className="flex items-center gap-4">
            <button
              onClick={() => go('')}
              className={`text-sm font-medium transition-colors ${currentPage === 'menu' ? 'text-brand-red' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Menu
            </button>
            <button
              onClick={() => go('orders')}
              className={`text-sm font-medium transition-colors ${currentPage === 'orders' ? 'text-brand-red' : 'text-neutral-600 hover:text-neutral-900'}`}
            >
              Orders
            </button>
            <button
              onClick={() => navigate('/staff')}
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Staff
            </button>
          </nav>
          <div className="flex items-center gap-3">
            <CartButton itemCount={itemCount} onClick={() => go('cart')} />
            <AuthStatus />
          </div>
        </div>
      </Header>

      {/* Main content */}
      <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 lg:pb-12 ${currentPage === 'confirmation' || currentPage === 'cart' ? 'lg:pb-24' : ''}`}>
        {children}
      </main>

      {/* Mobile bottom nav + staff toggle */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40">
        <div className="flex items-center justify-between px-4 py-2 bg-white border-t border-neutral-200">
          <AuthStatus className="flex-1" />
          <button
            onClick={() => navigate('/staff')}
            className="flex-1 py-2 bg-neutral-900 text-white text-sm font-semibold flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Staff Console
          </button>
        </div>
      </div>

      <BottomNav
        items={navItems}
        activeItem={currentPage === 'checkout' || currentPage === 'confirmation' ? 'menu' : currentPage}
        onItemSelect={go}
      />
    </div>
  );
}
