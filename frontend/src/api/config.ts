/**
 * API configuration.
 *
 * In the browser, requests go to `/api/v1/...` which the Vite dev server
 * proxies to the backend (see vite.config.ts). In production you can override
 * the base URL with the VITE_API_URL env var (e.g. a CDN-facing origin).
 */
const rawApiUrl = import.meta.env.VITE_API_URL as string | undefined;
export const API_BASE_URL = rawApiUrl && rawApiUrl.trim() !== '' ? rawApiUrl : '/api/v1';

/**
 * Demo mode flag - enables demo autologin buttons on the login page.
 * Controlled by VITE_DEMO_MODE environment variable.
 */
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Walk-in customer used for orders placed from the customer app.
 *
 * The backend does not expose a customer-creation endpoint and enforces that
 * the `customerId` on `POST /orders` references an existing customer
 * (`CreateOrderUseCase` returns CUSTOMER_NOT_FOUND otherwise). This id matches
 * the "Maria Lopez" customer created by `npm run seed` in the upstash store.
 *
 * If you re-seed a fresh store, update this constant to one of the customer
 * ids printed by the seed script.
 */
export const WALK_IN_CUSTOMER_ID = '4624cdb0-e151-45bb-a39f-07971a1243ab';
