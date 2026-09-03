# SDD — Fast Foodiy API
### Software Design Document — Sistema de Gestión de Pedidos para Restaurante de Comida Rápida

**Propósito de este documento:** este SDD es la especificación técnica completa del proyecto **Fast Foodiy**. Está escrito para ser consumido por un agente de IA (OpenCode) que generará el proyecto completo en Node.js, aplicando **Domain-Driven Design (DDD)** y **Arquitectura Hexagonal (Ports & Adapters)**. El documento está segmentado en fases, pero el agente debe generar el proyecto completo en una sola ejecución, respetando el orden de dependencias entre capas.

---

## 1. Resumen del proyecto

**Fast Foodiy** es una API REST para gestionar el ciclo de vida de pedidos de un restaurante de comida rápida: catálogo de productos y órdenes (pedidos) de clientes, desde su creación hasta su entrega o cancelación.

**Objetivo real del proyecto:** no es construir un sistema de producción, sino un **entorno de práctica** para interiorizar:

- Separación estricta entre **dominio**, **aplicación** e **infraestructura**.
- Modelado táctico de DDD: entidades, value objects, agregados, servicios de dominio, eventos de dominio.
- Arquitectura de **puertos y adaptadores**: el dominio no conoce Express, ni PostgreSQL, ni Docker. Solo conoce contratos (interfaces/puertos).
- Intercambiabilidad de adaptadores (ej. pasar de persistencia en memoria a PostgreSQL sin tocar el dominio).

**Stack técnico:**
- Node.js (v20+) con **TypeScript** (`strict: true` en `tsconfig.json`). Los puertos se definen como `interface` reales de TypeScript, no como convención documentada por JSDoc.
- Express como framework HTTP (adaptador de entrada).
- PostgreSQL como persistencia (adaptador de salida), vía Docker.
- **Prisma** como ORM para el adaptador de persistencia de PostgreSQL — ver sección 6.2 para las reglas de cómo convive Prisma con la pureza del dominio (los modelos de Prisma **nunca** se filtran fuera del adaptador).
- Docker + docker-compose para levantar API + base de datos.
- Validación con `zod`.
- Tests con `vitest`.

---

## 2. Bounded Context

Para mantener el proyecto simple pero honesto con DDD, se define **un único Bounded Context**: **"Gestión de Pedidos" (Ordering)**, que contiene varios sub-modelos cohesionados:

- **Catálogo (Product)**: productos que el restaurante vende.
- **Pedidos (Order)**: el agregado principal del sistema.
- **Autenticación (Auth)**: cuentas de cliente y de staff con roles, y sesiones (añadido en esta fase).

> No se modela Facturación, Pagos, ni Delivery como contextos separados — quedan fuera de alcance (ver sección 11, "Fuera de alcance").

### Lenguaje ubicuo (glosario)

| Término | Significado |
|---|---|
| **Producto (Product)** | Ítem del menú que puede pedirse (ej. hamburguesa, papas, gaseosa). |
| **Pedido (Order)** | Solicitud de un cliente que agrupa uno o más ítems de producto. Es el **agregado raíz**. |
| **Línea de pedido (OrderItem)** | Un producto específico dentro de un pedido, con su cantidad y precio congelado al momento del pedido. |
| **Estado del pedido (OrderStatus)** | Ciclo de vida: `PENDING → CONFIRMED → IN_PREPARATION → READY → DELIVERED`, o `CANCELLED` desde cualquier estado previo a `DELIVERED`. |
| **Cliente (Customer)** | Persona que realiza el pedido. Modelado de forma mínima (nombre + teléfono). |
| **Dinero (Money)** | Value object que representa un monto monetario con su moneda, evitando usar `number` crudo para precios. |
| **Cuenta de cliente (CustomerAccount)** | Credenciales de login de un cliente: `phone` + `nationality` (ej. `+57`) + `password` hasheada. |
| **Cuenta de staff (StaffAccount)** | Credenciales de staff/admin: `username` + `password` + `role` (`ADMIN`/`STAFF`). |
| **Rol (SessionRole)** | `CUSTOMER`, `STAFF` o `ADMIN`; determina qué pueden hacer el usuario y qué frontend se le muestra. |
| **Sesión (Session)** | Cookie httpOnly `ff_session` que porta un JWT HS256 firmado con `SESSION_SECRET`. |
| **Autenticación (Auth)** | Capacidad de identificar/verificar a un usuario y autorizar sus acciones por rol (RBAC). |

---

## 3. Arquitectura: Hexagonal (Ports & Adapters)

Regla de oro: **las dependencias siempre apuntan hacia el dominio, nunca al revés.**

