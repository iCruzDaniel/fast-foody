import { ValueObject } from '@shared/kernel';
import { DomainError } from '@shared/kernel';

interface QuantityProps {
  value: number;
}

export class Quantity extends ValueObject<QuantityProps> {
  private constructor(props: QuantityProps) {
    super(props);
  }

  get value(): number {
    return this.props.value;
  }

  static create(value: number): Quantity {
    if (!Number.isInteger(value)) {
      throw new DomainError('INVALID_QUANTITY', 'Quantity must be an integer');
    }
    if (value < 1 || value > 50) {
      throw new DomainError('INVALID_QUANTITY', 'Quantity must be between 1 and 50');
    }
    return new Quantity({ value });
  }

  equals(other: Quantity): boolean {
    return super.equals(other);
  }
}