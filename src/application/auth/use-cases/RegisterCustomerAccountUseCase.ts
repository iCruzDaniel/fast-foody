import { DomainError } from '@shared/kernel';
import { CustomerId } from '@domain/customer';
import { Customer } from '@domain/customer';
import { CustomerAccount, CustomerAccountRepositoryPort } from '@domain/auth';
import { CustomerRepositoryPort } from '@domain/customer';
import { PasswordHasherPort } from '@domain/auth/services';
import { SessionServicePort } from '@domain/auth/services';

export interface RegisterCustomerAccountUseCaseInput {
  name: string;
  phone: string;
  nationality: string;
  password: string;
}

export interface RegisterCustomerAccountUseCaseOutput {
  token: string;
  customer: {
    id: string;
    name: string;
    phone: string;
    nationality: string;
  };
}

export type RegisterCustomerInput = RegisterCustomerAccountUseCaseInput;

export class RegisterCustomerAccountUseCase {
  constructor(
    private readonly customerRepo: CustomerRepositoryPort,
    private readonly customerAccountRepo: CustomerAccountRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly sessionService: SessionServicePort,
  ) {}

  async execute(input: RegisterCustomerAccountUseCaseInput): Promise<RegisterCustomerAccountUseCaseOutput> {
    // Normalize phone: strip all non-digits except a leading +
    const normalizedPhone = this.normalizePhone(input.phone);

    // Validate nationality format
    const nationalityRegex = /^\+\d{1,4}$/;
    if (!nationalityRegex.test(input.nationality)) {
      throw new DomainError('INVALID_NATIONALITY', 'Invalid nationality format');
    }

    // Check if account already exists by (nationality, normalizedPhone)
    const existing = await this.customerAccountRepo.findByNationalityAndPhone(
      input.nationality,
      normalizedPhone,
    );
    if (existing !== null) {
      throw new DomainError('ACCOUNT_ALREADY_EXISTS', 'An account with this phone and nationality already exists');
    }

    // Create Customer entity
    const customerId = CustomerId.create();
    const customer = await Customer.create(customerId, input.name, input.phone);
    await this.customerRepo.save(customer);

    // Hash password
    const passwordHash = await this.passwordHasher.hash(input.password);

    // Create CustomerAccount
    const customerAccount = await CustomerAccount.create(customerId, input.nationality, passwordHash, input.phone);
    await this.customerAccountRepo.save(customerAccount);

    // Sign session token
    const token = this.sessionService.signToken({
      sub: customerId.value,
      role: 'CUSTOMER',
    });

    return {
      token,
      customer: {
        id: customerId.value,
        name: customer.name,
        phone: customer.phone,
        nationality: customerAccount.nationality,
      },
    };
  }

  private normalizePhone(phone: string): string {
    // Keep leading + if present, strip all other non-digits
    const plusPrefix = phone.startsWith('+') ? '+' : '';
    const digits = phone.replace(/[^0-9]/g, '');
    return plusPrefix + digits.replace(/^\+/, ''); // Remove any + from the digit-only part
  }
}