```
                     ┌─────────────────────────────┐
                     │        Adaptadores de        │
                     │           ENTRADA            │
                     │  (HTTP Controllers, Routes)  │
                     └───────────────┬───────────────┘
                                     │ implementan/llaman
                     ┌───────────────▼───────────────┐
                     │      PUERTOS DE ENTRADA        │
                     │   (interfaces de Use Cases)    │
                     └───────────────┬───────────────┘
                                     │
                     ┌───────────────▼───────────────┐
                     │       CAPA DE APLICACIÓN       │
                     │   (Use Cases / orquestación)   │
                     └───────────────┬───────────────┘
                                     │ usa
                     ┌───────────────▼───────────────┐
                     │         CAPA DE DOMINIO        │
                     │ Entidades, VOs, Agregados,      │
                     │ Servicios de dominio, Eventos    │
                     └───────────────┬───────────────┘
                                     │ define
                     ┌───────────────▼───────────────┐
                     │      PUERTOS DE SALIDA         │
                     │ (interfaces de Repositorios,    │
                     │  Notificador, etc.)             │
                     └───────────────┬───────────────┘
                                     │ implementan
                     ┌───────────────▼───────────────┐
                     │      Adaptadores de SALIDA      │
                     │ (PrismaOrderRepository,          │
                     │  InMemoryOrderRepository, etc.) │
                     └─────────────────────────────┘
```

**Regla no negociable para el agente generador:** el código dentro de `src/domain/**` y `src/application/**` **no debe importar** Express, `@prisma/client`, Docker, ni ninguna librería de infraestructura. Solo debe importar de sí mismo o de `src/shared/kernel`.

---

## 4. Modelo de dominio

### 4.1 Kernel compartido (`src/shared/kernel`)

Clases base reutilizables por todas las entidades y VOs:

- `Entity` — clase base con `id` y método `equals(other)` (igualdad por identidad).
- `ValueObject` — clase base con método `equals(other)` (igualdad estructural, por valor).
- `AggregateRoot extends Entity` — añade manejo de una lista interna de **domain events** (`addDomainEvent`, `pullDomainEvents`).
- `DomainError extends Error` — error base de dominio, para diferenciarlo de errores técnicos/HTTP.

### 4.2 Value Objects

| Value Object | Reglas de validación / invariantes |
|---|---|
| `OrderId` | UUID v4 válido. Inmutable. |
| `ProductId` | UUID v4 válido. Inmutable. |
| `CustomerId` | UUID v4 válido. Inmutable. |
| `Money` | `amount` (entero, en centavos, para evitar errores de punto flotante) + `currency` (por defecto `"COP"` o `"USD"`, configurable). `amount >= 0`. Expone `.add()`, `.multiply(factor)`, `.equals()`. Lanza `DomainError` si se intenta operar con monedas distintas. |
| `Quantity` | Entero entre `1` y `50` (límite de negocio arbitrario para evitar pedidos absurdos). Lanza `DomainError` si está fuera de rango. |
| `OrderStatus` | Enum cerrado: `PENDING`, `CONFIRMED`, `IN_PREPARATION`, `READY`, `DELIVERED`, `CANCELLED`. Expone `canTransitionTo(newStatus)` con la tabla de transiciones válidas (ver 4.5). |
| `ProductCategory` | Enum cerrado: `BURGERS`, `SIDES`, `DRINKS`, `DESSERTS`, `COMBOS`. |

### 4.3 Entidad `Product` (agregado independiente, del sub-modelo Catálogo)

**Atributos:**
- `id: ProductId`
- `name: string` (no vacío, máx 80 caracteres)
- `description: string` (opcional, máx 300 caracteres)
- `price: Money`
- `category: ProductCategory`
- `available: boolean` (default `true`)

**Comportamiento (métodos de dominio, no setters anémicos):**
- `changePrice(newPrice: Money)` — valida que `newPrice.amount > 0`.
- `markUnavailable()` / `markAvailable()`.
- `rename(newName: string)`.

**Invariante clave:** un producto con `available = false` no puede añadirse a un nuevo pedido (esta regla se valida en el servicio de dominio, no en el Producto mismo, porque cruza dos agregados).

### 4.4 Entidad `OrderItem` (entidad interna del agregado `Order`, no es agregado propio)

**Atributos:**
- `id: string` (identificador interno, uuid)
- `productId: ProductId`
- `productName: string` (snapshot del nombre al momento de pedir — el dominio nunca debe volver a consultar `Product` para mostrar el pedido)
- `unitPrice: Money` (snapshot del precio al momento de pedir — **muy importante**: si el precio del producto cambia después, los pedidos ya creados no deben verse afectados)
- `quantity: Quantity`

**Comportamiento:**
- `subtotal(): Money` → `unitPrice.multiply(quantity.value)`
- `changeQuantity(newQuantity: Quantity)`

### 4.5 Agregado raíz `Order`

**Atributos:**
- `id: OrderId`
- `customerId: CustomerId`
- `items: OrderItem[]` (privado, se expone solo lectura vía `getItems()`)
- `status: OrderStatus`
- `createdAt: Date`
- `updatedAt: Date`

