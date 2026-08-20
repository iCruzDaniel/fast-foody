# AGENTS.md

## Project Overview

**Fast Foodiy** — REST API for restaurant order management (menu catalog + order lifecycle).  
Full spec: `SDD-fast-foodiy.md` (read this before making architectural decisions).

**Stack:** Node.js 20+ / TypeScript (strict) / Express / PostgreSQL / Prisma / Docker / Zod / Vitest

## Architecture: Hexagonal (Ports & Adapters) + DDD

Single Bounded Context: "Ordering" (Products + Orders).

### Dependency Rule (NON-NEGOTIABLE)

```
domain ← application ← infrastructure (never the reverse)
```

- `src/domain/**` and `src/application/**` must NEVER import `express`, `@prisma/client`, `docker`, or any infra library
- Only `src/infrastructure/container/` (composition root) wires everything together
- Prisma types (`Prisma.*`, `PrismaClient`) are confined to `src/infrastructure/adapters/out/persistence/postgres/**` ONLY

### Folder Structure

```
src/
├── domain/              # Pure business logic (entities, VOs, events, services, repository ports)
│   ├── order/           # Order aggregate (root), OrderItem, OrderStatus, events
│   ├── product/         # Product aggregate
│   └── customer/        # Customer entity
├── application/         # Use cases (orchestration only, no business rules)
│   ├── order/use-cases/
│   └── product/use-cases/
├── infrastructure/
│   ├── adapters/in/http/    # Controllers, routes, DTOs (zod), middlewares
│   ├── adapters/out/persistence/in-memory/  # For tests + dev without DB
│   ├── adapters/out/persistence/postgres/   # Prisma repositories + mappers
│   ├── adapters/out/events/                 # ConsoleEventPublisher
│   ├── config/            # env.ts, db.ts
│   └── container/         # Composition root (DI wiring)
├── shared/kernel/       # Entity, ValueObject, AggregateRoot, DomainError base classes
└── server.ts            # Bootstrap
```

### Key Domain Rules

- **Money** = value object with `amount` (integer, cents) + `currency` — never use raw `number` for prices
- **OrderStatus** transitions are strict: `PENDING → CONFIRMED → IN_PREPARATION → READY → DELIVERED` (or `CANCELLED` from any non-terminal state)
- **OrderItem** snapshots `productName` and `unitPrice` at creation — never re-fetch from Product
- Entities use `private readonly` properties with getters — no public mutable fields
- Domain events are emitted but not persisted (console-logged only)

### Prisma ↔ Domain Boundary

- `prisma/schema.prisma` models flat tables (`Order`, `OrderItem`, `Product`, `Customer`)
- `Money` → two columns: `amount Int`, `currency String`
- `OrderStatus` → Prisma enum, mapped to/from domain enum in adapter
- Every Prisma repo implements `toDomain(prismaModel)` and `toPersistence(entity)` private methods
- `Prisma.OrderGetPayload<...>` and similar types MUST NOT leak outside postgres adapter

## Developer Commands

<!-- Update these once package.json exists -->

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Dev (in-memory) | `PERSISTENCE_DRIVER=memory npm run dev` |
| Dev (postgres) | `docker-compose up` (runs migrations + starts API + DB) |
| Build | `npx tsc --noEmit` |
| Test (all) | `npx vitest` |
| Test (single file) | `npx vitest run tests/unit/domain/order.test.ts` |
| Prisma generate | `npx prisma generate` |
| Prisma migrate | `npx prisma migrate dev --name <name>` |

## Environment

Copy `.env.example` → `.env`. Key variables:
- `PERSISTENCE_DRIVER=memory|postgres` — selects adapter at composition root
- `DATABASE_URL` — PostgreSQL connection string (required for postgres driver)
- `PORT` — API port (default: 3000)

## Testing

- **Unit tests** (`tests/unit/domain/`) — pure domain logic, no mocks needed
- **Use case tests** (`tests/unit/application/`) — use `InMemoryRepository` adapters, no Docker
- Integration tests with real PostgreSQL are out of scope for now

## API

Base path: `/api/v1`  
Error mapping: `DomainError` → 400, not found → 404, invalid state transition → 409

## Out of Scope (don't build these)

Auth, payments, delivery/tracking, event sourcing/CQRS, multi-tenancy, message queues
