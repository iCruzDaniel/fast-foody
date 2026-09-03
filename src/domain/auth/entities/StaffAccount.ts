import { Entity, DomainError } from '@shared/kernel';
import { StaffId } from '@domain/auth';
import { StaffRole } from '@domain/auth';

interface StaffAccountProps {
  id: StaffId;
  username: string;
  passwordHash: string;
  role: StaffRole;
  active: boolean;
}

export class StaffAccount extends Entity<StaffId> {
  private readonly _username: string;
  private readonly _passwordHash: string;
  private readonly _role: StaffRole;
  private readonly _active: boolean;

  private constructor(props: StaffAccountProps) {
    super(props.id);
    this._username = props.username;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._active = props.active;
  }

  get username(): string {
    return this._username;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get role(): StaffRole {
    return this._role;
  }

  get isActive(): boolean {
    return this._active;
  }

  static create(id: StaffId, username: string, passwordHash: string, role: StaffRole): StaffAccount {
    if (!username || username.trim().length === 0) {
      throw new DomainError('INVALID_STAFF_USERNAME', 'Staff username cannot be empty');
    }
    if (username.trim().length < 3) {
      throw new DomainError('INVALID_STAFF_USERNAME', 'Staff username must be at least 3 characters');
    }
    return new StaffAccount({
      id,
      username: username.trim(),
      passwordHash,
      role,
      active: true,
    });
  }

  static reconstruct(
    id: StaffId,
    username: string,
    passwordHash: string,
    role: StaffRole,
    active: boolean,
  ): StaffAccount {
    return new StaffAccount({
      id,
      username,
      passwordHash,
      role,
      active,
    });
  }

  deactivate(): StaffAccount {
    return StaffAccount.reconstruct(this.id, this._username, this._passwordHash, this._role, false);
  }

  activate(): StaffAccount {
    return StaffAccount.reconstruct(this.id, this._username, this._passwordHash, this._role, true);
  }
}