**Invariantes (reglas que SIEMPRE deben cumplirse):**
1. Un pedido debe tener al menos 1 ítem para poder ser confirmado (`confirm()` falla si `items.length === 0`).
2. No se pueden añadir ni quitar ítems si el pedido ya no está en `PENDING`.
3. El total del pedido siempre es la suma de los subtotales de sus ítems — no se almacena como campo mutable directo, se calcula (`calculateTotal()`), evitando inconsistencias.
4. Las transiciones de estado solo pueden seguir esta tabla:

   | Desde | Hacia permitido |
   |---|---|
   | `PENDING` | `CONFIRMED`, `CANCELLED` |
   | `CONFIRMED` | `IN_PREPARATION`, `CANCELLED` |
   | `IN_PREPARATION` | `READY`, `CANCELLED` |
   | `READY` | `DELIVERED` |
   | `DELIVERED` | *(estado final, sin transiciones)* |
   | `CANCELLED` | *(estado final, sin transiciones)* |

   Cualquier transición fuera de esta tabla lanza `DomainError`.

**Métodos de dominio (comportamiento, no anemia):**
- `static create(customerId: CustomerId): Order` — factory estático, nace en `PENDING`, sin ítems.
- `addItem(product: Product, quantity: Quantity)` — crea internamente un `OrderItem` con snapshot de producto. Valida invariante 2.
- `removeItem(orderItemId: string)` — valida invariante 2.
- `changeItemQuantity(orderItemId: string, quantity: Quantity)`.
- `calculateTotal(): Money`.
- `confirm()` — valida invariante 1 y la transición; dispara evento `OrderConfirmed`.
- `advanceStatus(newStatus: OrderStatus)` — valida tabla de transiciones; dispara evento `OrderStatusChanged`.
- `cancel(reason?: string)` — valida que no esté ya `DELIVERED`; dispara evento `OrderCancelled`.

### 4.6 Entidad `Customer` (modelada mínima, agregado propio simple)

- `id: CustomerId`
- `name: string`
- `phone: string` (validación básica de formato)

### 4.7 Eventos de dominio (`src/domain/**/events`)

Objetos inmutables, no se persisten en esta fase (solo se emiten y se loguean vía adaptador de salida `EventLogger` — ver 6.3). Sirven para practicar el patrón, no para implementar Event Sourcing completo.

- `OrderCreated { orderId, customerId, occurredAt }`
- `OrderConfirmed { orderId, total, occurredAt }`
- `OrderStatusChanged { orderId, fromStatus, toStatus, occurredAt }`
- `OrderCancelled { orderId, reason, occurredAt }`

### 4.8 Servicios de dominio (`src/domain/**/services`)

Lógica que **no pertenece naturalmente a una sola entidad** porque cruza agregados:

- **`OrderCompositionService`**
  - `addProductToOrder(order: Order, product: Product, quantity: Quantity): void`
  - Valida que `product.available === true` (regla que cruza `Product` y `Order`) antes de delegar en `order.addItem(...)`.
  - Lanza `DomainError('PRODUCT_NOT_AVAILABLE')` si no está disponible.

### 4.9 Puertos de salida del dominio (interfaces de repositorio)

Definidos como contratos abstractos en `src/domain/**/repositories` (en JS, documentados con JSDoc; en TS, como `interface`):

- **`OrderRepositoryPort`**
  - `save(order: Order): Promise<void>`
  - `findById(id: OrderId): Promise<Order|null>`
  - `findAll(filters?: { status?: OrderStatus }): Promise<Order[]>`

- **`ProductRepositoryPort`**
  - `save(product: Product): Promise<void>`
  - `findById(id: ProductId): Promise<Product|null>`
  - `findAll(filters?: { category?: ProductCategory, onlyAvailable?: boolean }): Promise<Product[]>`

- **`CustomerRepositoryPort`**
  - `save(customer: Customer): Promise<void>`
  - `findById(id: CustomerId): Promise<Customer|null>`

- **`EventPublisherPort`** (puerto de salida para publicar eventos de dominio)
  - `publish(event: DomainEvent): Promise<void>`

### 4.10 Sub-modelo de Autenticación (`src/domain/auth`)

Añadido en esta fase para soportar login y RBAC. Sigue las mismas reglas hexagonales (dominio puro, sin dependencias de infraestructura).

**Entidades y value objects:**

| Tipo | Clase | Descripción |
|------|-------|-------------|
| Entidad | `CustomerAccount` | `id`, `phone`, `nationality` (prefijo ej. `+57`), `passwordHash`, `customerId` (ref. a `Customer`) |
| Entidad | `StaffAccount` | `id`, `username`, `passwordHash`, `role: StaffRole` |
| VO | `StaffId` | UUID v4 |
| VO | `StaffRole` | `ADMIN` \| `STAFF` (valida en `create`) |
| VO | `CustomerId` | UUID v4 (reutiliza el de `Customer`) |

**Roles de sesión (`SessionRole`):** `CUSTOMER | STAFF | ADMIN`. Se codifican dentro del JWT.

**Puertos de salida:**

- **`StaffRepositoryPort`**
  - `findByUsername(username: string): Promise<StaffAccount|null>`
  - `save(staff: StaffAccount): Promise<void>`
  - `findById(id: StaffId): Promise<StaffAccount|null>`

