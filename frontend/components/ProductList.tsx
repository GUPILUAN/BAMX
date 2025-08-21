import React, { useEffect, useState } from "react";
import ProductRow from "./ProductRow";
import { Text, View } from "react-native";

import { Product } from "@/types/Product";

type ProductListProps = {
  productos: Product[];
  test: number[];
  getIndexes: (indexes: number[]) => void;
};

export default function ProductList({
  productos,
  test,
  getIndexes,
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
      {productos.map((producto, index) => (
        <ProductRow
          handleSelect={handleSelect}
          isSelected={selectedIndexes?.includes(
            producto.product_id as any as number
          )}
          key={index}
          index={index}
          product={producto}
        />
      ))}
    </View>
  );
}
