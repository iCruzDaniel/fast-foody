import { Entity, DomainError } from '@shared/kernel';
import { Money } from '@domain/order';
import { ProductId, ProductCategory, type ProductCategory as ProductCategoryType } from '@domain/product';

interface ProductProps {
  id: ProductId;
  name: string;
  description: string;
  price: Money;
  category: ProductCategoryType;
  available: boolean;
}

export class Product extends Entity<ProductId> {
  private readonly _name: string;
  private readonly _description: string;
  private readonly _price: Money;
  private readonly _category: ProductCategoryType;
  private readonly _available: boolean;

  private constructor(props: ProductProps) {
    super(props.id);
    this._name = props.name;
    this._description = props.description;
    this._price = props.price;
    this._category = props.category;
    this._available = props.available;
  }

  get name(): string {
    return this._name;
  }

  get description(): string {
    return this._description;
  }

  get price(): Money {
    return this._price;
  }

  get category(): ProductCategoryType {
    return this._category;
  }

  get available(): boolean {
    return this._available;
  }

  static create(
    id: ProductId,
    name: string,
    description: string,
    price: Money,
    category: ProductCategoryType,
    available: boolean = true
  ): Product {
    if (!name || name.trim() === '') {
      throw new DomainError('INVALID_PRODUCT_NAME', 'Product name cannot be empty');
    }
    if (name.length > 80) {
      throw new DomainError('INVALID_PRODUCT_NAME', 'Product name cannot exceed 80 characters');
    }
    if (description && description.length > 300) {
      throw new DomainError('INVALID_PRODUCT_DESCRIPTION', 'Product description cannot exceed 300 characters');
    }
    if (price.amount <= 0) {
      throw new DomainError('INVALID_PRODUCT_PRICE', 'Product price must be greater than zero');
    }

    return new Product({
      id,
      name: name.trim(),
      description: description?.trim() ?? '',
      price,
      category,
      available,
    });
  }

  changePrice(newPrice: Money): Product {
    if (newPrice.amount <= 0) {
      throw new DomainError('INVALID_PRODUCT_PRICE', 'Product price must be greater than zero');
    }
    return new Product({
      id: this.id,
      name: this._name,
      description: this._description,
      price: newPrice,
      category: this._category,
      available: this._available,
    });
  }

  markUnavailable(): Product {
    return new Product({
      id: this.id,
      name: this._name,
      description: this._description,
      price: this._price,
      category: this._category,
      available: false,
    });
  }

  markAvailable(): Product {
    return new Product({
      id: this.id,
      name: this._name,
      description: this._description,
      price: this._price,
      category: this._category,
      available: true,
    });
  }

  rename(newName: string): Product {
    if (!newName || newName.trim() === '') {
      throw new DomainError('INVALID_PRODUCT_NAME', 'Product name cannot be empty');
    }
    if (newName.length > 80) {
      throw new DomainError('INVALID_PRODUCT_NAME', 'Product name cannot exceed 80 characters');
    }
    return new Product({
      id: this.id,
      name: newName.trim(),
      description: this._description,
      price: this._price,
      category: this._category,
      available: this._available,
    });
  }

  static reconstruct(
    id: ProductId,
    name: string,
    description: string,
    price: Money,
    category: ProductCategoryType,
    available: boolean
  ): Product {
    return new Product({
      id,
      name,
      description,
      price,
      category,
      available,
    });
  }
}