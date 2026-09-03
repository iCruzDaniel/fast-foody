import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthSession } from '../api/auth';
import {
  loginCustomer as apiLoginCustomer,
  loginStaff as apiLoginStaff,
  registerCustomer as apiRegisterCustomer,
  logout as apiLogout,
  getCurrentUser,
} from '../api/auth';

interface AuthContextType {
  session: AuthSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  loginCustomer: (input: { phone: string; nationality: string; password: string }) => Promise<void>;
  loginStaff: (input: { username: string; password: string }) => Promise<void>;
  registerCustomer: (input: { name: string; phone: string; nationality: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  customerId: string | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');

  const refresh = async () => {
    setStatus('loading');
    try {
      const user = await getCurrentUser();
      setSession(user);
      setStatus(user ? 'authenticated' : 'unauthenticated');
    } catch {
      setSession(null);
      setStatus('unauthenticated');
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const loginCustomer = async (input: { phone: string; nationality: string; password: string }) => {
    const user = await apiLoginCustomer(input);
    setSession(user);
    setStatus('authenticated');
  };

  const loginStaff = async (input: { username: string; password: string }) => {
    const user = await apiLoginStaff(input);
    setSession(user);
    setStatus('authenticated');
  };

  const registerCustomer = async (input: { name: string; phone: string; nationality: string; password: string }) => {
    const user = await apiRegisterCustomer(input);
    setSession(user);
    setStatus('authenticated');
  };

  const logout = async () => {
    await apiLogout();
    setSession(null);
    setStatus('unauthenticated');
  };

  const customerId = session?.role === 'CUSTOMER' ? session.id : undefined;

  const value = {
    session,
    status,
    loginCustomer,
    loginStaff,
    registerCustomer,
    logout,
    refresh,
    customerId,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useCustomerId(): string | undefined {
  const { customerId } = useAuth();
  return customerId;
}

export function useIsStaff(): boolean {
  const { session } = useAuth();
  return session?.role === 'STAFF' || session?.role === 'ADMIN';
}

export function useIsAdmin(): boolean {
  const { session } = useAuth();
  return session?.role === 'ADMIN';
}

export function useIsCustomer(): boolean {
  const { session } = useAuth();
  return session?.role === 'CUSTOMER';
}