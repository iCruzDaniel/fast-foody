import { DomainError } from '@shared/kernel';
import { StaffAccount, StaffRole, StaffId } from '@domain/auth';
import { StaffRepositoryPort } from '@domain/auth/repositories';
import { PasswordHasherPort } from '@domain/auth/services';

export interface RegisterStaffUseCaseInput {
  actorRole: string;
  username: string;
  password: string;
}

export interface RegisterStaffUseCaseOutput {
  staff: {
    id: string;
    username: string;
    role: string;
  };
}

export type RegisterStaffInput = RegisterStaffUseCaseInput;

export class RegisterStaffUseCase {
  constructor(private readonly staffRepo: StaffRepositoryPort, private readonly passwordHasher: PasswordHasherPort) {}

  async execute(input: RegisterStaffUseCaseInput): Promise<RegisterStaffUseCaseOutput> {
    // Only ADMIN can register staff
    if (input.actorRole !== 'ADMIN') {
      throw new DomainError('FORBIDDEN', 'Only ADMIN can register staff');
    }

    // Check if username already taken
    const existing = await this.staffRepo.findByUsername(input.username);
    if (existing !== null) {
      throw new DomainError('USERNAME_TAKEN', 'Username already taken');
    }

    // Staff role is always STAFF when registering via this use case
    const staffRole = StaffRole.STAFF; // Will be enforced by domain, but using literal for simplicity
    const staffId = StaffId.create();
    const passwordHash = await this.passwordHasher.hash(input.password);

    const staff = StaffAccount.create(staffId, input.username, passwordHash, staffRole);
    await this.staffRepo.save(staff);

    return {
      staff: {
        id: staff.id.value,
        username: staff.username,
        role: staff.role.role,
      },
    };
  }
}