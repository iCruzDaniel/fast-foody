import { DomainError } from '@shared/kernel';
import { PasswordHasherPort } from '@domain/auth/services';
import { SessionServicePort } from '@domain/auth/services';
import { CustomerAccountRepositoryPort } from '@domain/auth/repositories';
import { CustomerId } from '@domain/customer';

export interface LoginCustomerUseCaseInput {
  phone: string;
  nationality: string;
  password: string;
}

export interface LoginCustomerUseCaseOutput {
  token: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    nationality: string;
  };
}

export type LoginCustomerInput = LoginCustomerUseCaseInput;

export class LoginCustomerUseCase {
  constructor(
    private readonly customerAccountRepo: CustomerAccountRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly sessionService: SessionServicePort,
  ) {}

  async execute(input: LoginCustomerUseCaseInput): Promise<LoginCustomerUseCaseOutput> {
    // Normalize phone
    const normalizedPhone = this.normalizePhone(input.phone);

    // Look up account by nationality and normalized phone
    const existing = await this.customerAccountRepo.findByNationalityAndPhone(
      input.nationality,
      normalizedPhone,
    );
    if (existing === null) {
      throw new DomainError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Verify password
    const passwordValid = await this.passwordHasher.verify(input.password, existing.account.passwordHash);
    if (!passwordValid) {
      throw new DomainError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Sign session token
    const token = this.sessionService.signToken({
      sub: existing.account.id.value,
      role: 'CUSTOMER',
    });

    return {
      token,
      customer: {
        id: existing.account.id.value,
        name: existing.customer.name,
        phone: existing.customer.phone,
        nationality: existing.account.nationality,
      },
    };
  }

  private normalizePhone(phone: string): string {
    const plusPrefix = phone.startsWith('+') ? '+' : '';
    const digits = phone.replace(/[^0-9]/g, '');
    return plusPrefix + digits.replace(/^\+/, '');
  }
}