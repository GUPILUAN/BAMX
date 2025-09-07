import { retrieveData } from "@/api/apiCalls";
import { InventoryItem } from "@/types/InventoryItem";
import { useEffect, useState } from "react";

const useFetchProducts = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const productsF = await retrieveData("/api/inventario/");
      setProducts(productsF);
    };
    fetchProducts();
  }, []);

  return products;
};

export default useFetchProducts;