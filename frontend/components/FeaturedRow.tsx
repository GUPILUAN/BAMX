import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { selectTheme } from "../slices/themeSlice";
import ProductCard from "./ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { retrieveData } from "../api/apiCalls";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@/types/Product";
import { navigate } from "@/functions/NavigationService";

interface FeaturedRowProps {
  status: {
    title: string;
    category: string;
  };
  productos: Product[];
}

export default function FeaturedRow({ status, productos }: FeaturedRowProps) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const [products, setProducts] = useState({});
  const navigation = useNavigation();

  const isWeb = Platform.OS === "web";
  const iconColor = (category: string) =>
    category === "crítico"
      ? "#FF4D4F"
      : category === "prioritario"
        ? "#FFC107"
        : "#52C41A";
  const iconName = (category: string) =>
    category === "crítico"
      ? "warning"
      : category === "prioritario"
        ? "alert-circle"
        : "checkmark-circle";

  useEffect(() => {
    const fetchProducts = async () => {
      const productsF = await retrieveData("/api/products/");
      setProducts(productsF);
    };
    fetchProducts();
  }, []);

  return (
    <View
      className={`flex-row max-w-6xl py-4 border-t border-gray-300 ${
        isWeb ? "overflow-scroll" : ""
      }`}
    >
      <View className="flex-col">
        <View className="flex-row justify-start items-center">
          <Text style={styles.titleText(status.category)}>{status.title}</Text>
          <Ionicons
            name={iconName(status.category)}
            size={Dimensions.get("window").width * 0.035}
            color={iconColor(status.category)}
          />
        </View>
        <FlatList
          data={productos.slice(0, 10)}
          nestedScrollEnabled={true}
          renderItem={({ item }) => <ProductCard item={item} />}
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 15 }}
          style={{ paddingVertical: 18 }}
          horizontal
          bounces={false}
          ListFooterComponent={
            productos.length > 10 ? (
              <TouchableOpacity
                className="items-center justify-center p-3"
                onPress={() => {
                  console.log(productos.length);
                  navigate("Inventario");
                }}
              >
                <View className="justify-center items-center items-col">
                  <View
                    className={
                      "border-2 rounded-lg my-5 " +
                      (isDark ? "border-white" : "border-black")
                    }
                  >
                    <Ionicons
                      name="arrow-forward"
                      size={70}
                      color={isDark ? "white" : "black"}
                    ></Ionicons>
                  </View>
                  <Text
                    className={
                      "text-2xl font-bold " +
                      (isDark ? "text-white" : "text-black")
                    }
                  >
                    Ver más
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null
          }
        />
      </View>
    </View>
  );
}

const styles = {
  titleText: (category: string) => ({
    color:
      category === "crítico"
        ? "#FF4D4F"
        : category === "prioritario"
          ? "#FFC107"
          : "#52C41A",
    fontFamily: "SF-Compact-Semibold",
    fontSize: Dimensions.get("window").width * 0.035,
    marginRight: 5,
  }),
};
