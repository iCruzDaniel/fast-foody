import { DomainError } from '@shared/kernel';
import { CustomerAccount, StaffAccount, StaffId } from '@domain/auth';
import { StaffRepositoryPort, CustomerAccountRepositoryPort } from '@domain/auth/repositories';
import { CustomerRepositoryPort, CustomerId } from '@domain/customer';
import { PasswordHasherPort } from '@domain/auth/services';

export interface GetCurrentSessionUseCaseInput {
  sub: string;
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
}

export interface GetCurrentSessionUseCaseOutput {
  role: 'CUSTOMER' | 'STAFF' | 'ADMIN';
  id: string;
  username?: string;
  name?: string;
  phone?: string;
  nationality?: string;
}

export class GetCurrentSessionUseCase {
  constructor(
    private readonly customerAccountRepo: CustomerAccountRepositoryPort,
    private readonly staffRepo: StaffRepositoryPort,
    private readonly customerRepo: CustomerRepositoryPort,
  ) {}

  async execute(input: GetCurrentSessionUseCaseInput): Promise<GetCurrentSessionUseCaseOutput> {
    const { sub, role } = input;

    if (role === 'CUSTOMER') {
      // Find customer account by sub (which is customerId)
      const customerAccount = await this.customerAccountRepo.findByCustomerId(CustomerId.fromString(sub as string));
      if (!customerAccount) {
        throw new DomainError('SESSION_INVALID', 'Session invalid: customer account not found');
      }

      // Find customer by customerId
      const customer = await this.customerRepo.findById(CustomerId.fromString(sub as string));
      if (!customer) {
        throw new DomainError('SESSION_INVALID', 'Session invalid: customer not found');
      }

      return {
        role: 'CUSTOMER' as const,
        id: customerAccount.id.value,
        name: customer.name,
        phone: customer.phone,
        nationality: customerAccount.nationality,
      };
    } else if (role === 'STAFF' || role === 'ADMIN') {
      // Find staff account by StaffId.fromString(sub)
      const staffId = StaffId.fromString(sub as string);
      const staffAccount = await this.staffRepo.findById(staffId);
      if (!staffAccount) {
        throw new DomainError('SESSION_INVALID', 'Session invalid: staff account not found');
      }

      return {
        role: staffAccount.role.role as 'ADMIN' | 'STAFF',
        id: staffAccount.id.value,
        username: staffAccount.username,
      };
    }

    throw new DomainError('SESSION_INVALID', 'Session invalid: unknown role');
  }
}