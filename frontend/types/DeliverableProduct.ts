// Variante de pantalla / bucket de caducidad:
//  - "entregable": semáforo verde+amarillo (apto para entregar).
//  - "noapto": semáforo rojo (caducado, por caducar o sin caducidad capturada).
export type DeliverableVariant = "entregable" | "noapto";

// Producto agregado desde sus lotes (LTPD) para las pantallas de entregables /
// no aptos. Una tarjeta = un producto: total_quantity suma los lotes del bucket
// y nearest_expiration es la caducidad más próxima (la más conservadora, que
// alimenta el indicador de frescura de la tarjeta).
export type DeliverableProduct = {
  product_id: string;
  product_name: string;
  type: string | null;
  type_id: string | null;
  image: string | null;
  total_quantity: number;
  nearest_expiration: string | null;
  lots_count: number;
};
