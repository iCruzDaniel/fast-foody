import { CustomerRepositoryPort, Customer, CustomerId } from '@domain/customer';

export class InMemoryCustomerRepository implements CustomerRepositoryPort {
  private readonly store: Map<string, Customer> = new Map();

  async save(customer: Customer): Promise<void> {
    this.store.set(customer.id.value, customer);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const customer = this.store.get(id.value);
    return customer ?? null;
  }
}