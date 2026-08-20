import { ValueObject } from '@shared/kernel';
import { DomainError } from '@shared/kernel';

interface MoneyProps {
  amount: number;
  currency: string;
}

export class Money extends ValueObject<MoneyProps> {
  private constructor(props: MoneyProps) {
    super(props);
  }

  get amount(): number {
    return this.props.amount;
  }

  get currency(): string {
    return this.props.currency;
  }

  static create(amount: number, currency: string = 'COP'): Money {
    if (!Number.isInteger(amount)) {
      throw new DomainError('INVALID_MONEY_AMOUNT', 'Money amount must be an integer (cents)');
    }
    if (amount < 0) {
      throw new DomainError('INVALID_MONEY_AMOUNT', 'Money amount cannot be negative');
    }
    if (!currency || currency.trim() === '') {
      throw new DomainError('INVALID_CURRENCY', 'Currency cannot be empty');
    }
    return new Money({ amount, currency: currency.toUpperCase() });
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new DomainError('CURRENCY_MISMATCH', `Cannot add ${this.currency} and ${other.currency}`);
    }
    return Money.create(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    if (!Number.isInteger(factor) && factor !== Math.floor(factor)) {
      throw new DomainError('INVALID_FACTOR', 'Factor must be an integer');
    }
    if (factor < 0) {
      throw new DomainError('INVALID_FACTOR', 'Factor cannot be negative');
    }
    return Money.create(this.amount * factor, this.currency);
  }

  equals(other: Money): boolean {
    return super.equals(other);
  }

  toString(): string {
    return `${(this.amount / 100).toFixed(2)} ${this.currency}`;
  }
}