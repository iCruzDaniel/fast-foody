import { API_BASE_URL } from './config';
import { ApiError, getErrorMessage } from './menu';

export type AuthRole = 'CUSTOMER' | 'STAFF' | 'ADMIN';

export interface CustomerSession {
  role: 'CUSTOMER';
  id: string;
  name: string;
  phone: string;
  nationality: string;
}

export interface StaffSession {
  role: 'STAFF' | 'ADMIN';
  id: string;
  username: string;
  staffRole: 'STAFF' | 'ADMIN';
}

export type AuthSession = CustomerSession | StaffSession;

interface RegisterCustomerInput {
  name: string;
  phone: string;
  nationality: string;
  password: string;
}

interface LoginCustomerInput {
  phone: string;
  nationality: string;
  password: string;
}

interface LoginStaffInput {
  username: string;
  password: string;
}

interface RegisterStaffInput {
  username: string;
  password: string;
}

interface MeResponseCustomer {
  role: 'CUSTOMER';
  customer: {
    id: string;
    name: string;
    phone: string;
    nationality: string;
  };
}

interface MeResponseStaff {
  role: 'STAFF' | 'ADMIN';
  staff: {
    id: string;
    username: string;
    role: 'STAFF' | 'ADMIN';
  };
}

type MeResponse = MeResponseCustomer | MeResponseStaff;

async function authRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    ...init,
  });

  if (!res.ok) {
    let body: { error?: string; message?: string } = {};
    try {
      body = (await res.json()) as { error?: string; message?: string };
    } catch {
      // ignore parse errors
    }
    throw new ApiError(
      body.message ?? 'Request failed',
      body.error ?? 'REQUEST_FAILED',
      res.status
    );
  }

  return (await res.json()) as T;
}

export async function registerCustomer(input: RegisterCustomerInput): Promise<CustomerSession> {
  const data = await authRequest<{ customer: { id: string; name: string; phone: string; nationality: string } }>(
    '/auth/register-customer',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return {
    role: 'CUSTOMER',
    id: data.customer.id,
    name: data.customer.name,
    phone: data.customer.phone,
    nationality: data.customer.nationality,
  };
}

export async function loginCustomer(input: LoginCustomerInput): Promise<CustomerSession> {
  const data = await authRequest<{ customer: { id: string; name: string; phone: string; nationality: string } }>(
    '/auth/login/customer',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return {
    role: 'CUSTOMER',
    id: data.customer.id,
    name: data.customer.name,
    phone: data.customer.phone,
    nationality: data.customer.nationality,
  };
}

export async function loginStaff(input: LoginStaffInput): Promise<StaffSession> {
  const data = await authRequest<{ staff: { id: string; username: string; role: 'STAFF' | 'ADMIN' } }>(
    '/auth/login/staff',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return {
    role: data.staff.role,
    id: data.staff.id,
    username: data.staff.username,
    staffRole: data.staff.role,
  };
}

export async function registerStaff(input: RegisterStaffInput): Promise<StaffSession> {
  const data = await authRequest<{ staff: { id: string; username: string; role: 'STAFF' | 'ADMIN' } }>(
    '/auth/register-staff',
    {
      method: 'POST',
      body: JSON.stringify(input),
    }
  );
  return {
    role: data.staff.role,
    id: data.staff.id,
    username: data.staff.username,
    staffRole: data.staff.role,
  };
}

export async function logout(): Promise<void> {
  await authRequest<{ ok: boolean }>('/auth/logout', {
    method: 'POST',
  });
}

export async function getCurrentUser(): Promise<AuthSession | null> {
  try {
    const data = await authRequest<MeResponse>('/auth/me');
    if (data.role === 'CUSTOMER') {
      return {
        role: 'CUSTOMER',
        id: data.customer.id,
        name: data.customer.name,
        phone: data.customer.phone,
        nationality: data.customer.nationality,
      };
    }
    return {
      role: data.role,
      id: data.staff.id,
      username: data.staff.username,
      staffRole: data.staff.role,
    };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401 && err.code === 'UNAUTHENTICATED') {
      return null;
    }
    throw err;
  }
}

export { ApiError, getErrorMessage };