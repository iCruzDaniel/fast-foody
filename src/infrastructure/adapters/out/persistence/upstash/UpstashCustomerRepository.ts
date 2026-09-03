import { Redis } from '@upstash/redis';
import { CustomerRepositoryPort, Customer, CustomerId } from '@domain/customer';

interface PersistedCustomer {
  id: string;
  name: string;
  phone: string;
}

export class UpstashCustomerRepository implements CustomerRepositoryPort {
  private readonly redis: Redis;
  private static readonly NAMESPACE = 'fast-foodiy';
  private readonly customerKeyPrefix = `${UpstashCustomerRepository.NAMESPACE}:customer:`;
  private readonly customersIndexKey = `${UpstashCustomerRepository.NAMESPACE}:customers:index`;

  constructor(redis: Redis) {
    this.redis = redis;
  }

  async save(customer: Customer): Promise<void> {
    const persistedCustomer = this.toPersistence(customer);
    const customerKey = `${this.customerKeyPrefix}${customer.id.value}`;

    await this.redis.set(customerKey, persistedCustomer);
    await this.redis.sadd(this.customersIndexKey, customer.id.value);
  }

  async findById(id: CustomerId): Promise<Customer | null> {
    const customerKey = `${this.customerKeyPrefix}${id.value}`;
    const persistedCustomer = await this.redis.get<PersistedCustomer>(customerKey);

    if (!persistedCustomer) {
      return null;
    }

    return this.toDomain(persistedCustomer);
  }

  private toDomain(persistedCustomer: PersistedCustomer): Customer {
    return Customer.reconstruct(
      CustomerId.fromString(persistedCustomer.id),
      persistedCustomer.name,
      persistedCustomer.phone
    );
  }

  private toPersistence(customer: Customer): PersistedCustomer {
    return {
      id: customer.id.value,
      name: customer.name,
      phone: customer.phone,
    };
  }
}