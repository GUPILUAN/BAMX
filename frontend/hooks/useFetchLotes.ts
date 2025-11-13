import { apiService } from "@/api/apiService";
import { productosDummy } from "@/constants/Products";
import { Lot } from "@/types/Lot";
import { useEffect, useState } from "react";

const useFetchLotes = () => {
  const [lotes, setLotes] = useState<Lot[]>([]);
  useEffect(() => {
    const fetchLotes = async () => {
      const data = await apiService.retrieveData("/api/lotes/");

      setLotes(data?.content || productosDummy.items);
    };
    fetchLotes();
  }, []);

  return lotes;
};

export default useFetchLotes;
