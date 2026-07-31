export interface Category {
  id: number;
  name: string;
}

export interface ProductList {
  id: number;
  name: string;
  price: number;
  image: string | null;
  category: Category | null;
}

export interface ProductDetail extends ProductList {
  description: string;
  modifiers: string[] | null;
}
