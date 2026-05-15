import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import ProductRow from "../ProductRow/ProductRow";
import { InventoryItem } from "@/types/InventoryItem";
import { themeColors } from "@/theme";
import { FontAwesome6 } from "@expo/vector-icons";

type ProductListProps = {
  productos: InventoryItem[];
  isDark?: boolean;
  currentPage: number;
  totalPages: number;
  loadMore: () => void;
  loadLess: () => void;
  setCurrentPage: (page: number) => void;
};

export default function ProductList({
  productos,
  isDark = false,
  currentPage,
  totalPages,
  loadMore,
  loadLess,
  setCurrentPage,
}: ProductListProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const columns = [
    { label: "Producto", flex: 2 },
    { label: "Cantidad", flex: 1 },
    { label: "Tipo", flex: 1 },
    { label: "Almacenes", flex: 1.5 },
    { label: "Prioridad", flex: 1.5 },
  ];

  // Maximo 10 paginas visibles en la barra
  const getVisiblePages = () => {
    const maxVisible = 10;
    let start = Math.max(currentPage - Math.floor(maxVisible / 2), 0);
    let end = start + maxVisible;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(end - maxVisible, 0);
    }
    return Array.from({ length: end - start }, (_, i) => start + i);
  };

  const renderHeader = () => (
    <View
      style={[
        styles.headerRow,
        {
          backgroundColor: themeColors.headerBackground(isDark),
          borderBottomColor: isDark ? "#555" : "#ccc",
        },
      ]}
    >
      {columns.map((col, idx, arr) => (
        <View
          key={col.label}
          style={{
            flex: col.flex,
            justifyContent: "center",
            alignItems: "center",
            borderRightWidth: idx < arr.length - 1 ? 1 : 0,
            borderRightColor: isDark ? "#555" : "#ddd",
            paddingVertical: 8,
          }}
        >
          <Text
            style={{
              color: themeColors.text(isDark),
              fontWeight: "700",
              fontSize: 14,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {col.label}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.tableContainer,
          { borderColor: isDark ? "#555" : "#ccc" },
        ]}
      >
        <FlatList
          data={productos}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          stickyHeaderIndices={[0]}
          renderItem={({ item, index }) => (
            <ProductRow
              style={{
                paddingVertical: 15,
                paddingHorizontal: 8,
                alignItems: "center",
                justifyContent: "center",
              }}
              isDark={isDark}
              index={index}
              product={item}
              isSelected={selectedIds.includes(item.id)}
              handleSelect={handleSelect}
            />
          )}
          showsVerticalScrollIndicator
        />
      </View>

      {totalPages > 1 && (
        <View
          style={[
            styles.paginationContainer,
            {
              backgroundColor: themeColors.background(isDark),
              borderTopColor: isDark ? "#555" : "#ddd",
            },
          ]}
        >
          {currentPage > 0 ? (
            <TouchableOpacity onPress={loadLess} style={styles.pageArrow}>
              <FontAwesome6 name="arrow-left" size={20} color="red" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32, height: 32, marginHorizontal: 3 }} />
          )}

          {getVisiblePages().map((num) => (
            <TouchableOpacity
              key={num}
              onPress={() => setCurrentPage(num)}
              style={[
                styles.pageNumber,
                currentPage === num && styles.pageNumberActive,
              ]}
            >
              <Text
                style={{
                  color: "#475569",
                  fontWeight: currentPage === num ? "700" : "500",
                }}
              >
                {num + 1}
              </Text>
            </TouchableOpacity>
          ))}

          {currentPage < totalPages - 1 ? (
            <TouchableOpacity onPress={loadMore} style={styles.pageArrow}>
              <FontAwesome6 name="arrow-right" size={20} color="red" />
            </TouchableOpacity>
          ) : (
            <View style={{ width: 32, height: 32, marginHorizontal: 3 }} />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 12,
    marginTop: 15,
  },
  tableContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  headerRow: {
    flexDirection: "row",
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 10,
    flexWrap: "wrap",
    borderTopWidth: 1,
  },
  pageNumber: {
    width: 36,
    height: 36,
    borderRadius: 8,
    marginHorizontal: 3,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f5f9",
  },
  pageNumberActive: {
    backgroundColor: "#cbd5e1",
  },
  pageArrow: {
    borderWidth: 2,
    borderColor: "red",
    borderRadius: 8,
    padding: 6,
    marginHorizontal: 3,
  },
});
