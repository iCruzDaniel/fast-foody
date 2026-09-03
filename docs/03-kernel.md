# Kernel - Building Blocks de DDD

## ¿Qué es?

El kernel es el **cimiento** del dominio. Contiene las **clases base** que todos los value objects, entidades y aggregates heredan.

## ¿De dónde viene?

Estos patrones vienen de **Domain-Driven Design (DDD)**, un libro de Eric Evans (2003). Son los **building blocks** fundamentales.

```
DDD (teoría)
    │
    ├── Entity           ← "Objeto con identidad única"
    ├── ValueObject      ← "Objeto definido por sus atributos"
    ├── Aggregate        ← "Grupo de objetos que se modifican juntos"
    └── DomainEvent      ← "Algo que pasó en el dominio"
```

## Los 4 archivos del kernel

### 1. Entity.ts — "Objeto con identidad"

```typescript
export abstract class Entity<T> {
  protected readonly _id: T;  // Cada entidad tiene un ID único
  
  equals(other: Entity<T>): boolean {
    return this._id === other._id;  // Dos entidades son iguales si tienen el mismo ID
  }
}
```

**Ejemplo en el proyecto:** `Order`, `Product`, `Customer`

```typescript
class Order extends Entity<OrderId> {
  // Order se identifica por su OrderId
  // Dos Order con el mismo OrderId son "la misma orden"
}
```

### 2. ValueObject.ts — "Objeto definido por sus atributos"

```typescript
export abstract class ValueObject<Props> {
  private readonly _props: Props;  // Inmutable
  
  equals(other: ValueObject<Props>): boolean {
    return JSON.stringify(this._props) === JSON.stringify(other._props);
    // Dos ValueObjects son iguales si tienen los mismos valores
  }
}
```

**Ejemplo en el proyecto:** `Money`, `OrderId`, `Quantity`

```typescript
class Money extends ValueObject<MoneyProps> {
  // Money NO se identifica por ID
  // Money(1000, "COP") === Money(1000, "COP")  ← mismo valor = igual
}
```

### 3. AggregateRoot.ts — "Entidad que emite eventos"

```typescript
export abstract class AggregateRoot<T> extends Entity<T> {
  private _domainEvents: DomainEvent[] = [];
  
  addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);  // Acumula eventos
  }
  
  pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents];
    this._domainEvents = [];  // Limpia después de extraer
    return events;
  }
}
```

**Ejemplo en el proyecto:** `Order` (no `Product` ni `Customer`)

```typescript
class Order extends AggregateRoot<OrderId> {
  confirm(): void {
    this.status = OrderStatus.CONFIRMED;
    this.addDomainEvent(new OrderConfirmed(this.id, this.total));  // ← Emite evento
  }
}
```

### 4. DomainError.ts — "Error de negocio"

```typescript
export class DomainError extends Error {
  public readonly code: string;  // Código del error (ej: "INSUFFICIENT_STOCK")
  
  constructor(code: string, message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
```

**Ejemplo en el proyecto:**

```typescript
throw new DomainError('INVALID_TRANSITION', 'Cannot cancel delivered order');
throw new DomainError('INSUFFICIENT_STOCK', 'Not enough burgers');
```

## ¿Por qué existe el kernel?

**Sin kernel** (código repetido):
```typescript
// Cada entidad repetiría lo mismo
class Order {
  constructor(private id: OrderId) {}  // ← Repetido
  equals(other: Order) { return this.id === other.id; }  // ← Repetido
}

class Product {
  constructor(private id: ProductId) {}  // ← Repetido
  equals(other: Product) { return this.id === other.id; }  // ← Repetido
}
```

**Con kernel** (código reutilizable):
```typescript
// Todo está en la clase base
class Order extends AggregateRoot<OrderId> {
  // Solo agrega lógica de negocio específica de Order
}

class Product extends Entity<ProductId> {
  // Solo agrega lógica de negocio específica de Product
}
```

## Jerarquía visual

```
shared/kernel/
├── Entity.ts           ← Clase base para entidades
├── ValueObject.ts      ← Clase base para value objects
├── AggregateRoot.ts    ← Clase base para aggregates (hereda de Entity)
├── DomainError.ts      ← Error de negocio
└── index.ts            ← Barrel (re-exporta todo)

Uso en el dominio:
├── Order extends AggregateRoot<OrderId>  (tiene eventos)
├── Product extends Entity<ProductId>    (sin eventos)
├── Customer extends Entity<CustomerId>  (sin eventos)
├── Money extends ValueObject<MoneyProps> (inmutable)
├── OrderId extends ValueObject<OrderIdProps> (inmutable)
└── etc.
```

## Resumen

| Archivo | Viene de | Propósito |
|---------|----------|-----------|
| Entity | DDD | Identidad única |
| ValueObject | DDD | Igualdad por valor |
| AggregateRoot | DDD | Entidad + eventos |
| DomainError | Errores de negocio | Errores tipados |

El kernel es el **esqueleto** que toda buena arquitectura DDD necesita.
