# Fast Foodiy Frontend

Customer ordering web interface for the Fast Foodiy restaurant order management system.

## Features

- **Menu Browsing** - Browse products by category with filters
- **Cart Management** - Add/remove items, adjust quantities, inline totals
- **Checkout Flow** - Customer info, delivery type selection, payment method, order summary
- **Order Tracking** - Real-time status tracker with progress indicators
- **Responsive Design** - Mobile-first with bottom navigation on phones, persistent cart on desktop

## Interfaces & Routes

The app is split into two separate experiences, each accessible by its own URL:

### Customer Ordering (default)
| Route | Description |
|-------|-------------|
| `/` | Menu browsing |
| `/cart` | Shopping cart |
| `/checkout` | Customer info + order placement |
| `/confirmation` | Order confirmation after checkout |
| `/orders` | Order history / tracking |

### Staff Console (Dashboard + Admin)
| Route | Description |
|-------|-------------|
| `/staff` | Dashboard overview (metrics + active orders) |
| `/staff/orders` | Order management table with status filters |
| `/staff/kitchen` | Kitchen Display with live timers |
| `/staff/products` | Product catalog CRUD (admin panel) |

To open a specific interface directly, just visit its URL (e.g. `http://localhost:5174/staff/orders`). The staff console is also reachable from the header "Staff" button (desktop) or the "Staff Console" bar (mobile).

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type-safe development
- **Vite** - Fast build tooling
- **Tailwind CSS v4** - Utility-first styling with custom design tokens

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173 to see the app.

## Connecting to the Backend API

The frontend currently uses mock data in `src/api/menu.ts`. To connect to the real Fast Foodiy API:

1. Start the backend with `PERSISTENCE_DRIVER=memory npm run dev`
2. Update `src/api/menu.ts` to use `fetch` calls to `http://localhost:3000/api/v1`
3. Configure the API base URL in a `.env` file

### API Endpoints

- `GET /api/v1/products` - List all products
- `POST /api/v1/orders` - Create a new order
- `GET /api/v1/orders/:id` - Get order status

## Project Structure

```
src/
├── api/          # API functions and mock data
├── components/
│   ├── cart/     # Cart-related components
│   ├── checkout/ # Checkout form
│   ├── layout/   # Header, navigation
│   ├── menu/     # Product cards, category tabs
│   ├── orders/   # Order history, status tracker
│   └── ui/       # Reusable UI primitives
├── hooks/        # Custom React hooks (useCart)
├── pages/        # Page-level components
├── types/        # TypeScript type definitions
└── utils/        # Helper functions
```

## Design System

The interface follows a bold, modern fast-food aesthetic inspired by Chipotle, McDonald's, and Taco Bell:

- **Primary**: Brand red `#E31837`
- **Accent**: Green `#006B3F`, Orange `#FF6B35`
- **Type**: Inter font family
- **Spacing**: 8px grid system
- **Motion**: Subtle micro-interactions with reduced-motion support