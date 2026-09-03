import { v4 as uuidv4 } from 'uuid';
import { ValueObject } from '@shared/kernel';

interface StaffIdProps {
  value: string;
}

export class StaffId extends ValueObject<StaffIdProps> {
  private constructor(props: StaffIdProps) {
    super(props);
  }

  get value(): string {
    return this.props.value;
  }

  static create(): StaffId {
    return new StaffId({ value: uuidv4() });
  }

  static fromString(value: string): StaffId {
    if (!value || value.trim() === '') {
      throw new Error('StaffId cannot be empty');
    }
    return new StaffId({ value });
  }

  toString(): string {
    return this.props.value;
  }
}