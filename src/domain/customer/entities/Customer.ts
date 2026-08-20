import { Entity, DomainError } from '@shared/kernel';
import { CustomerId } from '@domain/customer';

interface CustomerProps {
  id: CustomerId;
  name: string;
  phone: string;
}

export class Customer extends Entity<CustomerId> {
  private readonly _name: string;
  private readonly _phone: string;

  private constructor(props: CustomerProps) {
    super(props.id);
    this._name = props.name;
    this._phone = props.phone;
  }

  get name(): string {
    return this._name;
  }

  get phone(): string {
    return this._phone;
  }

  static create(id: CustomerId, name: string, phone: string): Customer {
    if (!name || name.trim() === '') {
      throw new DomainError('INVALID_CUSTOMER_NAME', 'Customer name cannot be empty');
    }
    if (!phone || phone.trim() === '') {
      throw new DomainError('INVALID_CUSTOMER_PHONE', 'Customer phone cannot be empty');
    }
    const phoneRegex = /^[\d\s\-\+\(\)]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      throw new DomainError('INVALID_CUSTOMER_PHONE', 'Invalid phone format');
    }

    return new Customer({
      id,
      name: name.trim(),
      phone: phone.trim(),
    });
  }

  static reconstruct(
    id: CustomerId,
    name: string,
    phone: string
  ): Customer {
    return new Customer({
      id,
      name,
      phone,
    });
  }
}