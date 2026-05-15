import { apiService } from "@/api/apiService";
import { InventoryItem } from "@/types/InventoryItem";
import { PageResponse } from "@/types/PageResponse";
import { useEffect, useState } from "react";
import { Keyboard, Platform } from "react-native";

export const useFetchProducts = () => {
  const [products, setProducts] = useState<InventoryItem[]>([]);
  const [totalPages, setTotalPages] = useState(0);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState(query);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const handleAction = (ids: string[]) => setSelectedIds(ids);

  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sortBy, setSortBy] = useState<"linProd" | "exist" | "cveArt">(
    "cveArt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(0);

  const [onlyWithStock, setOnlyWithStockState] = useState<boolean>(true);
  // Resetea la página al cambiar el filtro para que no quedes en una página
  // que ya no existe en el nuevo dataset (filtrado vs completo).
  const setOnlyWithStock = (value: boolean) => {
    setOnlyWithStockState(value);
    setCurrentPage(0);
  };

  const loadMore = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1));
  const loadLess = () => setCurrentPage((prev) => Math.max(prev - 1, 0));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
      setCurrentPage(0);
      setSelectedIds([]);
      if (Platform.OS !== "web") {
        Keyboard.dismiss();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Cuando hay búsqueda activa, ignoramos el toggle para que el usuario
        // siempre encuentre lo que busca aunque el producto esté sin stock.
        const effectiveOnlyWithStock =
          debouncedQuery.trim() === "" && onlyWithStock;
        const response = (await apiService.retrieveData(
          `/api/inventarios/?page=${currentPage}&size=${itemsPerPage}&sort=${sortBy}&direction=${sortDirection}&search=${debouncedQuery}&onlyWithStock=${effectiveOnlyWithStock}`
        )) as PageResponse<InventoryItem>;
        setProducts(response.content || []);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [
    currentPage,
    itemsPerPage,
    sortBy,
    sortDirection,
    debouncedQuery,
    onlyWithStock,
  ]);

  return {
    products,
    handleAction,
    selectedIds,
    loadLess,
    loadMore,
    currentPage,
    totalPages,
    query,
    setQuery,
    setCurrentPage,
    setItemsPerPage,
    sortBy,
    setSortBy,
    sortDirection,
    setSortDirection,
    onlyWithStock,
    setOnlyWithStock,
  };
};
