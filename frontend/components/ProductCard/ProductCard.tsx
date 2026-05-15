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
import { styles } from "./styles";
import { Lot } from "@/types/Lot";
import DefaultProductImage from "@/components/DefaultProductImage/DefaultProductImage";

interface ProductCardProps {
  item: Lot;
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
          <DefaultProductImage
            testID="default-product-image"
            typeId={item.type_id}
            type={item.type}
            size={192}
            style={styles.image}
          />
        )}
      </View>

      <View className="flex-1 justify-center border-t border-gray-300 rounded-b-3xl">
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
            onPress={() => navigate("Details", { item: JSON.stringify(item) })}
          >
            <Ionicons
              name="information-circle-outline"
              color="#f2a840"
              size={30}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
