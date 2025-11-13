import React, { useEffect, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  Feather,
  FontAwesome6,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";

type SearchHeaderProps = {
  onDataChange: (data: any[]) => void;
  indexesLength: number;
  handleChangeQuery: (text: string) => void;
  query: string;
  handleSort: (sortBy: "linProd" | "exist" | "cveArt") => void;
  handleOrder: (direction: "asc" | "desc") => void;
  sortBy?: "linProd" | "exist" | "cveArt";
  sortDirection?: "asc" | "desc";
};

export default function SearchHeader({
  onDataChange,
  indexesLength,
  handleChangeQuery,
  query,
  sortBy,
  sortDirection,
  handleSort,
  handleOrder,
}: SearchHeaderProps) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const textColor = isDark ? "text-white" : "text-gray-800";
  const bgCard = isDark ? "bg-gray-800" : "bg-gray-100";

  const clearSelection = () => onDataChange([]);

  const renderActionButton = (
    icon: keyof typeof FontAwesome6.glyphMap,
    label: string,
    color: string,
    disabled: boolean
  ) => (
    <TouchableOpacity
      disabled={disabled}
      onPress={clearSelection}
      className={`flex-1 items-center justify-center p-5 rounded-2xl mx-2 ${disabled ? "bg-gray-300" : color} shadow`}
    >
      <FontAwesome6 name={icon} size={28} color="white" />
      <Text className={`mt-2 text-center ${textColor}`}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View
      className={`w-10/12 p-3 mt-2 rounded-2xl shadow-md ${isDark ? "bg-gray-600" : "bg-white"}`}
    >
      {/*  Search bar */}
      <View
        className={`flex-row items-center px-3 py-2 rounded-2xl ${bgCard} shadow-sm`}
      >
        <Feather name="search" size={20} color={isDark ? "#ccc" : "#555"} />
        <TextInput
          className="ml-2 flex-1 text-base text-gray-800"
          placeholder="Buscar productos..."
          placeholderTextColor={isDark ? "#aaa" : "#777"}
          onChangeText={handleChangeQuery}
          value={query}
        />
      </View>

      <View className="flex-row items-center justify-center mt-3">
        <View className="flex-col justify-evenly items-start flex-1">
          {/* Add button */}
          <TouchableOpacity className="flex-row items-center justify-center mt-3 p-3 rounded-2xl bg-blue-700 shadow w-full">
            <MaterialCommunityIcons name="plus-box" size={26} color="white" />
            <Text className="text-white font-semibold text-base ml-2">
              Añadir productos al inventario
            </Text>
          </TouchableOpacity>
          {/*  Filters */}
          <View className="flex-row justify-evenly mt-3">
            {(["exist", "linProd"] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() =>
                  handleSort(sortBy === filter ? "cveArt" : filter)
                }
                className={`flex-1 mx-1 p-2 rounded-2xl border ${
                  sortBy === filter
                    ? "bg-blue-100 border-blue-400"
                    : "bg-white border-gray-300"
                }`}
              >
                <Text className="text-center text-sm font-medium">
                  {filter === "exist" ? "Existencia" : "Línea de producto"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/*  Actions */}
        <View className="flex-row justify-around mt-4 w-1/2">
          <TouchableOpacity
            onPress={() =>
              handleOrder(sortDirection === "asc" ? "desc" : "asc")
            }
            className="items-center justify-center px-2 mx-2 border border-gray-400 rounded-2xl"
          >
            <Text
              className={`${isDark ? "text-gray-200" : "text-gray-700"} mr-2 text-sm font-bold`}
              style={{ minWidth: 120, textAlign: "center" }}
            >
              Orden {sortDirection === "asc" ? "ascendente" : "descendente"}
            </Text>

            <MaterialCommunityIcons
              name={
                sortDirection === "asc"
                  ? "sort-calendar-descending"
                  : "sort-calendar-ascending"
              }
              size={28}
              color={isDark ? "#ccc" : "#1b4671"}
            />
          </TouchableOpacity>

          {renderActionButton(
            "basket-shopping",
            "Agregar para entrega",
            "bg-green-600",
            indexesLength <= 0
          )}
          {renderActionButton(
            "trash",
            "Agregar para deshecho",
            "bg-red-600",
            indexesLength <= 0
          )}
        </View>
      </View>
    </View>
  );
}
