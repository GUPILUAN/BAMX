import {
  View,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import SearchHeader from "@/components/SearchHeader/SearchHeader";
import ProductList from "@/components/ProductList/ProductList";
import { useFetchProducts } from "@/hooks/useFetchProducts";

export default function InventoryScreen() {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const themeColorsTailwind = {
    backgroundTailwind: isDark ? "bg-gray-900" : "bg-gray-50",
    textTailwind: isDark ? "text-gray-300" : "text-gray-900",
  };

  const {
    products,
    query,
    loadLess,
    loadMore,
    totalPages,
    setCurrentPage,
    currentPage,
    setQuery,
    setSortBy,
    sortBy,
    sortDirection,
    setSortDirection,
    onlyWithStock,
    setOnlyWithStock,
  } = useFetchProducts();

  return (
    <SafeAreaView
      className={`${themeColorsTailwind.backgroundTailwind} flex-1`}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => Platform.OS !== "web" && Keyboard.dismiss()}
          accessible={false}
        >
          <View
            className={`${themeColorsTailwind.backgroundTailwind} flex-1 w-full items-center`}
          >
            {/* 🔍 Header de búsqueda */}
            <SearchHeader
              handleChangeQuery={setQuery}
              query={query}
              handleOrder={setSortDirection}
              handleSort={setSortBy}
              sortBy={sortBy}
              sortDirection={sortDirection}
              onlyWithStock={onlyWithStock}
              setOnlyWithStock={setOnlyWithStock}
            />

            {/* 📦 Lista de productos */}
            <ProductList
              productos={products}
              isDark={isDark}
              currentPage={currentPage}
              totalPages={totalPages}
              loadMore={loadMore}
              loadLess={loadLess}
              setCurrentPage={setCurrentPage}
            />
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
