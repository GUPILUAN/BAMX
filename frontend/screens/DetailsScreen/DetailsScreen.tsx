import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { InventoryItem } from "@/types/InventoryItem";
import styles from "./styles";
import { goBack } from "@/functions/NavigationService";
import { useLocalSearchParams } from "expo-router";

export default function DetailsScreen() {
  const { item } = useLocalSearchParams();
  const product: InventoryItem | null = item
    ? JSON.parse(item as string)
    : null;
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.closeButton} onPress={() => goBack()}>
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      {product?.image && product?.image.trim() !== "" ? (
        <Image
          source={{ uri: product.image }}
          style={styles.productImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.productImage}>
          <Text>No Image Available</Text>
        </View>
      )}

      <View style={styles.productDetails}>
        <Text style={styles.productName}>{product?.product_name}</Text>
        <Text style={styles.productInfo}>
          Fecha de registro: {product?.production_date || "N/A"}
        </Text>
        <Text style={styles.productInfo}>Tipo: {product?.type || "N/A"}</Text>
        <Text style={styles.productInfo}>
          Código de barras: {product?.product_id || "N/A"}
        </Text>
      </View>
    </View>
  );
}
