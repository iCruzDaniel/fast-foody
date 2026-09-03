# Fast Foodiy - Product Context

## Product Overview

**Fast Foodiy** is a modern restaurant order management system built with a hexagonal architecture (Ports & Adapters) following Domain-Driven Design principles. The system handles menu catalog, complete order lifecycle, and role-based authentication for fast food restaurants.

## Core Product

- **Type**: REST API + Customer Web Interface + Staff/Admin Console
- **Stack**: Node.js / TypeScript / Express / PostgreSQL / Prisma / Docker / Upstash Redis
- **Frontend**: React + Vite + Tailwind CSS
- **Architecture**: Hexagonal Architecture (Ports & Adapters) + DDD
- **Auth**: CUSTOMER / STAFF / ADMIN roles, session cookie (`ff_session`) + JWT HS256, bcryptjs

## Users

### Primary Users
- **Customers** - Browse menu, place orders (login con teléfono + nacionalidad + password), track delivery
- **Restaurant Staff** - Manage orders, update status, handle operations (login username + password)
- **Admin/Managers** - Full system control, menu management, register staff accounts (only ADMIN can register staff)

### User Journeys
1. **Customer**: Login/Register → Browse menu → Add to cart → Checkout → Track order
2. **Kitchen Staff**: Login → View incoming orders → Update preparation status
3. **Admin**: Login → Register staff → Manage menu items → Monitor orders → System configuration

### Roles & Access

| Rol | Login | Acceso |
|-----|-------|--------|
| `CUSTOMER` | `phone + nationality (+57) + password` | Catálogo, carrito, checkout, pedidos propios |
| `STAFF` | `username + password` | Consola staff (pedidos, cocina) |
| `ADMIN` | `username + password` | Staff + gestión de productos + registro de staff |

## Business Domain

Single Bounded Context: "Ordering" (Products + Orders) + sub-contexto "Auth"

### Key Business Rules
- **OrderStatus** transitions are strict: `PENDING → CONFIRMED → IN_PREPARATION → READY → DELIVERED` (or `CANCELLED` from any non-terminal state)
- **Money** = value object with `amount` (integer, cents) + `currency`
- **OrderItem** snapshots `productName` and `unitPrice` at creation
- **Solo `ADMIN` puede registrar staff** (`POST /api/v1/auth/register-staff` requiere `requireRole(['ADMIN'])`)
- **Sesión** = cookie httpOnly `ff_session` (JWT HS256); no expuesta a JavaScript
- **La autenticación persiste solo en Upstash** (no memory/postgres)

## Features

### Phase 1: Customer Ordering App (SHIPPED)
- Menu browsing with categories and product details
- Cart management (add/remove items, adjust quantities)
- Checkout flow (customer info, delivery type, payment, summary)
- Order tracking with real-time status updates

### Phase 2: Staff Dashboard (SHIPPED)
- Order management dashboard
- Kitchen display system
- Status updates and order flow management

### Phase 3: Admin Panel (SHIPPED)
- Menu and product management
- Register staff accounts
- Product catalog CRUD

### Phase 4: Authentication & Roles (SHIPPED)
- Customer registration + login (phone + nationality + password)
- Staff login (username + password) / admin-only staff registration
- Session cookie `ff_session` con JWT HS256 + bcryptjs
- Frontend con routing por roles (`/staff/*` protegido; cliente redirigido a `/login`)
- Demo mode: autologin buttons + seed de usuarios demo (admin/admin123, staff/staff123, Maria +57/customer123)

## Design Direction

**Style**: Canon Fast Food App (Category Standard)
- **Reference Apps**: Chipotle, McDonald's, Taco Bell
- **Quality Bar**: Match or exceed craft level of reference apps
- **Design System**: 
  - Clean, efficient ordering interface
  - Bold typography with clear hierarchy
  - Appetizing food photography as primary visual
  - Strong category navigation
  - Mobile-first responsive design
  - Fast, scannable menu browsing

**Design Tokens** (to be refined during build):
- Primary: Brand red or green (from reference apps)
- Typography: System fonts for performance, bold headings
- Spacing: Consistent 8px grid system
- Colors: High contrast for accessibility (WCAG AA)

**Responsive**: Mobile-first web app, works on all devices

## Technical Constraints

- Backend API already exists at `/api/v1`
- Prisma schema defines data models
- Domain logic in `src/domain/` with strict dependency rules
- Infrastructure adapters in `src/infrastructure/`
- **La autenticación solo se monta con `PERSISTENCE_DRIVER=upstash`** (los repos auth no existen en `memory`/`postgres`)
- `domain/**` y `application/**` nunca importan Express/Prisma/Upstash
- Vite (frontend) carga env solo de `frontend/.env` y expone únicamente variables `VITE_*`
- Express 4 no captura rechazos de handlers async → se envuelven con `asyncHandler`

## Success Metrics

- Customer can complete full ordering flow in under 2 minutes
- Interface loads in under 3 seconds on mobile
- Clear visual feedback for all user actions
- Intuitive navigation requiring no onboarding