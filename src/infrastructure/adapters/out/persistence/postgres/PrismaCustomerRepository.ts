import { CustomerRepositoryPort, Customer, CustomerId } from '@domain/customer';
import { prisma } from './prismaClient';

type PrismaCustomer = NonNullable<Awaited<ReturnType<typeof prisma.customer.findUnique>>>;

export class PrismaCustomerRepository implements CustomerRepositoryPort {
  async save(customer: Customer): Promise<void> {
    const data = this.toPersistence(customer);

    await prisma.customer.upsert({
      where: { id: customer.id.value },
      create: data,
      update: data,
    });
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const prismaCustomer = await prisma.customer.findUnique({
      where: { id: id.value },
    });

    if (!prismaCustomer) {
      return null;
    }

    return this.toDomain(prismaCustomer);
  }

  private toDomain(prismaCustomer: PrismaCustomer): Customer {
    return Customer.reconstruct(
      CustomerId.fromString(prismaCustomer.id),
      prismaCustomer.name,
      prismaCustomer.phone
    );
  }

  private toPersistence(customer: Customer) {
    return {
      id: customer.id.value,
      name: customer.name,
      phone: customer.phone,
    };
  }
}