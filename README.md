# Fast Foodiy API

REST API para gestionar el ciclo de vida de pedidos de un restaurante de comida rápida: catálogo de productos y órdenes de clientes, desde su creación hasta su entrega o cancelación.

## Stack

- **Runtime:** Node.js 20+ / TypeScript (strict)
- **Framework:** Express
- **ORM:** Prisma (PostgreSQL)
- **Validación:** Zod
- **Testing:** Vitest
- **Infra:** Docker + docker-compose

## Arquitectura: Hexagonal (Ports & Adapters) + DDD

```
src/
├── domain/                    # Lógica de negocio pura (sin dependencias externas)
│   ├── order/                 # Agregado Order (raíz), OrderItem, OrderStatus, eventos
│   ├── product/               # Agregado Product
│   └── customer/              # Entidad Customer
├── application/               # Use Cases (orquestación, sin reglas de negocio)
│   ├── order/use-cases/       # 6 use cases de Order
│   └── product/use-cases/     # 5 use cases de Product
├── infrastructure/
│   ├── adapters/in/http/      # Controllers, routes, DTOs (Zod), middlewares
│   ├── adapters/out/persistence/
│   │   ├── in-memory/         # Repos en Map (tests + dev sin DB)
│   │   └── postgres/          # Repos Prisma + mappers toDomain/toPersistence
│   ├── adapters/out/events/   # ConsoleEventPublisher
│   ├── config/                # env.ts, db.ts
│   └── container/             # Composition root (DI wiring)
├── shared/kernel/             # Entity, ValueObject, AggregateRoot, DomainError
└── server.ts                  # Bootstrap
```

### Regla de dependencias

```
domain ← application ← infrastructure (nunca al revés)
```

- `src/domain/**` y `src/application/**` **nunca** importan Express, Prisma, ni Docker
- Solo `src/infrastructure/container/` une todo (composition root)
- Prisma types (`Prisma.*`, `PrismaClient`) confinados a `src/infrastructure/adapters/out/persistence/postgres/**`

## Arranque rápido

### Con Docker (recominado)

```bash
cp .env.example .env
docker-compose up
```

Levanta PostgreSQL + API. Las migraciones de Prisma se ejecutan automáticamente.

### Sin Docker (solo memoria)

```bash
npm install
PERSISTENCE_DRIVER=memory npm run dev
```

## Comandos

| Acción | Comando |
|--------|---------|
| Instalar dependencias | `npm install` |
| Dev (memoria) | `PERSISTENCE_DRIVER=memory npm run dev` |
| Dev (PostgreSQL) | `docker-compose up` |
| Type check | `npm run build` |
| Tests | `npm test` |
| Tests (watch) | `npm run test:watch` |
| Prisma generate | `npm run prisma:generate` |
| Prisma migrate | `npm run prisma:migrate -- --name <nombre>` |

## API

Base path: `/api/v1`

### Productos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/products` | Crear producto |
| `GET` | `/products` | Listar productos (filtros: `category`, `available`) |
| `GET` | `/products/:id` | Obtener producto |
| `PATCH` | `/products/:id/price` | Cambiar precio |
| `PATCH` | `/products/:id/availability` | Alternar disponibilidad |

### Pedidos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/orders` | Crear pedido |
| `GET` | `/orders` | Listar pedidos (filtro: `status`) |
| `GET` | `/orders/:id` | Obtener pedido |
| `PATCH` | `/orders/:id/confirm` | Confirmar pedido |
| `PATCH` | `/orders/:id/status` | Avanzar estado |
| `PATCH` | `/orders/:id/cancel` | Cancelar pedido |

### Errores

| HTTP Status | Significado |
|-------------|-------------|
| 400 | `DomainError` (regla de negocio violada) o validación Zod |
| 404 | Recurso no encontrado |
| 409 | Transición de estado inválida |
| 500 | Error interno |

## Modelo de dominio

### Value Objects

| VO | Descripción |
|----|-------------|
| `OrderId` / `ProductId` / `CustomerId` | UUID v4 |
| `Money` | `amount` (centavos, entero) + `currency` (string) |
| `Quantity` | Entero 1-50 |
| `OrderStatus` | PENDING → CONFIRMED → IN_PREPARATION → READY → DELIVERED (o CANCELLED) |
| `ProductCategory` | BURGERS, SIDES, DRINKS, DESSERTS, COMBOS |

### Entidades

- **Product** — Catálogo del menú (nombre, precio, categoría, disponibilidad)
- **Order** — Agregado raíz. Contiene OrderItems, tiene ciclo de vida con transiciones estrictas
- **OrderItem** — Línea dentro de un pedido. Snapshot de nombre y precio al momento de crear
- **Customer** — Cliente (nombre + teléfono, modelado mínimamente)

### Eventos de dominio

- `OrderCreated` / `OrderConfirmed` / `OrderStatusChanged` / `OrderCancelled`

Se emiten pero no se persisten (solo `console.log` vía `ConsoleEventPublisher`).

## Variable de entorno `PERSISTENCE_DRIVER`

| Valor | Adaptador |
|-------|-----------|
| `memory` | `InMemory*Repository` (Map en memoria, sin DB) |
| `postgres` | `Prisma*Repository` (PostgreSQL vía Prisma) |

Cambiar de `memory` a `postgres` **no requiere modificar** `domain/` ni `application/` — ese es el punto de la arquitectura hexagonal.

## Testing

```bash
npm test              # Ejecuta todos los tests
npm run test:watch    # Modo watch
```

- `tests/unit/domain/` — Tests puros de dominio (Money, OrderStatus, Order, Product)
- `tests/unit/application/` — Tests de use cases con `InMemoryRepository` (sin Docker)
