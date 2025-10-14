import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { InventoryItem } from "@/types/InventoryItem";
import styles from "./styles";

export default function DetailsScreen() {
  const { params } = useRoute() as {
    params: { item?: InventoryItem; product?: InventoryItem };
  };
  let product = (params.item as InventoryItem) || (params.product as InventoryItem);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>


      <Image source={{ uri: product.image ? `data:image/jpeg;base64,${product.image}` : 
      "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png" }} style={styles.productImage} />

      <View style={styles.productDetails}>
        <Text style={styles.productName}>{product.product_name}</Text>
        <Text style={styles.productInfo}>
          Fecha de registro: {product.production_date || "N/A"}
        </Text>
        <Text style={styles.productInfo}>Tipo: {product.type}</Text>
        <Text style={styles.productInfo}>
          Código de barras: {product.product_id}
        </Text>
      </View>
    </View>
  );
}
