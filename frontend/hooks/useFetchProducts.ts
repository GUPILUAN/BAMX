import { retrieveData } from "@/api/apiCalls";
import { productosDummy } from "@/constants/Products";
import { InventoryItem } from "@/types/InventoryItem";
import { useEffect, useState } from "react";

const useFetchProducts = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const data = await retrieveData("/api/lotes/");

      setProducts(data?.content || productosDummy.items);
    };
    fetchProducts();
  }, []);

  return products;
};

export default useFetchProducts;
