export abstract class ValueObject<Props> {
  private readonly _props: Props;

  protected constructor(props: Props) {
    this._props = Object.freeze(props);
  }

  get props(): Props {
    return this._props;
  }

  equals(other: ValueObject<Props>): boolean {
    if (other === null || other === undefined) return false;
    if (this === other) return true;
    return JSON.stringify(this._props) === JSON.stringify(other._props);
  }
}