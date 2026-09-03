import { Entity, DomainError } from '@shared/kernel';
import { CustomerId } from '@domain/customer';
import { StaffRole } from '@domain/auth';

interface CustomerAccountProps {
  id: CustomerId;
  nationality: string;
  passwordHash: string;
  phone: string;
}

export class CustomerAccount extends Entity<CustomerId> {
  private readonly _nationality: string;
  private readonly _passwordHash: string;
  private readonly _phone: string;

  private constructor(props: CustomerAccountProps) {
    super(props.id);
    this._nationality = props.nationality;
    this._passwordHash = props.passwordHash;
    this._phone = props.phone;
  }

  get nationality(): string {
    return this._nationality;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get phone(): string {
    return this._phone;
  }

  static create(customerId: CustomerId, nationality: string, passwordHash: string, phone: string): CustomerAccount {
    const nationalityRegex = /^\+\d{1,4}$/;
    if (!nationalityRegex.test(nationality)) {
      throw new DomainError('INVALID_NATIONALITY', `Invalid nationality format: ${nationality}`);
    }
    if (!phone || phone.trim() === '') {
      throw new DomainError('INVALID_CUSTOMER_PHONE', 'Customer phone cannot be empty');
    }
    return new CustomerAccount({
      id: customerId,
      nationality,
      passwordHash,
      phone: phone.trim(),
    });
  }

  static reconstruct(
    customerId: CustomerId,
    nationality: string,
    passwordHash: string,
    phone: string,
  ): CustomerAccount {
    return new CustomerAccount({
      id: customerId,
      nationality,
      passwordHash,
      phone,
    });
  }
}