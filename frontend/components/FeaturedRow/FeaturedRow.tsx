import React from "react";
import {
  View,
  FlatList,
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import ProductCard from "../ProductCard/ProductCard";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { InventoryItem } from "@/types/InventoryItem";
import { navigate } from "@/functions/NavigationService";
import useFe from "@/hooks/useFetchLotes";
import styles from "./styles";
import { Lot } from "@/types/Lot";

interface FeaturedRowProps {
  status: {
    title: string;
    category: string;
  };
  productos: Lot[];
}

export default function FeaturedRow({ status, productos }: FeaturedRowProps) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
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
            productos.length > 0 ? (
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
                    Ver inventario
                  </Text>
                </View>
              </TouchableOpacity>
            ) : (
              <View
                style={{
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 5 },
                  shadowOpacity: 0.3,
                  shadowRadius: 7,
                }}
                className="mr-8 rounded-3xl shadow-lg w-48 h-48 border-2 border-gray-300 justify-center items-center"
              >
                <Text
                  style={{ color: isDark ? "white" : "black" }}
                  className="text-center"
                >
                  No hay productos disponibles
                </Text>
              </View>
            )
          }
        />
      </View>
    </View>
  );
}
