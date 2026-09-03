import { DomainError } from '@shared/kernel';
import { ValueObject } from '@shared/kernel';

export class StaffRole extends ValueObject<{ role: string }> {
  private readonly _role: string;

  private constructor(props: { role: string }) {
    super(props);
    this._role = props.role;
  }

  get role(): string {
    return this._role;
  }

  static create(role: string): StaffRole {
    if (role !== 'ADMIN' && role !== 'STAFF') {
      throw new DomainError('INVALID_STAFF_ROLE', `Invalid staff role: ${role}`);
    }
    return new StaffRole({ role });
  }

  static get ADMIN(): StaffRole {
    return new StaffRole({ role: 'ADMIN' });
  }

  static get STAFF(): StaffRole {
    return new StaffRole({ role: 'STAFF' });
  }
}