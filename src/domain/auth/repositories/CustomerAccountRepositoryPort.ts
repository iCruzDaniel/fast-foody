import { CustomerAccount } from '@domain/auth';
import { CustomerId } from '@domain/customer';
import { Customer, CustomerRepositoryPort } from '@domain/customer';

export interface CustomerAccountRepositoryPort {
  save(account: CustomerAccount): Promise<void>;
  findByCustomerId(customerId: CustomerId): Promise<CustomerAccount | null>;
  findByNationalityAndPhone(
    nationality: string,
    phone: string,
  ): Promise<{ account: CustomerAccount; customer: Customer } | null>;
}