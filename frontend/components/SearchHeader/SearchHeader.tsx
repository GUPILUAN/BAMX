import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";

type SearchHeaderProps = {
  handleChangeQuery: (text: string) => void;
  query: string;
  handleSort: (sortBy: "linProd" | "exist" | "cveArt") => void;
  handleOrder: (direction: "asc" | "desc") => void;
  sortBy?: "linProd" | "exist" | "cveArt";
  sortDirection?: "asc" | "desc";
  onlyWithStock?: boolean;
  setOnlyWithStock?: (value: boolean) => void;
};

export default function SearchHeader({
  handleChangeQuery,
  query,
  sortBy,
  sortDirection,
  handleSort,
  handleOrder,
  onlyWithStock = true,
  setOnlyWithStock,
}: SearchHeaderProps) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const cardBg = isDark ? "bg-gray-800" : "bg-white";
  const inputBg = isDark ? "bg-gray-700" : "bg-gray-100";
  const inputText = isDark ? "text-white" : "text-gray-800";
  const pillBaseBg = isDark ? "bg-gray-700" : "bg-gray-100";
  const pillActiveBg = isDark ? "bg-blue-700" : "bg-blue-100";
  const pillActiveBorder = isDark ? "border-blue-400" : "border-blue-400";
  const pillIdleBorder = isDark ? "border-gray-600" : "border-gray-300";
  const pillActiveText = isDark ? "text-white" : "text-blue-700";
  const pillIdleText = isDark ? "text-gray-200" : "text-gray-700";
  const orderText = isDark ? "text-gray-200" : "text-gray-700";
  const orderBorder = isDark ? "border-gray-600" : "border-gray-300";

  return (
    <View
      className={`w-10/12 p-4 mt-2 rounded-2xl shadow-md ${cardBg}`}
    >
      {/* Search bar */}
      <View
        className={`flex-row items-center px-3 py-2 rounded-2xl ${inputBg}`}
      >
        <Feather name="search" size={20} color={isDark ? "#ccc" : "#555"} />
        <TextInput
          className={`ml-2 flex-1 text-base ${inputText}`}
          placeholder="Buscar productos..."
          placeholderTextColor={isDark ? "#aaa" : "#777"}
          onChangeText={handleChangeQuery}
          value={query}
        />
      </View>

      {/* Toggle: solo productos con existencia */}
      {setOnlyWithStock && (
        <TouchableOpacity
          onPress={() => setOnlyWithStock(!onlyWithStock)}
          className="flex-row items-center mt-3"
        >
          <View
            className={`w-5 h-5 rounded mr-2 items-center justify-center border ${
              onlyWithStock
                ? "bg-blue-600 border-blue-600"
                : isDark
                  ? "bg-gray-700 border-gray-500"
                  : "bg-white border-gray-400"
            }`}
          >
            {onlyWithStock && (
              <Feather name="check" size={14} color="white" />
            )}
          </View>
          <Text className={`text-sm ${inputText}`}>
            Solo productos con existencia
          </Text>
        </TouchableOpacity>
      )}

      {/* Sort + direction */}
      <View className="flex-row items-center justify-between mt-3">
        <View className="flex-row flex-1 mr-2">
          {(["exist", "linProd"] as const).map((filter) => {
            const active = sortBy === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => handleSort(active ? "cveArt" : filter)}
                className={`flex-1 mx-1 px-3 py-2 rounded-2xl border ${
                  active
                    ? `${pillActiveBg} ${pillActiveBorder}`
                    : `${pillBaseBg} ${pillIdleBorder}`
                }`}
              >
                <Text
                  className={`text-center text-sm font-medium ${
                    active ? pillActiveText : pillIdleText
                  }`}
                >
                  {filter === "exist" ? "Existencia" : "Línea de producto"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() =>
            handleOrder(sortDirection === "asc" ? "desc" : "asc")
          }
          className={`flex-row items-center px-3 py-2 rounded-2xl border ${orderBorder}`}
        >
          <Text className={`mr-2 text-sm font-semibold ${orderText}`}>
            {sortDirection === "asc" ? "Ascendente" : "Descendente"}
          </Text>
          <MaterialCommunityIcons
            name={
              sortDirection === "asc"
                ? "sort-calendar-ascending"
                : "sort-calendar-descending"
            }
            size={20}
            color={isDark ? "#ccc" : "#1b4671"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}
