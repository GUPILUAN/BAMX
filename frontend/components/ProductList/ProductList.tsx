import React, { useEffect, useState } from "react";
import ProductRow from "../ProductRow/ProductRow";
import { View, Text } from "react-native";

import { InventoryItem } from "@/types/InventoryItem";
import { themeColors } from "@/theme";

type ProductListProps = {
  productos: InventoryItem[];
  test: number[];
  getIndexes: (indexes: number[]) => void;
  isDark?: boolean;
};

export default function ProductList({
  productos,
  test,
  getIndexes,
  isDark = false,
}: ProductListProps) {
  const [selectedIndexes, setSelectedIndexes] = useState<number[]>([]);

  const handleSelect = (index: number) => {
    if (selectedIndexes.includes(index)) {
      setSelectedIndexes(selectedIndexes.filter((i) => i !== index));
    } else {
      setSelectedIndexes([...selectedIndexes, index]);
    }
  };

  useEffect(() => {
    setSelectedIndexes(test);
  }, [test]);

  useEffect(() => {
    getIndexes(selectedIndexes);
  }, [selectedIndexes]);

  return (
    <View className="w-5/6 mt-2">
      {productos.length > 0 ? (
        productos.map((producto, index) => (
          <ProductRow
            handleSelect={handleSelect}
            isSelected={selectedIndexes?.includes(
              producto.product_id as any as number
            )}
            key={index}
            index={index}
            product={producto}
          />
        ))
      ) : (
        <View
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 5 },
            shadowOpacity: 0.3,
            shadowRadius: 7,
            borderColor: "#ccc",
            borderWidth: 1,
            borderRadius: 12,
            height: 100,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: themeColors.text(isDark) }}>
            No hay productos disponibles
          </Text>
        </View>
      )}
    </View>
  );
}
