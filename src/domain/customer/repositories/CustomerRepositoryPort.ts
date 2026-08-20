import { Customer, CustomerId } from '@domain/customer';

export interface CustomerRepositoryPort {
  save(customer: Customer): Promise<void>;
  findById(id: CustomerId): Promise<Customer | null>;
}