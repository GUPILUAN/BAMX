import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Product } from "@/types/Product";

export default function DetailsScreen() {
  const { params } = useRoute() as {
    params: { item?: Product; product?: Product };
  };
  let product = (params.item as Product) || (params.product as Product);
  const navigation = useNavigation();
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.closeButtonText}>X</Text>
      </TouchableOpacity>

      <Image source={{ uri: product.image }} style={styles.productImage} />

      <View style={styles.productDetails}>
        <Text style={styles.productName}>{product.name}</Text>
        <Text style={styles.productInfo}>
          Fecha de registro: {product.registration_date}
        </Text>
        <Text style={styles.productInfo}>Tipo: {product.type}</Text>
        <Text style={styles.productInfo}>
          Código de barras: {product.product_id}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    padding: 10,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#FF6347",
    fontWeight: "bold",
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 10,
    marginBottom: 20,
  },
  productDetails: {
    alignItems: "center",
  },
  productName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 10,
  },
  productInfo: {
    fontSize: 16,
    color: "#DDD",
    marginBottom: 5,
  },
});
