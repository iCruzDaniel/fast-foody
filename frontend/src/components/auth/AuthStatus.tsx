import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { NavLink } from 'react-router-dom';

interface AuthStatusProps {
  className?: string;
}

export function AuthStatus({ className = '' }: AuthStatusProps) {
  const { session, status, logout } = useAuth();

  if (status === 'loading') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="w-8 h-8 rounded-full bg-neutral-200 animate-pulse" />
        <div className="w-24 h-4 rounded bg-neutral-200 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return (
      <NavLink
        to="/login"
        className={`px-3 py-1.5 text-sm font-semibold text-brand-red hover:bg-red-50 rounded-lg transition-colors ${className}`}
      >
        Login
      </NavLink>
    );
  }

  const handleLogout = async () => {
    await logout();
  };

  if (session.role === 'CUSTOMER') {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="hidden sm:block flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
          <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span className="text-sm font-medium text-neutral-900">{session.name}</span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
        >
          Logout
        </Button>
      </div>
    );
  }

  // Staff/Admin
  const roleLabel = session.staffRole === 'ADMIN' ? 'Admin' : 'Staff';
  const roleColor = session.staffRole === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800';

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="hidden sm:block flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-lg">
        <svg className="w-5 h-5 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        <span className="text-sm font-medium text-neutral-900">{session.username}</span>
        <span className={`px-1.5 py-0.5 text-xs font-semibold rounded-full ${roleColor}`}>
          {roleLabel}
        </span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={handleLogout}
        className="text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100"
      >
        Logout
      </Button>
    </div>
  );
}