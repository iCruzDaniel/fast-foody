/**
 * Seed script — inserts demo data (customers, products, orders) through the
 * repository adapters, so it works regardless of the persistence driver
 * (`memory` | `postgres` | `upstash`) selected via PERSISTENCE_DRIVER.
 *
 * The adapters (and only the adapters) handle the underlying storage, keeping
 * the domain and application layers storage-agnostic — the point of the
 * hexagonal architecture.
 *
 * Run with:
 *   npm run seed
 *   PERSISTENCE_DRIVER=upstash npm run seed
 */
import { Redis } from '@upstash/redis'
import { config } from './infrastructure/config/env'
import { disconnectDatabase } from './infrastructure/config/db'

// InMemory adapters
import { InMemoryOrderRepository } from './infrastructure/adapters/out/persistence/in-memory/InMemoryOrderRepository'
import { InMemoryProductRepository } from './infrastructure/adapters/out/persistence/in-memory/InMemoryProductRepository'
import { InMemoryCustomerRepository } from './infrastructure/adapters/out/persistence/in-memory/InMemoryCustomerRepository'

// Postgres adapters
import { PrismaOrderRepository } from './infrastructure/adapters/out/persistence/postgres/PrismaOrderRepository'
import { PrismaProductRepository } from './infrastructure/adapters/out/persistence/postgres/PrismaProductRepository'
import { PrismaCustomerRepository } from './infrastructure/adapters/out/persistence/postgres/PrismaCustomerRepository'

// Upstash adapters
import { UpstashOrderRepository } from './infrastructure/adapters/out/persistence/upstash/UpstashOrderRepository'
import { UpstashProductRepository } from './infrastructure/adapters/out/persistence/upstash/UpstashProductRepository'
import { UpstashCustomerRepository } from './infrastructure/adapters/out/persistence/upstash/UpstashCustomerRepository'
import { UpstashStaffAccountRepository } from './infrastructure/adapters/out/persistence/upstash/UpstashStaffAccountRepository'
import { UpstashCustomerAccountRepository } from './infrastructure/adapters/out/persistence/upstash/UpstashCustomerAccountRepository'

