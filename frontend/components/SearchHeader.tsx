import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
} from "react-native";
import React, { useEffect, useState } from "react";
import {
  FontAwesome6,
  MaterialCommunityIcons,
  Feather,
} from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTheme } from "../slices/themeSlice";

type SearchHeaderProps = {
  onDataChange: (data: any[]) => void;
  indexesLength: number;
  handleSearch: (text: string) => void;
  query: string;
  handleOrder: (orderType: boolean, orderBy: string) => void;
};

export default function SearchHeader({
  onDataChange,
  indexesLength,
  handleSearch,
  query,
  handleOrder,
}: SearchHeaderProps) {
  const [selecting, setSelecting] = useState<boolean>(false);
  const [filterSelected, setFilterSelected] = useState<string>("ingreso");
  const [search, setSearch] = useState<string>("");
  const [orderType, setOrderType] = useState<boolean>(false);
  const navigation = useNavigation();
  const theme = useSelector(selectTheme);
  const isDarkMode = theme === "dark";
  const textColor = isDarkMode ? "text-gray-800" : "text-white";
  const order = orderType ? "ascendente" : "descendente";

  useEffect(() => {
    handleOrder(
      orderType,
      filterSelected === "ingreso" ? "entry_date" : "expiration_date"
    );
  }, [orderType, filterSelected]);

  const handleFilterSelection = (filter: string) => {
    setFilterSelected(filter);
  };
  const handleFilterOrder = (order: boolean) => {
    setOrderType(order);
  };

  const handleClick = () => {
    onDataChange([]);
  };

  return (
    <View
      className="flex-row mt-2 justify-between mb-4 "
      style={styles.container}
    >
      <View className="flex-col w-1/2 mr-16">
        {/*SearchBar*/}
        <View className="flex-row items-center mb-2">
          <View
            className={"flex-row items-center p-3 rounded-lg  bg-gray-300 "}
          >
            <Feather
              name="search"
              size={20}
              color={isDarkMode ? "white" : "gray"}
            />
            <TextInput
              placeholder="Buscar productos..."
              placeholderTextColor="gray"
              className={"ml-2 flex-1"}
              onChangeText={(text) => handleSearch(text)}
              value={query}
            />
          </View>
        </View>
        {/*Buttons*/}
        <TouchableOpacity className="w-11/12 self-center p-1 rounded-xl  bg-blue-800 mb-2">
          <View className="flex-row items-center ">
            <MaterialCommunityIcons name="plus-box" size={25} color="white" />
            <Text className={"text-white text-center font-bold text-lg pl-4"}>
              Añadir productos al inventario
            </Text>
          </View>
        </TouchableOpacity>

        <View className="flex-row  justify-evenly w-11/12 self-center">
          <TouchableOpacity
            className={
              "rounded-l-xl w-1/2 p-1 border-gray-400 border " +
              (filterSelected === "ingreso" ? "bg-gray-300" : "bg-white")
            }
            onPress={() => handleFilterSelection("ingreso")}
          >
            <Text
              className={
                "text-center rounded-r-xl w-1/2 p-1 border-gray-400 border " +
                (filterSelected !== "caducidad" ? "bg-gray-300" : "bg-white")
              }
            >
              Ordenar por fecha de ingreso
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleFilterSelection("caducidad")}>
            <Text
              className={
                "text-center rounded-r-xl w-1/2 p-1 border-gray-400 border " +
                (filterSelected !== "ingreso" ? "bg-gray-300" : "bg-white")
              }
            >
              Ordenar por fecha de caducidad
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <View className="flex-col h-3/5">
        <View className="flex-row">
          <TouchableOpacity
            className="flex-col bg-gray-400 justify-center rounded-3xl mx-2"
            onPress={handleClick}
            style={indexesLength > 0 ? buttonStyle(true) : null}
            disabled={indexesLength <= 0}
          >
            <View className="items-center p-5">
              <FontAwesome6
                name="basket-shopping"
                size={30}
                color={isDarkMode ? "white" : "white"}
              />
              <Text className={"mt-1 text-center " + textColor}>
                Agregar para {"\n"}entrega
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-col bg-gray-400 justify-center rounded-3xl mx-2"
            onPress={handleClick}
            style={indexesLength > 0 ? buttonStyle(false) : null}
            disabled={indexesLength <= 0}
          >
            <View className="items-center p-5">
              <FontAwesome6
                name="trash"
                size={30}
                color={isDarkMode ? "white" : "white"}
              />
              <Text className={"mt-1 text-center " + textColor}>
                Agregar para {"\n"}deshecho
              </Text>
            </View>
          </TouchableOpacity>
        </View>
        <View className="flex-row items-center justify-evenly mt-1">
          <Text className="text-center text-base font-light">
            Orden {order}
          </Text>
          <TouchableOpacity onPress={() => handleFilterOrder(!orderType)}>
            <MaterialCommunityIcons
              name={
                orderType
                  ? "sort-calendar-descending"
                  : "sort-calendar-ascending"
              }
              size={30}
              color={"#1b4671"}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f7f7f7",
    padding: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

const buttonStyle = (good: boolean) => ({
  backgroundColor: good ? "#78af6d" : "#d65f61",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 5,
  elevation: 5,
});
