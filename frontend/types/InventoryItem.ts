export type InventoryItem = {
  product_id: string;           // Inve01.CVE_ART
  product_name: string;         // Inve01.DESCR
  lot: string | null;           // Ltpd01.LOTE, puede ser null
  available_quantity: number;   // Ltpd01.CANTIDAD
  production_date: string | null; // Ltpd01.FEC_PROD_LT
  expiration_date: string | null; // Ltpd01.FCHCADUC
  last_movement: string | null;   // Ltpd01.FCHULTMOV
  warehouse: number | null;     // Ltpd01.CVE_ALM
  status: string | null;        // Ltpd01.STATUS
  type: string | null;           // Inve01.LINEA
  image: string | null;   
};