- **`CustomerAccountRepositoryPort`**
  - `findByPhoneNationality(phone: string, nationality: string): Promise<CustomerAccount|null>`
  - `save(account: CustomerAccount): Promise<void>`
  - `findById(id: string): Promise<CustomerAccount|null>`

- **`SessionServicePort`** (puerto de servicio de dominio para sesiones)
  - `signToken(payload: SessionPayload): string`
  - `verifyToken(token: string): SessionPayload`
  - Tipo `SessionPayload = { sub: string; role: SessionRole }`
  - Constante `SESSION_COOKIE = 'ff_session'`

- **`PasswordHasherPort`** (puerto para hashear contraseñas)
  - `hash(plain: string): Promise<string>`
  - `compare(plain: string, hash: string): Promise<boolean>`

> **Regla de autorización:** **solo `ADMIN` puede registrar staff.** El use case
> `RegisterStaffUseCase` asume que quien invoca ya pasó el filtro `requireRole(['ADMIN'])`.

---

## 5. Capa de aplicación (Use Cases)

Cada Use Case es una clase con un único método `execute(input)`, que orquesta el dominio y los puertos de salida, y **no contiene reglas de negocio propias** (esas viven en el dominio).

### 5.1 Casos de uso de `Product`
- `CreateProductUseCase`
- `ListProductsUseCase`
- `GetProductByIdUseCase`
- `UpdateProductPriceUseCase`
- `ToggleProductAvailabilityUseCase`

### 5.2 Casos de uso de `Order`
- `CreateOrderUseCase(input: { customerId, items: [{productId, quantity}] })`
  - Carga el/los `Product` desde `ProductRepositoryPort`.
  - Crea el `Order` vía `Order.create()`.
  - Usa `OrderCompositionService` para añadir cada ítem.
  - Persiste vía `OrderRepositoryPort.save()`.
  - Publica `OrderCreated` vía `EventPublisherPort`.
- `ConfirmOrderUseCase(orderId)`
- `AdvanceOrderStatusUseCase(orderId, newStatus)`
- `CancelOrderUseCase(orderId, reason)`
- `GetOrderByIdUseCase(orderId)`
- `ListOrdersUseCase(filters)`

### 5.3 Casos de uso de `Auth`

- `LoginCustomerUseCase(input: { phone, nationality, password })` → valida credencial contra `CustomerAccountRepositoryPort`, verifica hash (`PasswordHasherPort`), devuelve `SessionPayload { sub, role: CUSTOMER }` para firmar.
- `RegisterCustomerAccountUseCase(input: { name, phone, nationality, password })` → crea `CustomerAccount` (hash) + `Customer`, rechaza si el par phone+nationality ya existe.
- `LoginStaffUseCase(input: { username, password })` → valida contra `StaffRepositoryPort`, devuelve `SessionPayload { sub, role }`.
- `RegisterStaffUseCase(input: { username, password, role })` → crea `StaffAccount`. **Solo alcanzable vía un endpoint protegido con `requireRole(['ADMIN'])`.**
- `GetCurrentSessionUseCase(session: SessionPayload)` → resuelve el usuario autenticado y lo devuelve conformando la respuesta de `/me` (`{ role, customer|staff }`).
- `LogoutUseCase()` → limpia la cookie de sesión (sin estado de servidor; el token es stateless).

### 5.4 Puertos de entrada

Cada Use Case implementa implícitamente un puerto de entrada (su propia interfaz pública `execute()`). No hace falta duplicar interfaces separadas para esta fase de práctica — el propio Use Case **es** el puerto de entrada.

---

## 6. Adaptadores

### 6.1 Adaptadores de entrada (Driving Adapters) — `src/infrastructure/adapters/in/http`

- **Framework:** Express.
- **Estructura:** `routes/` (definición de rutas) + `controllers/` (traducen HTTP↔Use Case) + `dtos/` (validación con `zod` antes de tocar el dominio) + `middlewares/` (manejo centralizado de errores, mapea `DomainError` → HTTP 400/401/403/404/409).
- Los controllers **nunca** acceden directamente a repositorios ni a entidades de dominio: solo instancian/invocan Use Cases (inyectados vía el contenedor de dependencias, ver 6.4).

**Middlewares de autenticación y seguridad:**
- **`asyncHandler`** — envoltura obligatoria de handlers `async`. Express 4 **no** captura rechazos de promesas; sin esta envoltura un `DomainError` lanzado en un controller crashearía el proceso en vez de mapear su status (400/401/403/404/409).
- **`createAuthMiddleware({ sessionService })`** — fabrica `requireAuth` y `requireRole(roles)`:
  - `requireAuth`: lee la cookie `ff_session`, verifica el JWT vía `SessionServicePort.verifyToken`, y deja `res.locals.session = { sub, role }`. Si falta o es inválido → `DomainError('UNAUTHENTICATED')` → **401**.
  - `requireRole(roles)`: comprueba que `res.locals.session.role` esté en la lista. Si no → `DomainError('FORBIDDEN')` → **403**.
