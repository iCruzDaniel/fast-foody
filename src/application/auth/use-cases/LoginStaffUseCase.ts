import { DomainError } from '@shared/kernel';
import { StaffAccount, StaffId } from '@domain/auth';
import { StaffRepositoryPort } from '@domain/auth/repositories';
import { PasswordHasherPort } from '@domain/auth/services';
import { SessionServicePort } from '@domain/auth/services';

export interface LoginStaffUseCaseInput {
  username: string;
  password: string;
}

export interface LoginStaffUseCaseOutput {
  token: string;
  staff: {
    id: string;
    username: string;
    role: 'ADMIN' | 'STAFF';
  };
}

export type LoginStaffInput = LoginStaffUseCaseInput;

export class LoginStaffUseCase {
  constructor(
    private readonly staffRepo: StaffRepositoryPort,
    private readonly passwordHasher: PasswordHasherPort,
    private readonly sessionService: SessionServicePort,
  ) {}

  async execute(input: LoginStaffUseCaseInput): Promise<LoginStaffUseCaseOutput> {
    // Look up staff by username
    const existing = await this.staffRepo.findByUsername(input.username);
    if (existing === null || !existing.isActive) {
      throw new DomainError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Verify password
    const passwordValid = await this.passwordHasher.verify(input.password, existing.passwordHash);
    if (!passwordValid) {
      throw new DomainError('INVALID_CREDENTIALS', 'Invalid credentials');
    }

    // Sign session token with staff role
    const role: 'ADMIN' | 'STAFF' = existing.role.role as 'ADMIN' | 'STAFF';
    const token = this.sessionService.signToken({
      sub: existing.id.value,
      role,
    });

    return {
      token,
      staff: {
        id: existing.id.value,
        username: existing.username,
        role,
      },
    };
  }
}