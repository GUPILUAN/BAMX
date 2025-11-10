import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import { navigate } from "@/functions/NavigationService";
import { InventoryItem } from "@/types/InventoryItem";
import { styles, buttonStyle, cartText } from "./styles";

interface ProductCardProps {
  item: InventoryItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const theme = useSelector(selectTheme);
  const isDarkMode = theme === "dark";

  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";

  const [loading, setLoading] = useState<boolean>(true);

  return (
    <View
      style={styles.cardContainer}
      className={"mr-8 rounded-3xl shadow-lg w-48 h-48 " + bgColor}
    >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        {item.image && item.image.trim() !== "" ? (
          <>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="cover"
              onLoad={() => setLoading(false)}
            />
            {loading && (
              <View testID="loading-indicator" style={styles.loadingOverlay}>
                <ActivityIndicator size="large" />
              </View>
            )}
          </>
        ) : (
          <Text>{item.product_name} No Image</Text>
        )}
      </View>

      <View className="flex-1 justify-center border-t border-gray-300">
        <View className="flex-row justify-evenly items-center rounded-b-3xl">
          <Text
            className={`w-1/2 font-semibold ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {item.product_name}
          </Text>
          <TouchableOpacity
            testID="info-button"
            onPress={() => navigate("Details", { item })}
          >
            <Ionicons
              name="information-circle-outline"
              color="#f2a840"
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row w-full items-center justify-center">
        <TouchableOpacity
          onPress={() => {}}
          className="rounded-bl-3xl w-1/2 h-8 justify-center shadow-sm"
          style={buttonStyle(true)}
        >
          <Text style={cartText()}>Entregar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {}}
          className="rounded-br-3xl w-1/2 h-8 justify-center shadow-sm"
          style={buttonStyle(false)}
        >
          <Text style={cartText()}>Desechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
