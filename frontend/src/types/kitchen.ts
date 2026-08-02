export interface KitchenOrderProduct {
  id: number;
  item_id: number;
  item_name: string | null;
  item_image: string | null;
  quantity: number;
  price: string;
  excluded_modifiers: string[] | null;
}

export interface KitchenOrder {
  id: number;
  order_number: number;
  date: string;
  branch_id: number;
  client_id: number;
  client_name: string | null;
  total: string;
  state: string;
  payment_status: string;
  created_at: string;
  comment: string | null;
  order_products: KitchenOrderProduct[];
}
