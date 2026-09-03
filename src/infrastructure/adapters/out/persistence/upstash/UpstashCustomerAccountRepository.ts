import { Redis } from '@upstash/redis';
import { CustomerAccountRepositoryPort, CustomerAccount } from '@domain/auth';
import { CustomerId } from '@domain/customer';
import { Customer, CustomerRepositoryPort } from '@domain/customer';

interface PersistedCustomerAccount {
  customerId: string;
  nationality: string;
  phone: string;
  passwordHash: string;
}

export class UpstashCustomerAccountRepository implements CustomerAccountRepositoryPort {
  private readonly redis: Redis;
  private readonly customerRepo: CustomerRepositoryPort;
  private static readonly NAMESPACE = 'fast-foodiy';
  private readonly accountKeyPrefix = `${UpstashCustomerAccountRepository.NAMESPACE}:auth:customer-account:`;
  private readonly loginIndexKey = `${UpstashCustomerAccountRepository.NAMESPACE}:auth:customer:login:`;

  constructor(redis: Redis, customerRepo: CustomerRepositoryPort) {
    this.redis = redis;
    this.customerRepo = customerRepo;
  }

  async save(account: CustomerAccount): Promise<void> {
    const persisted: PersistedCustomerAccount = {
      customerId: account.id.value,
      nationality: account.nationality,
      phone: account.phone,
      passwordHash: account.passwordHash,
    };

    const accountKey = `${this.accountKeyPrefix}${account.id.value}`;

    // Set the customer account key
    await this.redis.set(accountKey, persisted);

    // Set the login index (nationality|normalizedPhone → customerId)
    const normalizedPhone = this.normalizePhone(account.phone);
    const loginIndexKey = `${this.loginIndexKey}${account.nationality}:${normalizedPhone}`;
    await this.redis.set(loginIndexKey, account.id.value);
  }

  async findByCustomerId(customerId: CustomerId): Promise<CustomerAccount | null> {
    const accountKey = `${this.accountKeyPrefix}${customerId.value}`;
    const persisted = await this.redis.get<PersistedCustomerAccount>(accountKey);

    if (!persisted) {
      return null;
    }

    return CustomerAccount.reconstruct(
      CustomerId.fromString(persisted.customerId),
      persisted.nationality,
      persisted.passwordHash,
      persisted.phone,
    );
  }

  async findByNationalityAndPhone(nationality: string, phone: string): Promise<{ account: CustomerAccount; customer: Customer } | null> {
    // Normalize phone for lookup
    const normalizedPhone = this.normalizePhone(phone);

    const loginIndexKey = `${this.loginIndexKey}${nationality}:${normalizedPhone}`;
    const customerId = await this.redis.get<string>(loginIndexKey);

    if (!customerId) {
      return null;
    }

    // Get the customer account
    const account = await this.findByCustomerId(CustomerId.fromString(customerId));
    if (!account) {
      return null;
    }

    // Look up the customer via the injected repository
    const customer = await this.customerRepo.findById(CustomerId.fromString(customerId));

    if (!customer) {
      return null;
    }

    return { account, customer };
  }

  private normalizePhone(phone: string): string {
    // Keep leading + if present, strip all other non-digits
    const plusPrefix = phone.startsWith('+') ? '+' : '';
    const digits = phone.replace(/[^0-9]/g, '');
    return plusPrefix + digits.replace(/^\+/, '');
  }
}