import { useState, type ReactNode } from 'react';

export type StaffPage = 'dashboard' | 'orders' | 'kitchen' | 'products';

interface StaffLayoutProps {
  activePage: StaffPage;
  onNavigate: (page: StaffPage) => void;
  onExit: () => void;
  children: ReactNode;
}

interface NavItem {
  id: StaffPage;
  label: string;
  icon: ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    id: 'orders',
    label: 'Orders',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    id: 'kitchen',
    label: 'Kitchen Display',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h3m-6-8h16a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V8a1 1 0 011-1z" />
      </svg>
    ),
  },
  {
    id: 'products',
    label: 'Products',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
];

export function StaffLayout({ activePage, onNavigate, onExit, children }: StaffLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <div className="h-full flex flex-col bg-neutral-900 text-white">
      <div className="px-5 py-5 border-b border-neutral-800">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-brand-red rounded-lg flex items-center justify-center font-bold">
            FF
          </div>
          <div>
            <p className="font-bold leading-tight">Fast Foodiy</p>
            <p className="text-xs text-neutral-400">Staff Console</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.id === activePage;
          return (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-red text-white'
                  : 'text-neutral-300 hover:bg-neutral-800 hover:text-white'
              }`}
              aria-current={active ? 'page' : undefined}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-neutral-800">
        <button
          onClick={onExit}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-800 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Ordering
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <aside className="hidden lg:block w-60 flex-shrink-0 h-screen sticky top-0">
        {sidebar}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden animate-fade-in" aria-hidden="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-64 animate-slide-in-right" style={{ animationDirection: 'reverse' }}>
            {sidebar}
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-3 flex items-center justify-between lg:hidden">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label="Open staff menu"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <span className="font-semibold text-neutral-900">Staff Console</span>
          <button
            onClick={onExit}
            className="p-2 rounded-lg text-neutral-700 hover:bg-neutral-100"
            aria-label="Exit staff mode"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
