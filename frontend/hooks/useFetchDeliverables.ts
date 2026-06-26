import { apiService } from "@/api/apiService";
import { Lot } from "@/types/Lot";
import {
  DeliverableProduct,
  DeliverableVariant,
} from "@/types/DeliverableProduct";
import { useCallback, useEffect, useState } from "react";

// La caducidad "más temprana" gana. null (sin caducidad capturada) domina: en
// no aptos es lo más crítico/desconocido, así que ese producto se muestra como
// "Sin caducidad".
function earlier(a: string | null, b: string | null): string | null {
  if (a == null) return a;
  if (b == null) return b;
  return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}

// Colapsa los lotes (LTPD) en una tarjeta por producto: suma cantidades y se
// queda con la caducidad más próxima. Ordena por frescura ascendente (lo que
// caduca antes primero; sin caducidad al frente por ser lo más crítico).
function aggregateByProduct(lots: Lot[]): DeliverableProduct[] {
  const byId = new Map<string, DeliverableProduct>();

  for (const lot of lots) {
    if (!lot?.product_id) continue;
    const qty = Number(lot.available_quantity) || 0;
    const current = byId.get(lot.product_id);

    if (!current) {
      byId.set(lot.product_id, {
        product_id: lot.product_id,
        product_name: lot.product_name,
        type: lot.type ?? null,
        type_id: lot.type_id ?? null,
        image: lot.image ?? null,
        total_quantity: qty,
        nearest_expiration: lot.expiration_date ?? null,
        lots_count: 1,
      });
    } else {
      current.total_quantity += qty;
      current.lots_count += 1;
      current.nearest_expiration = earlier(
        current.nearest_expiration,
        lot.expiration_date ?? null
      );
      if (!current.image && lot.image) current.image = lot.image;
    }
  }

  return Array.from(byId.values()).sort((a, b) => {
    if (a.nearest_expiration == null) return -1;
    if (b.nearest_expiration == null) return 1;
    return (
      new Date(a.nearest_expiration).getTime() -
      new Date(b.nearest_expiration).getTime()
    );
  });
}

// Trae los lotes del bucket pedido desde /api/lotes/ (el backend filtra por
// fitForDelivery) y los agrega por producto. size=500 cubre con holgura el
// volumen real de lotes capturados en BAMX hoy; el filtro mantiene el payload
// chico. Si el API falla, retrievaData devuelve undefined -> lista vacía ->
// empty state honesto en la pantalla.
export function useFetchDeliverables(variant: DeliverableVariant) {
  const [products, setProducts] = useState<DeliverableProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fitForDelivery = variant === "entregable";

  const load = useCallback(async () => {
    setLoading(true);
    const data = await apiService.retrieveData(
      `/api/lotes/?fitForDelivery=${fitForDelivery}&size=500&sort=fchCaduc&direction=asc`
    );
    const lots: Lot[] = data?.content ?? [];
    setProducts(aggregateByProduct(lots));
    setLoading(false);
  }, [fitForDelivery]);

  useEffect(() => {
    load();
  }, [load]);

  const totalQuantity = products.reduce((sum, p) => sum + p.total_quantity, 0);

  return {
    products,
    totalQuantity,
    totalCount: products.length,
    loading,
    refresh: load,
  };
}

export default useFetchDeliverables;
