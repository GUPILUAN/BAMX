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

  const [itemsPerPage, setItemsPerPage] = useState(7);
  const [sortBy, setSortBy] = useState<"linProd" | "exist" | "cveArt">(
    "cveArt"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [currentPage, setCurrentPage] = useState(0);

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
        const response = (await apiService.retrieveData(
          `/api/inventarios/?page=${currentPage}&size=${itemsPerPage}&sort=${sortBy}&direction=${sortDirection}&search=${debouncedQuery}`
        )) as PageResponse<InventoryItem>;
        setProducts(response.content || []);
        setTotalPages(response.totalPages);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, [currentPage, itemsPerPage, sortBy, sortDirection, debouncedQuery]);

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
  };
};
