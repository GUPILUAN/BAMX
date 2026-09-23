// Respuesta de GET /api/inventarios/{cveArt}/almacenes.

export type ProductWarehouse = {
  warehouse_id: number;
  warehouse_name: string;
  // Existencia del catálogo multi-almacén de Aspel (MULT.EXIST).
  stock_quantity: number;
  // Suma de los lotes activos (LTPD.CANTIDAD) en ese almacén. Aspel lleva las
  // dos cifras por separado y en BAMX están desfasadas, así que el backend
  // manda ambas en vez de elegir una.
  lots_quantity: number;
  lots_count: number;
  lots_without_expiration: number;
  nearest_expiration: string | null;
};

export type ProductLocation = {
  product_id: string;
  product_name: string;
  unit: string | null;
  total_quantity: number;
  warehouses: ProductWarehouse[];
};
