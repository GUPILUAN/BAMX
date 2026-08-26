import { apiService } from "@/api/apiService";
import { ProductLocation } from "@/types/ProductLocation";
import { useEffect, useState } from "react";

// Trae el desglose por almacén de un producto. Se pide al abrir el detalle y no
// dentro del listado a propósito: getAllInve ya hace 3 queries de almacén por
// fila, y meter esto ahí multiplicaría el N+1 que ya arrastra el inventario.
export function useFetchProductWarehouses(productId: string | null | undefined) {
  const [location, setLocation] = useState<ProductLocation | null>(null);
  const [loading, setLoading] = useState<boolean>(!!productId);

  useEffect(() => {
    let cancelled = false;

    if (!productId) {
      setLocation(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    const fetchWarehouses = async () => {
      const data = await apiService.retrieveData(
        `/api/inventarios/${encodeURIComponent(productId)}/almacenes`
      );
      if (cancelled) return;
      // retrieveData se traga los errores de red y devuelve undefined. Dejamos
      // null para que la sección muestre su estado vacío en vez de inventar una
      // ubicación (el mismo error que comete useFetchLotes con productosDummy).
      setLocation(data ?? null);
      setLoading(false);
    };
    fetchWarehouses();

    return () => {
      cancelled = true;
    };
  }, [productId]);

  return { location, loading };
}
