import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@shared/kernel';

interface ProductIdProps {
  value: string;
}

export class ProductId extends ValueObject<ProductIdProps> {
  private constructor(props: ProductIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): ProductId {
    return new ProductId({ value: uuidv4() });
  }

  static fromString(value: string): ProductId {
    if (!value || value.trim() === '') {
      throw new Error('ProductId cannot be empty');
    }
    return new ProductId({ value });
  }

  toString(): string {
    return this.props.value;
  }
}