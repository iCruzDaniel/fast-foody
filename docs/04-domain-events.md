# Domain Events (Eventos de Dominio)

## ¿Qué son?

Los domain events son **objetos que representan algo que pasó** en el dominio del negocio. Son **inmutables** y contienen datos del evento.

## Ejemplo en el proyecto

### OrderCreated

```typescript
// src/domain/order/events/OrderCreated.ts
export class OrderCreated implements DomainEvent {
  readonly orderId: OrderId;
  readonly customerId: CustomerId;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, customerId: CustomerId) {
    this.orderId = orderId;
    this.customerId = customerId;
    this.occurredAt = new Date();
  }
}
```

### OrderConfirmed

```typescript
// src/domain/order/events/OrderConfirmed.ts
export class OrderConfirmed implements DomainEvent {
  readonly orderId: OrderId;
  readonly total: Money;
  readonly occurredAt: Date;

  constructor(orderId: OrderId, total: Money) {
    this.orderId = orderId;
    this.total = total;
    this.occurredAt = new Date();
  }
}
```

## Flujo completo

```
1. Order.create(customerId)
   └── Emite: OrderCreated(orderId, customerId)

2. order.confirm()
   └── Emite: OrderConfirmed(orderId, total)

3. order.cancel("Cliente se arrepintió")
   └── Emite: OrderCancelled(orderId, reason)
```

## Código real del agregado

```typescript
// Order.ts - El agregado raíz
class Order extends AggregateRoot<OrderId> {
  
  static create(customerId: CustomerId): Order {
    const order = new Order({ ... });
    order.addDomainEvent(new OrderCreated(order.id, customerId));  // ← Acumula evento
    return order;
  }

  confirm(): void {
    this.advanceStatus(OrderStatus.CONFIRMED);
    this.addDomainEvent(new OrderConfirmed(this.id, this.calculateTotal()));  // ← Acumula evento
  }

  cancel(reason?: string): void {
    this._status = OrderStatus.CANCELLED;
    this.addDomainEvent(new OrderCancelled(this.id, reason));  // ← Acumula evento
  }
}
```

## ¿Cómo se usan los eventos?

```typescript
// En el use case o composition root
const order = Order.create(customerId);
order.addItem(product, quantity);
order.confirm();

// Extraer eventos después de persistir
const events = order.pullDomainEvents();
// events = [OrderCreated, OrderConfirmed]

// Publicar eventos (ej: enviar email, notificar cocina, etc.)
for (const event of events) {
  await eventPublisher.publish(event);
}
```

## ¿Para qué sirven?

1. **Notificar a otros bounded contexts** (ej: cocina, facturación)
2. **Auditoría** (registro de qué pasó y cuándo)
3. **Desacoplamiento** (el dominio no sabe quién escucha)
4. **Repositorio de eventos** (para CQRS/event sourcing, aunque no se usa aquí)

## Implementación actual

En este proyecto, los eventos se **emiten pero no se persisten** - solo se imprimen por consola via `ConsoleEventPublisher`.

```typescript
// src/infrastructure/adapters/out/events/ConsoleEventPublisher.ts
export class ConsoleEventPublisher implements EventPublisherPort {
  async publish(event: DomainEvent): Promise<void> {
    console.log('[Event]', event);  // Solo imprime, no persiste
  }
}
```

## Resumen

| Concepto | Qué es |
|----------|--------|
| **DomainEvent** | Objeto que representa algo que pasó |
| **addDomainEvent()** | Acumula evento en el agregado |
| **pullDomainEvents()** | Extrae y limpia eventos |
| **publish()** | Envía evento a quien lo escuche |