- Se aplican a rutas protegidas, p. ej. `POST /auth/register-staff` usa `requireAuth` + `requireRole(['ADMIN'])`, y `GET /auth/me` usa `requireAuth`.
- **`errorHandler`** — mapeo de errores: `UNAUTHENTICATED`→401, `FORBIDDEN`→403, `*NOT_FOUND`→404, `*TRANSITION*`→409, resto `DomainError`→400, `ZodError`→400 `VALIDATION_ERROR`, desconocido→500.

### 6.2 Adaptadores de salida (Driven Adapters) — `src/infrastructure/adapters/out/persistence`

Se implementan **tres adaptadores intercambiables** para el mismo puerto — esto es el punto pedagógico central del proyecto:

- **`InMemoryOrderRepository` / `InMemoryProductRepository` / `InMemoryCustomerRepository`**
  Guardan en un `Map` en memoria. Útiles para arrancar rápido y para tests unitarios de los Use Cases sin base de datos real.

- **`PrismaOrderRepository` / `PrismaProductRepository` / `PrismaCustomerRepository`**
  Usan **Prisma Client** para hablar con PostgreSQL. Regla estricta para no romper la hexagonal: **los modelos generados por Prisma (`PrismaOrder`, `PrismaProduct`, etc.) son un detalle interno del adaptador y jamás cruzan hacia `application/` ni `domain/`**. Cada repositorio implementa un método privado `toDomain(prismaModel)` que reconstruye la entidad de dominio (invocando sus constructores/factories, no asignando propiedades directo) y `toPersistence(entity)` que aplana la entidad a los campos planos que Prisma espera en `create`/`update`. El `schema.prisma` vive en `prisma/schema.prisma` y modela tablas planas (`Order`, `OrderItem`, `Product`, `Customer`) — **no** modela value objects como `Money` o `OrderStatus` con tipos ricos; eso solo existe en el dominio. En la tabla, `Money` se guarda como dos columnas (`amount Int`, `currency String`) y `OrderStatus` como un `enum` de Prisma que se traduce al enum de dominio en `toDomain`.

- **`Upstash*Repository` (incluidos los de auth: `UpstashStaffRepository`, `UpstashCustomerAccountRepository`)**
  Implementan los mismos puertos del dominio pero persistiendo en **Upstash Redis** vía HTTP (serverless, ideal para demos y edge). Cada uno implementa `toDomain`/`toPersistence` análogos. **La autenticación solo está disponible con este driver** — no hay repos de auth en `memory`/`postgres`.

La elección de cuál adaptador usar se hace por variable de entorno `PERSISTENCE_DRIVER=memory|postgres|upstash`, resuelta en el contenedor de dependencias (6.4). **Esto demuestra en la práctica que el dominio y la aplicación no cambian ni una línea al cambiar de adaptador — ni siquiera al introducir un ORM.**

**Por qué esto importa pedagógicamente:** es tentador, con Prisma, dejar que el modelo generado (`PrismaClient`) se use directamente como si fuera la entidad de dominio (muchos tutoriales hacen esto). Aquí se prohíbe explícitamente: el `PrismaClient` y sus tipos (`Prisma.OrderGetPayload<...>`, etc.) solo pueden importarse dentro de `src/infrastructure/adapters/out/persistence/postgres/**`. Si el agente detecta la tentación de tipar un parámetro de un Use Case con un tipo de Prisma, es una señal de que se está rompiendo la arquitectura. La misma regla aplica a Upstash: los tipos del SDK de Upstash no cruzan hacia `domain/` ni `application/`.

### 6.3 Otros adaptadores de salida

- **`ConsoleEventPublisher`** (implementa `EventPublisherPort`): simplemente hace `console.log` estructurado de cada evento de dominio publicado. Es intencionalmente simple — el objetivo es ver el flujo de eventos, no construir un bus de mensajería real.

- **Adaptadores de seguridad (`src/infrastructure/adapters/out/security`)**
  - **`JsonWebTokenSession`** (implementa `SessionServicePort`): firma/verifica JWT **HS256** con `SESSION_SECRET`; el payload es `{ sub, role }`; expira a los `SESSION_TTL` segundos. El token viaja en la cookie httpOnly `ff_session` (`SESSION_COOKIE`).
  - **`PasswordHasher`** (implementa `PasswordHasherPort`): bcryptjs para `hash`/`compare`.

### 6.4 Contenedor de dependencias (composition root) — `src/infrastructure/container`

Un módulo (`container.ts`) que:
1. Lee variables de entorno (`.env`).
2. Instancia los adaptadores de salida concretos según configuración.
3. Instancia los Use Cases inyectándoles los puertos (adaptadores) que necesitan.
4. Instancia los controllers inyectándoles los Use Cases.
5. Exporta todo listo para que `server.ts` monte las rutas.

Este es el **único lugar del proyecto** donde se permite que infraestructura y dominio "se toquen" — es la costura explícita de la arquitectura hexagonal.

