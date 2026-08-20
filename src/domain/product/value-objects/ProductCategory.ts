export const ProductCategory = {
  BURGERS: 'BURGERS',
  SIDES: 'SIDES',
  DRINKS: 'DRINKS',
  DESSERTS: 'DESSERTS',
  COMBOS: 'COMBOS',
} as const;

export type ProductCategory = (typeof ProductCategory)[keyof typeof ProductCategory];

export function isValidProductCategory(value: string): value is ProductCategory {
  return Object.values(ProductCategory).includes(value as ProductCategory);
}