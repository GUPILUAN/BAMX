import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { FontAwesome6, FontAwesome5 } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Product } from "@/types/Product";
import { navigate } from "@/functions/NavigationService";

interface ProductRowProps {
  index: number;
  isSelected: boolean;
  handleSelect: (index: number) => void;
  product: Product;
}

export default function ProductRow({
  index,
  isSelected,
  handleSelect,
  product,
}: ProductRowProps) {
  const navigation = useNavigation();
  const unidad = {
    fruit: "unidades",
    canned_food: "latas",
    bottle: "botellas",
    grain: "kilogramos",
    dairy: "litros",
    snack: "paquetes",
    jar: "frasco",
  };
  const formatearFecha = (date: string) => {
    const fecha = new Date(date);
    const dia = String(fecha.getUTCDate()).padStart(2, "0");
    const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
    const año = fecha.getUTCFullYear();
    return `${dia}/${mes}/${año}`;
  };

  function evaluarFecha(fechaObjetivo: string) {
    const hoy = new Date();
    const fecha = new Date(fechaObjetivo);

    const diferenciaTiempo = fecha.getTime() - hoy.getTime();

    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diferenciaDias <= 2) {
      return "crítico";
    } else if (diferenciaDias <= 5) {
      return "prioritario";
    } else {
      return "estable";
    }
  }

  const getColor = (state: string) => {
    if (state === "crítico") {
      return "#FF4D4F";
    } else if (state === "prioritario") {
      return "#FFC107";
    } else {
      return "#52C41A";
    }
  };

  const estado = evaluarFecha(product.expiration_date);

  return (
    <View className="flex-row items-center justify-evenly max-h-16">
      <TouchableOpacity
        className="max-w-4xl"
        key={index}
        onPress={() => handleSelect(product.product_id as any as number)}
      >
        <View
          className={
            "flex-row border-gray-400 border p-3 items-center  " +
            (index % 2 === 0 ? "bg-gray-200" : "bg-white")
          }
          testID="product-row"
          style={isSelected ? styles.selectedItem : null}
        >
          <TouchableOpacity
            className="border-gray-500 border-2 rounded-lg w-9 h-9 items-center justify-center"
            onPress={() => navigate("Details", { product })}
            testID="info-button"
          >
            <FontAwesome6 name="info" size={20} color="gray" />
          </TouchableOpacity>
          <Text className="ml-4 w-1/5">{product.name}</Text>
          <Text className="ml-4 w-1/12">
            {product.quantity +
              "\n" +
              unidad[product.type as keyof typeof unidad]}
          </Text>
          <Text className="ml-4 w-1/6">
            {formatearFecha(product.entry_date)}
          </Text>
          <Text className="ml-4 w-1/6">
            CAD: {formatearFecha(product.expiration_date)}
          </Text>
          <View
            className="flex rounded-xl ml-4 px-12 py-3 items-center justify-center w-1/4 "
            style={{ backgroundColor: getColor(estado) }}
            testID="status-indicator"
          >
            <Text className="text-white font-bold">Estado {estado}</Text>
          </View>
        </View>
      </TouchableOpacity>
      <TouchableOpacity className=" w-9 h-9 items-center justify-center">
        <FontAwesome5 name="edit" size={20} color="#e1a244" />
      </TouchableOpacity>
    </View>
  );
}
const styles = StyleSheet.create({
  selectedItem: {
    backgroundColor: "lightblue",
    opacity: 0.5,
  },
});
