# Barrel Files (index.ts)

## ¿Qué son?

Los archivos `index.ts` se llaman **barrel files** y su función es ser el **punto de entrada público** de cada módulo.

## Estructura

```
src/domain/order/
├── entities/
│   ├── index.ts          ← barrel
│   ├── Order.ts
│   └── OrderItem.ts
├── value-objects/
│   ├── index.ts          ← barrel
│   ├── Money.ts
│   ├── OrderId.ts
│   └── OrderStatus.ts
└── index.ts              ← barrel agregador
```

## Ejemplo de uso

```typescript
// Sin barrel (imports profundos)
import { Order } from '@domain/order/entities/Order'
import { OrderItem } from '@domain/order/entities/OrderItem'
import { Money } from '@domain/order/value-objects/Money'

// Con barrel (imports limpios)
import { Order, OrderItem } from '@domain/order/entities'
import { Money, OrderId, OrderStatus } from '@domain/order/value-objects'
```

## Jerarquía de barrels

```
src/domain/order/index.ts
    └── export * from './entities'
    └── export * from './value-objects'
    └── export * from './events'
    └── export * from './repositories'
```

Esto permite importar todo lo que necesitas de `order` en una sola línea:
```typescript
import { Order, Money, OrderStatus, OrderRepositoryPort } from '@domain/order'
```

## Hallazgo en el proyecto

En el codebase actual, los barrels **NO se usan** - todos los imports usan rutas profundas. El único barrel consumido es `@shared/kernel`.

## ¿Por qué existen si no se usan?

1. **Buenas intenciones**: El proyecto fue diseñado con la intención de usar imports limpios
2. **No se adoptó el patrón**: El código terminó usando imports directos por path
3. **Código muerto**: Los 31 barrels restantes solo re-exportan entre ellos pero nadie los importa

## Opciones

1. **Eliminar los barrels muertos** (excepto `@shared/kernel`) → limpia el codebase
2. **Empezar a usarlos** → cambiar los imports profundos a imports via barrel
3. **Dejarlo como está** → funciona, pero es confuso tener código no utilizado