**Autenticación:** el container construye los repos/use cases/controller de `auth` **solo cuando `PERSISTENCE_DRIVER=upstash`** (los repos de auth no existen en `memory`/`postgres`). Si `authController` es `null` (otro driver), las rutas `/api/v1/auth` no se montan. El `JsonWebTokenSession` y `PasswordHasher` se inyectan en los use cases de auth; `createAuthMiddleware({ sessionService })` se usa en las rutas protegidas.

---

## 7. Estructura de carpetas objetivo

```
fast-foodiy/
├── docker/
│   ├── Dockerfile
│   └── docker-compose.yml
├── prisma/
│   ├── schema.prisma               (modelos planos: Order, OrderItem, Product, Customer)
│   └── migrations/                 (generadas por `prisma migrate dev`)
├── src/
│   ├── domain/
│   │   ├── order/
│   │   │   ├── entities/           (Order.ts, OrderItem.ts)
│   │   │   ├── value-objects/      (OrderId.ts, OrderStatus.ts, Money.ts, Quantity.ts)
│   │   │   ├── events/             (OrderCreated.ts, OrderConfirmed.ts, ...)
│   │   │   ├── services/           (OrderCompositionService.ts)
│   │   │   └── repositories/       (OrderRepositoryPort.ts - interface)
│   │   ├── product/
│   │   │   ├── entities/           (Product.ts)
│   │   │   ├── value-objects/      (ProductId.ts, ProductCategory.ts)
│   │   │   └── repositories/       (ProductRepositoryPort.ts - interface)
│   │   ├── customer/
│   │   │   ├── entities/           (Customer.ts)
│   │   │   ├── value-objects/      (CustomerId.ts)
│   │   │   └── repositories/       (CustomerRepositoryPort.ts - interface)
│   │   └── auth/                   (sub-modelo de autenticación)
│   │       ├── entities/           (StaffAccount.ts, CustomerAccount.ts)
│   │       ├── value-objects/      (StaffId.ts, StaffRole.ts)
│   │       ├── services/           (SessionServicePort.ts, PasswordHasherPort.ts)
│   │       └── repositories/       (StaffRepositoryPort.ts, CustomerAccountRepositoryPort.ts)
│   │
│   ├── application/
│   │   ├── order/use-cases/        (CreateOrderUseCase.ts, ConfirmOrderUseCase.ts, ...)
│   │   ├── product/use-cases/      (CreateProductUseCase.ts, ListProductsUseCase.ts, ...)
│   │   └── auth/use-cases/         (LoginCustomerUseCase.ts, LoginStaffUseCase.ts, RegisterStaffUseCase.ts, ...)
│   │
│   ├── infrastructure/
│   │   ├── adapters/
│   │   │   ├── in/http/
│   │   │   │   ├── controllers/    (incluye AuthController.ts)
│   │   │   │   ├── routes/         (incluye auth.routes.ts)
│   │   │   │   ├── dtos/           (schemas de zod + tipos inferidos; incluye auth.dto.ts)
│   │   │   │   ├── middlewares/    (errorHandler, asyncHandler, auth.middleware.ts)
│   │   │   └── out/
│   │   │       ├── persistence/in-memory/
│   │   │       ├── persistence/postgres/  (PrismaOrderRepository.ts, prismaClient.ts, mappers/)
│   │   │       ├── persistence/upstash/   (Upstash*Repository, incluidos los de auth)
│   │   │       ├── security/              (JsonWebTokenSession.ts, PasswordHasher.ts)
│   │   │       └── events/ConsoleEventPublisher.ts
│   │   ├── config/                 (env.ts, db.ts)
│   │   └── container/              (container.ts)
│   │
│   ├── shared/
│   │   ├── kernel/                 (Entity.ts, ValueObject.ts, AggregateRoot.ts, DomainError.ts)
│   │   └── errors/                 (mapeo de errores HTTP)
│   │
│   └── server.ts                   (bootstrap: crea container, monta Express, escucha puerto)
│
├── frontend/                       (aplicación React + Vite + Tailwind)
│   ├── src/
│   │   ├── api/                    (auth.ts, config.ts, menu.ts, staff.ts)
│   │   ├── components/             (auth/, cart/, checkout/, layout/, menu/, orders/, staff/, ui/)
│   │   ├── hooks/                  (useAuth.tsx, useCart.tsx, useOrders.tsx)
│   │   ├── pages/                  (Login, Menu, Cart, Checkout, Orders, staff/*)
│   │   ├── types/ utils/           (tipos y helpers)
│   │   └── ...
│   ├── .env                        (VITE_API_URL, VITE_DEMO_MODE)
│   └── .env.example
│
├── tests/
│   ├── unit/domain/                 (tests de Order, Money, transiciones de estado, etc.)
│   └── unit/application/            (tests de Use Cases con InMemoryRepository)
│
├── .env.example                   (canónico: backend + bloque FRONTEND)
├── package.json
├── tsconfig.json
└── README.md
```

---

## 8. Contrato de la API REST

Base path: `/api/v1`

