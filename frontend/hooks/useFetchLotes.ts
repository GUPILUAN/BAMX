import { apiService } from "@/api/apiService";
import { productosDummy } from "@/constants/Products";
import { Lot } from "@/types/Lot";
import { useEffect, useState } from "react";

// El Semáforo clasifica y suma TODOS los lotes, así que no puede quedarse con la
// primera página: /api/lotes/ pagina de 20 en 20 ordenando por caducidad
// ascendente, y con ese default los lotes estables nunca alcanzan a entrar en la
// respuesta (el Home los reporta como 0). Mismo tamaño que usa
// useFetchDeliverables: cubre con holgura el volumen real de lotes de BAMX.
const PAGE_SIZE = 500;

const useFetchLotes = () => {
  const [lotes, setLotes] = useState<Lot[]>([]);
  useEffect(() => {
    const fetchLotes = async () => {
      const data = await apiService.retrieveData(`/api/lotes/?size=${PAGE_SIZE}`);

      setLotes(data?.content || productosDummy.items);
    };
    fetchLotes();
  }, []);

  return lotes;
};

export default useFetchLotes;
