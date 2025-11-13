export type Lot = {
  product_id: string;
  product_name: string;
  lot: string | null;
  available_quantity: number;
  production_date: string | null;
  expiration_date: string | null;
  last_movement: string | null;
  warehouse: number | null;
  status: string | null;
  type: string | null;
  type_id: string | null;
  image: string | null;
};
