import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSelector } from "react-redux";
import { goBack } from "@/functions/NavigationService";
import { selectTheme } from "@/slices/themeSlice";
import { Lot } from "@/types/Lot";
import DefaultProductImage from "@/components/DefaultProductImage/DefaultProductImage";
import { isUsableImage } from "@/functions/isUsableImage";

const { height, width } = Dimensions.get("window");

export default function DetailsScreen() {
  const { item } = useLocalSearchParams();
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const product: Lot | null = item ? JSON.parse(item as string) : null;
  const [imageFailed, setImageFailed] = useState<boolean>(false);
  const showRealImage = isUsableImage(product?.image) && !imageFailed;

  return (
    <View className={`flex-1 ${isDark ? "bg-black" : "bg-white"}`}>
      {/* Imagen superior */}
      {showRealImage ? (
        <Image
          source={{ uri: product?.image as string }}
          className="absolute top-0 left-0 w-full h-full"
          resizeMode="cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <DefaultProductImage
          typeId={product?.type_id}
          type={product?.type}
          size={width}
          style={{ position: "absolute", top: 0, left: 0, height: "100%" }}
        />
      )}

      {/* Overlay degradado para legibilidad */}
      <View className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-black/10 via-black/30 to-black/80" />

      {/* Contenedor inferior tipo “bottom sheet” */}
      <View
        className={`absolute bottom-0 left-0 right-0 rounded-t-3xl px-6 pt-6 pb-10 ${
          isDark ? "bg-zinc-900/95" : "bg-white/95"
        } shadow-2xl`}
        style={{
          minHeight: height * 0.42, // cubre casi la mitad de la pantalla
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 60 }}
        >
          {/* Nombre */}
          <Text
            className={`text-2xl font-semibold mb-3 ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            {product?.product_name || "Producto desconocido"}
          </Text>

          {/* Etiquetas */}
          <View className="flex-row items-center space-x-2 mb-6">
            <View
              className={`px-3 py-1 rounded-full ${
                isDark ? "bg-indigo-900/30" : "bg-indigo-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  isDark ? "text-indigo-400" : "text-indigo-700"
                }`}
              >
                {product?.type || "Sin tipo"}
              </Text>
            </View>
            <Text
              className={`text-xs ${
                isDark ? "text-gray-400" : "text-gray-800"
              }`}
            >
              Clave: {product?.product_id || "N/A"}
            </Text>
          </View>

          {/* Detalles */}
          <View className="space-y-3 border-t border-gray-200 dark:border-zinc-800 pt-4">
            <View className="flex-row justify-between">
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm`}
              >
                Fecha de registro
              </Text>
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm font-medium`}
              >
                {product?.production_date || "N/A"}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm`}
              >
                Tipo de elemento
              </Text>
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm font-medium`}
              >
                {product?.type || "N/A"}
              </Text>
            </View>

            <View className="flex-row justify-between">
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm`}
              >
                Clave interna
              </Text>
              <Text
                className={`${isDark ? "text-gray-400" : "text-gray-800"} text-sm font-medium`}
              >
                {product?.product_id || "N/A"}
              </Text>
            </View>
          </View>

          {/* Botón inferior */}
          <TouchableOpacity
            onPress={() => goBack()}
            className={`mt-10 py-3 rounded-2xl ${
              isDark ? "bg-indigo-600" : "bg-indigo-500"
            }`}
          >
            <Text className="text-center text-white font-semibold text-base">
              Cerrar
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </View>
  );
}