// Domain
import { Order, OrderStatus, Quantity, Money } from '@domain/order'
import { Customer, CustomerId } from '@domain/customer'
import { Product, ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product'

// Domain — Auth
import { StaffAccount, StaffId, StaffRole } from '@domain/auth'
import { CustomerAccount } from '@domain/auth'

// Ports
import type { OrderRepositoryPort } from '@domain/order'
import type { ProductRepositoryPort } from '@domain/product'
import type { CustomerRepositoryPort } from '@domain/customer'

// Security
import { BcryptPasswordHasher } from './infrastructure/adapters/out/security/PasswordHasher'

type StatusName = keyof typeof OrderStatus

interface SeededCustomer {
  id: CustomerId
  name: string
  phone: string
}

function buildPersistence(): {
  orderRepo: OrderRepositoryPort
  productRepo: ProductRepositoryPort
  customerRepo: CustomerRepositoryPort
} {
  if (config.persistenceDriver === 'postgres') {
    return {
      orderRepo: new PrismaOrderRepository(),
      productRepo: new PrismaProductRepository(),
      customerRepo: new PrismaCustomerRepository(),
    }
  }

  if (config.persistenceDriver === 'upstash') {
    const redis = new Redis({
      url: config.upstashRedisUrl,
      token: config.upstashRedisToken,
    })
    return {
      orderRepo: new UpstashOrderRepository(redis),
      productRepo: new UpstashProductRepository(redis),
      customerRepo: new UpstashCustomerRepository(redis),
    }
  }

  return {
    orderRepo: new InMemoryOrderRepository(),
    productRepo: new InMemoryProductRepository(),
    customerRepo: new InMemoryCustomerRepository(),
  }
}

async function seedCustomers(customerRepo: CustomerRepositoryPort): Promise<SeededCustomer[]> {
  // Matches the customers referenced by the mock staff orders (frontend/src/api/staff.ts)
  const customerData = [
    { name: 'Maria Lopez', phone: '(555) 123-4567' },
    { name: 'Juan Perez', phone: '(555) 987-6543' },
    { name: 'Ana Torres', phone: '(555) 555-1212' },
    { name: 'Carlos Ruiz', phone: '(555) 222-3344' },
    { name: 'Lucia Gomez', phone: '(555) 444-5566' },
    { name: 'Pedro Sanchez', phone: '(555) 888-9900' },
    { name: 'Sofia Herrera', phone: '(555) 777-8899' },
    { name: 'Diego Moreno', phone: '(555) 612-7834' },
  ]

  const seeded: SeededCustomer[] = []

  for (const data of customerData) {
    const id = CustomerId.create()
    const customer = Customer.create(id, data.name, data.phone)
    await customerRepo.save(customer)
    seeded.push({ id, name: customer.name, phone: data.phone })
    console.log(`  ✓ Cliente: ${customer.name} (${id.value})`)
  }

  return seeded
}

async function seedProducts(productRepo: ProductRepositoryPort): Promise<Product[]> {
  const productData: Array<{
    name: string
    description: string
    price: number
    category: ProductCategoryType
    imageUrl: string
  }> = [
    // Matches the mock menu (frontend/src/api/menu.ts)
    { name: 'Classic Burger', description: 'Juicy beef patty with lettuce, tomato, and our secret sauce', price: 899, category: ProductCategory.BURGERS, imageUrl: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=400&q=80' },
    { name: 'Double Cheese', description: 'Two beef patties with melted American cheese', price: 1099, category: ProductCategory.BURGERS, imageUrl: 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=400&q=80' },
    { name: 'Veggie Deluxe', description: 'Plant-based patty with avocado and sprouts', price: 999, category: ProductCategory.BURGERS, imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&q=80' },
    { name: 'Crispy Fries', description: 'Golden crispy fries with sea salt', price: 399, category: ProductCategory.SIDES, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&q=80' },
    { name: 'Onion Rings', description: 'Beer-battered onion rings with ranch dip', price: 499, category: ProductCategory.SIDES, imageUrl: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&q=80' },
    { name: 'Coleslaw', description: 'Creamy coleslaw with fresh cabbage', price: 299, category: ProductCategory.SIDES, imageUrl: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?w=400&q=80' },
    { name: 'Cola', description: 'Refreshing cola with ice', price: 199, category: ProductCategory.DRINKS, imageUrl: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&q=80' },
    { name: 'Fresh Lemonade', description: 'Freshly squeezed lemonade', price: 249, category: ProductCategory.DRINKS, imageUrl: 'https://images.unsplash.com/photo-1621263764928-df1444c5e859?w=400&q=80' },
    { name: 'Iced Tea', description: 'Freshly brewed iced tea', price: 199, category: ProductCategory.DRINKS, imageUrl: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
    { name: 'Chocolate Shake', description: 'Rich chocolate milkshake with whipped cream', price: 499, category: ProductCategory.DESSERTS, imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&q=80' },
    { name: 'Apple Pie', description: 'Warm apple pie with cinnamon', price: 399, category: ProductCategory.DESSERTS, imageUrl: 'https://images.unsplash.com/photo-1621743478914-cc8a86d7e7b5?w=400&q=80' },
    { name: 'Sundae', description: 'Vanilla ice cream with hot fudge', price: 349, category: ProductCategory.DESSERTS, imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&q=80' },
    { name: 'Classic Combo', description: 'Classic Burger + Fries + Cola', price: 1299, category: ProductCategory.COMBOS, imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&q=80' },
    { name: 'Family Meal', description: '4 Burgers + Large Fries + 4 Drinks', price: 3499, category: ProductCategory.COMBOS, imageUrl: 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=400&q=80' },
  ]

  const seeded: Product[] = []

  for (const data of productData) {
    const product = Product.create(
      ProductId.create(),
      data.name,
      data.description,
      Money.create(data.price),
      data.category,
      true,
      data.imageUrl
    )
    await productRepo.save(product)
    seeded.push(product)
    console.log(`  ✓ Producto: ${product.name} (${(product.price.amount / 100).toFixed(2)} ${product.price.currency})`)
  }

  return seeded
}

function buildOrder(
  customerId: CustomerId,
  products: Product[],
  status: StatusName,
  plan: Array<{ productIndex: number; quantity: number }>
): Order {
  const order = Order.create(customerId)

  for (const item of plan) {
    const product = products[item.productIndex]
    if (!product) {
      throw new Error(`seed: product index ${item.productIndex} out of range`)
    }
    order.addItem(product, Quantity.create(item.quantity))
  }

  switch (status) {
    case 'CONFIRMED':
      order.confirm()
      break
    case 'IN_PREPARATION':
    case 'READY':
    case 'DELIVERED':
      order.confirm()
      order.advanceStatus(OrderStatus.IN_PREPARATION)
      if (status === 'READY' || status === 'DELIVERED') {
        order.advanceStatus(OrderStatus.READY)
      }
      if (status === 'DELIVERED') {
        order.advanceStatus(OrderStatus.DELIVERED)
      }
      break
    case 'CANCELLED':
      order.cancel('Cancelado por el cliente')
      break
    case 'PENDING':
    default:
      break
  }

  return order
}

async function seedOrders(
  orderRepo: OrderRepositoryPort,
  customers: SeededCustomer[],
  products: Product[]
): Promise<void> {
  const scenarios: Array<{
    customerIndex: number
    status: StatusName
    plan: Array<{ productIndex: number; quantity: number }>
  }> = [
    // Matches the mock staff orders (frontend/src/api/staff.ts)
    { customerIndex: 0, status: 'PENDING', plan: [{ productIndex: 0, quantity: 2 }, { productIndex: 3, quantity: 1 }] },          // Maria Lopez
    { customerIndex: 1, status: 'PENDING', plan: [{ productIndex: 12, quantity: 1 }, { productIndex: 6, quantity: 2 }] },         // Juan Perez
    { customerIndex: 2, status: 'CONFIRMED', plan: [{ productIndex: 13, quantity: 1 }, { productIndex: 9, quantity: 2 }] },       // Ana Torres
    { customerIndex: 3, status: 'IN_PREPARATION', plan: [{ productIndex: 1, quantity: 1 }, { productIndex: 4, quantity: 1 }] },   // Carlos Ruiz
    { customerIndex: 4, status: 'IN_PREPARATION', plan: [{ productIndex: 7, quantity: 1 }, { productIndex: 2, quantity: 2 }] },   // Lucia Gomez
    { customerIndex: 5, status: 'READY', plan: [{ productIndex: 10, quantity: 2 }, { productIndex: 9, quantity: 1 }] },           // Pedro Sanchez
    { customerIndex: 6, status: 'DELIVERED', plan: [{ productIndex: 11, quantity: 1 }, { productIndex: 8, quantity: 2 }] },       // Sofia Herrera
    { customerIndex: 7, status: 'CANCELLED', plan: [{ productIndex: 0, quantity: 1 }] },                                          // Diego Moreno
  ]

  for (const scenario of scenarios) {
    const customer = customers[scenario.customerIndex]
    if (!customer) {
      throw new Error(`seed: customer index ${scenario.customerIndex} out of range`)
    }
    const order = buildOrder(customer.id, products, scenario.status, scenario.plan)
    await orderRepo.save(order)
    console.log(`  ✓ Pedido: ${order.status} — ${order.calculateTotal().toString()} (cliente: ${customer.name})`)
  }
}

async function seedAuthUsers(customers: SeededCustomer[]): Promise<void> {
  const redis = new Redis({
    url: config.upstashRedisUrl,
    token: config.upstashRedisToken,
  })

  const staffRepo = new UpstashStaffAccountRepository(redis)
  const customerAccountRepo = new UpstashCustomerAccountRepository(redis, new UpstashCustomerRepository(redis))
  const hasher = new BcryptPasswordHasher()

  const admin = StaffAccount.create(StaffId.create(), 'admin', await hasher.hash('admin123'), StaffRole.ADMIN)
  await staffRepo.save(admin)
  console.log('  ✓ Staff admin: admin (admin123)')

  const staff = StaffAccount.create(StaffId.create(), 'staff', await hasher.hash('staff123'), StaffRole.STAFF)
  await staffRepo.save(staff)
  console.log('  ✓ Staff: staff (staff123)')

  const maria = customers.find((c) => c.name === 'Maria Lopez')
  if (maria) {
    const mariaAccount = CustomerAccount.create(maria.id, '+57', await hasher.hash('customer123'), maria.phone)
    await customerAccountRepo.save(mariaAccount)
    console.log('  ✓ Cliente auth: Maria Lopez (+57, customer123)')
  }
}

async function main(): Promise<void> {
  console.log(`🌱 Sembrando datos de prueba — driver: ${config.persistenceDriver}`)

  const { orderRepo, productRepo, customerRepo } = buildPersistence()

  console.log('  👤 Creando clientes…')
  const customers = await seedCustomers(customerRepo)

  console.log('  🍔 Creando productos…')
  const products = await seedProducts(productRepo)

  console.log('  🧾 Creando pedidos con distintos estados…')
  await seedOrders(orderRepo, customers, products)

  if (config.persistenceDriver === 'upstash' && config.demoMode) {
    console.log('  🔐 Sembrando usuarios de autenticación de demo…')
    await seedAuthUsers(customers)
  } else {
    console.log('  ⏭️  Autenticación no sembrada (requiere PERSISTENCE_DRIVER=upstash y DEMO_MODE=true)')
  }
}

void main()
  .catch((error) => {
    console.error('Error sembrando datos:', error)
    process.exit(1)
  })
  .finally(async () => {
    await disconnectDatabase()
    console.log('✅ Seed finalizado')
  })