| Método | Endpoint | Descripción |
|---|---|---|
| `POST` | `/products` | Crear producto |
| `GET` | `/products` | Listar productos (filtros: `category`, `available`) |
| `GET` | `/products/:id` | Obtener producto |
| `PATCH` | `/products/:id/price` | Cambiar precio |
| `PATCH` | `/products/:id/availability` | Alternar disponibilidad |
| `POST` | `/orders` | Crear pedido (`{ customerId, items: [{productId, quantity}] }`) |
| `GET` | `/orders` | Listar pedidos (filtro: `status`) |
| `GET` | `/orders/:id` | Obtener pedido con sus ítems y total |
| `PATCH` | `/orders/:id/confirm` | Confirmar pedido |
| `PATCH` | `/orders/:id/status` | Avanzar estado (`{ status }`) |
| `PATCH` | `/orders/:id/cancel` | Cancelar pedido (`{ reason }`) |

**Autenticación (`POST`/`GET` bajo `/auth`) — solo se monta con `PERSISTENCE_DRIVER=upstash`:**

| Método | Endpoint | Protección | Descripción |
|--------|----------|-----------|-------------|
| `POST` | `/auth/register-customer` | pública | `{ name, phone, nationality, password }` → crea cuenta + cliente |
| `POST` | `/auth/login/customer` | pública | `{ phone, nationality, password }` → setea cookie `ff_session` |
| `POST` | `/auth/login/staff` | pública | `{ username, password }` → setea cookie `ff_session` |
| `POST` | `/auth/register-staff` | `requireAuth` + `requireRole(['ADMIN'])` | `{ username, password, role }` → crea cuenta de staff (solo admin) |
| `POST` | `/auth/logout` | cookie | limpia la cookie de sesión |
| `GET` | `/auth/me` | `requireAuth` | `{ role, customer:{...} }` o `{ role, staff:{...} }` |

**Manejo de errores estándar:**
- `DomainError` → `400 Bad Request` con `{ error: código, message }`
- `UNAUTHENTICATED` (cookie faltante o JWT inválido) → `401 Unauthorized`
- `FORBIDDEN` (rol insuficiente) → `403 Forbidden`
- Recurso no encontrado → `404 Not Found`
- Conflicto de transición de estado inválida → `409 Conflict`

---

## 9. Infraestructura Docker

- `docker/Dockerfile`: imagen `node:20-alpine`, multi-stage (`build` compila TypeScript con `tsc` y corre `prisma generate`; stage final solo copia `dist/`, `node_modules` y `prisma/`), expone puerto `3000`.
- `docker/docker-compose.yml`: dos servicios:
  - `api`: build del Dockerfile, monta volumen para dev, depende de `db`, variables de entorno desde `.env` (incluye `DATABASE_URL` para Prisma). El comando de arranque en dev corre `npx prisma migrate deploy` antes de levantar el servidor, para que el esquema quede sincronizado automáticamente al hacer `docker-compose up`.
  - `db`: imagen `postgres:16-alpine`, con volumen persistente y variables `POSTGRES_DB=fast_foodiy`, `POSTGRES_USER`, `POSTGRES_PASSWORD`.
- El esquema de la base de datos **no se escribe a mano en SQL**: vive en `prisma/schema.prisma` y las migraciones se generan con `npx prisma migrate dev --name init` en desarrollo. En este `schema.prisma` se modelan tablas planas (`Order`, `OrderItem`, `Product`, `Customer`) con `Int` para montos en centavos, `String @id @default(uuid())` para ids, y `enum` de Prisma para `OrderStatus` y `ProductCategory` — recordando que estos tipos de Prisma **no son** los value objects de dominio, solo su representación en tabla (ver 6.2).

---

## 10. Fases de construcción (para orden de generación, no para entrega parcial)

> El agente debe generar **todo el proyecto en una sola pasada**, pero siguiendo este orden de dependencias para que el código sea coherente:

**Fase 1 — Kernel y dominio puro**
Crear `shared/kernel`, luego value objects, luego entidades, luego servicios de dominio, luego eventos, luego interfaces de repositorio (puertos de salida). Sin ninguna dependencia externa.

**Fase 2 — Aplicación**
Use Cases de `Product` y `Order`, dependiendo solo de los puertos definidos en Fase 1.

**Fase 3 — Adaptadores de salida**
`InMemory*Repository` primero (más simple), luego `prisma/schema.prisma` + `Prisma*Repository` con sus mappers `toDomain`/`toPersistence`, luego `ConsoleEventPublisher`.

**Fase 4 — Adaptadores de entrada**
DTOs con `zod` (con sus tipos inferidos vía `z.infer<...>`), controllers, rutas, middleware de errores.

**Fase 5 — Composition root e infraestructura**
`container.ts`, `config/env.ts`, `server.ts`, `tsconfig.json`, `Dockerfile`, `docker-compose.yml`, `.env.example` (incluyendo `DATABASE_URL`).

**Fase 6 — Tests**
Tests unitarios de dominio (sin mocks, puro) y tests de Use Cases usando `InMemoryRepository` (sin Docker, rápidos).

