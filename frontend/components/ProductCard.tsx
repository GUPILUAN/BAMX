import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTheme } from "../slices/themeSlice";
import { navigate } from "@/functions/NavigationService";

interface ProductItem {
  image?: string;
  name: string;
}

interface ProductCardProps {
  item: ProductItem;
}

export default function ProductCard({ item }: ProductCardProps) {
  const navigation = useNavigation();
  const theme = useSelector(selectTheme);
  const isDarkMode = theme === "dark";

  const bgColor = isDarkMode ? "bg-gray-800" : "bg-white";

  const [imageUri, setImageUri] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const imageUrl =
      item && item.image
        ? item.image
        : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";
    setImageUri(imageUrl);
    setLoading(true);
  }, [item.image]);

  if (imageUri === "") {
    return null;
  }

  return (
    <View
      style={styles.cardContainer}
      className={"mr-8 rounded-3xl shadow-lg w-48 h-48 " + bgColor}
    >
      <View style={{ flex: 1 }}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="cover"
          onLoad={() => setLoading(false)}
        />
        {loading && (
          <View testID="loading-indicator" style={styles.loadingOverlay}>
            <ActivityIndicator size="large" />
          </View>
        )}
      </View>

      <View className="flex-1 justify-center border-t border-gray-300">
        <View className="flex-row justify-evenly items-center rounded-b-3xl">
          <Text
            className={`w-1/2 font-semibold ${
              isDarkMode ? "text-white" : "text-black"
            }`}
          >
            {item.name}
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
          <Text style={cartText(true)}>Entregar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {}}
          className="rounded-br-3xl w-1/2 h-8 justify-center shadow-sm"
          style={buttonStyle(false)}
        >
          <Text style={cartText(false)}>Desechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 7,
  },
  image: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  loadingOverlay: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    bottom: "50%",
    justifyContent: "center",
    alignItems: "center",
  },
});

const buttonStyle = (good: boolean) => ({
  backgroundColor: good ? "#78af6d" : "#d65f61",
  shadowColor: "#000",
  elevation: 10,
});

const cartText = (good: boolean) => ({
  color: "#fbfbfb",
  fontFamily: "SF-Pro-Semibold",
  fontSize: Dimensions.get("window").width * 0.013,
  textAlign: "center" as "center",
});
