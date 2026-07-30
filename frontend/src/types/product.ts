export interface ProductList {
  id: number;
  name: string;
  price: number;
  image: string | null;
}

export interface ProductDetail extends ProductList {
  description: string;
  modifiers: string[] | null;
}