**Fase 7 — Autenticación y frontend (añadida en esta sesión)**
- Dominio y aplicación `auth/**`: `StaffAccount`, `CustomerAccount`, `SessionServicePort`, `PasswordHasherPort`, y use cases de login/register/sesión/logout.
- Adaptadores de salida: repos de auth en `upstash/`, `JsonWebTokenSession` (JWT HS256) y `PasswordHasher` (bcryptjs).
- Adaptadores de entrada: `auth.routes.ts`, `AuthController`, `auth.dto.ts`, `auth.middleware.ts` (`requireAuth`/`requireRole`), `asyncHandler`.
- Seed con `DEMO_MODE=true` + `upstash`: crea admin/staff y cuenta de cliente María.
- Frontend `frontend/`: React + Vite + Tailwind, con routing por roles (`RequireStaff` guarda `/staff/*`).

**Fase 8 — Documentación**
`README.md` con instrucciones de arranque (`docker-compose up`, o `npm run dev` con `PERSISTENCE_DRIVER=memory|upstash`), diagrama de arquitectura en ASCII, mapa de conceptos DDD, y documentación de autenticación/RBAC.

---

## 11. Fuera de alcance (explícitamente, para no sobre-diseñar)

- ~~Autenticación / autorización~~ → **EN ALCANCE** desde esta sesión: login de cliente y staff, roles `CUSTOMER/STAFF/ADMIN`, RBAC básico. Quedan fuera las capacidades avanzadas de auth: OAuth/social login, refresh-token rotation, 2FA, recuperación de contraseña, gestión de sesiones revocables.
- Pagos y facturación.
- Delivery / tracking de repartidor.
- Event Sourcing o CQRS reales (los eventos de dominio solo se loguean, no se persisten como fuente de verdad).
- Múltiples restaurantes / multi-tenancy.
- Mensajería asíncrona real (Kafka, RabbitMQ) — el `EventPublisherPort` queda listo como puerto para que, si se desea en una práctica futura, se le añada un adaptador de cola sin tocar el dominio.

---

## 12. Convenciones de TypeScript

- Todos los puertos (`OrderRepositoryPort`, `ProductRepositoryPort`, `CustomerRepositoryPort`, `EventPublisherPort`, `StaffRepositoryPort`, `CustomerAccountRepositoryPort`, `SessionServicePort`, `PasswordHasherPort`) se definen como `interface` reales de TypeScript en `domain/**/repositories` / `domain/**/services`.
- Las entidades y value objects son `class` de TypeScript con propiedades privadas (`private readonly`) y getters explícitos — nunca propiedades públicas mutables directas, para forzar el paso por los métodos de dominio.
- Los DTOs de entrada HTTP se definen con `zod` y su tipo se infiere con `z.infer<typeof schema>`, evitando duplicar la definición de tipos a mano.
- `tsconfig.json` con `"strict": true`, `"noImplicitAny": true`, `"exactOptionalPropertyTypes": true`, `"noUncheckedIndexedAccess": true` y `"esModuleInterop": true`. Sin `any` en dominio ni aplicación — si algo es genuinamente desconocido, se modela con `unknown` y se valida.
- Los tipos generados por Prisma (`Prisma.OrderCreateInput`, etc.) quedan confinados exclusivamente a `src/infrastructure/adapters/out/persistence/postgres/**`, tal como se explica en 6.2. La misma norma aplica a los tipos del SDK de Upstash para `persistence/upstash/**`.
- Alias de rutas `@shared/*`, `@domain/*`, `@application/*` — no se importa entre capas con rutas relativas.
- Los handlers HTTP `async` se envuelven con `asyncHandler` (Express 4 no captura rechazos de promesas).
- `import bcrypt from 'bcryptjs'` (default import) cuando se usa el adaptador de hashing.

---

## 13. Criterios de "hecho" (Definition of Done) para el agente generador

- [ ] `src/domain` no importa nada de `express`, `@prisma/client`, Upstash ni `docker`.
- [ ] Ningún archivo fuera de `src/infrastructure/adapters/out/persistence/postgres/**` importa `PrismaClient` o tipos `Prisma.*`; ningún archivo fuera de `persistence/upstash/**` (o `out/security/**`) importa el SDK de Upstash.
- [ ] Cambiar `PERSISTENCE_DRIVER` de `memory` a `postgres` no requiere tocar ni un archivo de `domain/` ni `application/`.
- [ ] Todas las transiciones de estado inválidas de `Order` lanzan `DomainError`, cubiertas por al menos un test.
- [ ] `docker-compose up` corre las migraciones de Prisma, levanta API + Postgres, y `GET /api/v1/products` responde `200`.
- [ ] `npx tsc --noEmit` pasa sin errores (backend y frontend con sus tsconfig).
- [ ] README explica el mapeo de carpetas a conceptos DDD.
- [ ] Con `PERSISTENCE_DRIVER=upstash` + `DEMO_MODE=true`, el seed crea los usuarios demo y los flujos de login/RBAC responden correctamente (login → `/me` 200; `register-staff` anónimo 401, staff 403, admin 201).
