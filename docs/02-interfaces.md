# Interfaces en TypeScript

## ¿Qué es?

`interface` es una palabra reservada de **TypeScript** que define la **estructura/forma** de un objeto. **No existe en JavaScript** - se elimina al compilar.

## Diferencia clave

```typescript
// VARIABLE - almacena un VALOR
const customer = { value: "abc-123" };

// INTERFACE - define una ESTRUCTURA (qué propiedades debe tener un objeto)
interface CustomerIdProps {
  value: string;  // "value" debe ser string
}
```

## Ejemplo en el proyecto

```typescript
// Interface define: "Customer debe tener name y phone como strings"
interface CustomerProps {
  name: string;
  phone: string;
}

// Ahora TypeScript SABE qué forma debe tener el objeto
function createCustomer(props: CustomerProps) {
  // TypeScript ya sabe que props.name es string
  // TypeScript ya sabe que props.phone es string
}
```

## ¿Qué pasaría SIN interface?

```typescript
// Sin interface - no hay validación
function createCustomer(props: any) {
  // ❌ No sabes qué tiene props
  // ❌ No hay autocompletado
  // ❌ No hay errores en tiempo de compilación
}

// Podrías pasar cualquier cosa y no hay error hasta runtime
createCustomer({ nombre: "Pedro" })  // ❌ Error: nombre no es name
createCustomer({ name: 123 })        // ❌ Error: number no es string
```

## Beneficios

**1. Autocompletado en tu editor**
```typescript
function createCustomer(props: CustomerProps) {
  props.  // ← Tu editor te muestra: name, phone
}
```

**2. Errores en tiempo de compilación**
```typescript
const bad = { nombre: "Pedro" };
createCustomer(bad);  
// ❌ Error: 'nombre' no existe en tipo 'CustomerProps'
//    Te falta 'name' y 'phone'
```

**3. Documentación que nunca se queda obsoleta**
```typescript
// Esta interface DOCUMENTA qué necesita la función
// Si cambias la función, la interface cambia también
interface MoneyProps {
  amount: number;   // Centavos (entero)
  currency: string; // COP, USD, EUR
}
```

## Ejemplo real del proyecto

```typescript
// En Money.ts
interface MoneyProps {
  amount: number;  // Definición: "amount debe ser number"
  currency: string;
}

// En la función create, TypeScript VALIDA que cumplas la interface
static create(amount: number, currency: string = 'COP'): Money {
  return new Money({ amount, currency });  // ✅ Correcto
}

static create(amount: number, currency: string = 'COP'): Money {
  return new Money({ amount });  // ❌ Error: falta 'currency'
}
```

## Resumen

| Concepto | Qué hace | Ejemplo |
|----------|----------|---------|
| **Variable** | Almacena un valor | `const x = 5` |
| **Interface** | Define la forma de un objeto | `interface Props { value: string }` |

No se puede usar una variable porque una variable almacena un valor específico, pero una interface define una **regla** que muchos objetos pueden seguir.
