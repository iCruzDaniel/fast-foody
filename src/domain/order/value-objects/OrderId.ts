import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@shared/kernel';

interface OrderIdProps {
  value: string;
}

export class OrderId extends ValueObject<OrderIdProps> {
  private constructor(props: OrderIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): OrderId {
    return new OrderId({ value: uuidv4() });
  }

  static fromString(value: string): OrderId {
    if (!value || value.trim() === '') {
      throw new Error('OrderId cannot be empty');
    }
    return new OrderId({ value });
  }

  toString(): string {
    return this.props.value;
  }
}