import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@shared/kernel';

interface CustomerIdProps {
  value: string;
}

export class CustomerId extends ValueObject<CustomerIdProps> {
  private constructor(props: CustomerIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): CustomerId {
    return new CustomerId({ value: uuidv4() });
  }

  static fromString(value: string): CustomerId {
    if (!value || value.trim() === '') {
      throw new Error('CustomerId cannot be empty');
    }
    return new CustomerId({ value });
  }

  toString(): string {
    return this.props.value;
  }
}