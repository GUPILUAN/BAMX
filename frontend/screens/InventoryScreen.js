import React, { useEffect, useState } from "react";
import {
  View,
  SafeAreaView,
  Platform,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Keyboard,
  Text,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { selectTheme } from "../slices/themeSlice";
import { useSelector } from "react-redux";
import SearchHeader from "../components/SearchHeader";
import ProductList from "../components/ProductList";
import { TouchableOpacity } from "react-native";
import { productosDummy } from "../constants/Products";

export default function InventoryScreen() {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isWeb = Platform.OS === "web";
  const themeColorsTailwind = {
    backgroundTailwind: isDark ? "bg-gray-900" : "bg-gray-50",
    textTailwind: isDark ? "text-gray-300" : "text-gray-900",
  };

  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState(
    productosDummy.results
  );

  const handleSearch = (text) => {
    console.log(text);
    const searchValue = text.toLowerCase();
    setQuery(searchValue);
    const filtered = productosDummy.results.filter((item) => {
      const searchValueLower = searchValue.toLowerCase();
      return (
        item.name.toLowerCase().includes(searchValueLower) ||
        item.type.toLowerCase().includes(searchValueLower) ||
        item.product_id.toLowerCase().includes(searchValueLower)
      );
    });

    setFilteredResults(filtered);
  };

  const itemsPorPagina = 8;

  function obtenerProductosPorPagina(paginaActual) {
    const inicio = (paginaActual - 1) * itemsPorPagina;
    const fin = inicio + itemsPorPagina;
    return filteredResults.slice(inicio, fin);
  }

  function showProducts(page) {
    if (page > obtenerTotalPaginas()) {
      return obtenerProductosPorPagina(1);
    }
    const productosPagina = obtenerProductosPorPagina(page);
    return productosPagina;
  }

  function obtenerTotalPaginas() {
    return Math.ceil(filteredResults.length / itemsPorPagina);
  }

  const [numbers, setNumbers] = useState([]);

  useEffect(() => {
    const paquetes = obtenerTotalPaginas();

    const newNumbers = [];
    if (paquetes > 0) {
      for (let i = 0; i < paquetes; i++) {
        newNumbers.push(i + 1);
      }
    }
    setNumbers(newNumbers);
  }, [filteredResults]);

  const [inicio, setInicio] = useState(0);
  const [limite, setLimite] = useState(5);
  const [data, setData] = useState(
    numbers.length >= 5 ? numbers.slice(inicio, limite) : numbers
  );

  const loadMore = () => {
    if (numbers.length >= limite) {
      setInicio((prev) => prev + 5);
      setLimite((prev) => prev + 5);
    }
  };

  const loadLess = () => {
    setInicio((prev) => prev - 5);
    setLimite((prev) => prev - 5);
  };

  useEffect(() => {
    if (inicio < 0) {
      setInicio(0);
      setLimite(5);
    } else if (inicio >= numbers.length) {
      setData(numbers.slice(limite));
    } else {
      setData(numbers.slice(inicio, limite));
    }
  }, [numbers, inicio, limite]);

  const [tt, setTT] = useState([]);
  const handleButtons = (newData) => {
    setTT(newData);
  };

  const [indexes, setIndexes] = useState([]);

  const handleAction = (newData) => {
    setIndexes(newData);
  };

  const handleOrder = (order, filter) => {
    const sortedData = [...filteredResults].sort((a, b) => {
      return order
        ? new Date(a[filter]) - new Date(b[filter])
        : new Date(b[filter]) - new Date(a[filter]);
    });
    setFilteredResults(sortedData);
  };

  const [selectedNumber, setSelectedNumber] = useState(1);
  const handleSelect = (newData) => {
    setSelectedNumber(newData);
  };
  useEffect(() => {
    setProducts(showProducts(selectedNumber));
  }, [selectedNumber, filteredResults]);

  return (
    <SafeAreaView
      className={`${themeColorsTailwind.backgroundTailwind} w-full h-full b flex-1 `}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback
          onPress={() => Platform.OS !== "web" && Keyboard.dismiss()}
        >
          <View
            className={`${
              themeColorsTailwind.backgroundTailwind
            } w-full h-full  b flex-1 ${isWeb ? "overflow-scroll" : ""}`}
          >
            <View className="flex-col">
              <View className="items-center">
                <SearchHeader
                  onDataChange={handleButtons}
                  indexesLength={indexes.length}
                  handleSearch={handleSearch}
                  query={query}
                  handleOrder={handleOrder}
                />

                <ProductList
                  productos={products}
                  test={tt}
                  getIndexes={handleAction}
                />

                {data.length > 0 && (
                  <View className="mt-5 flex-row items-center ">
                    {inicio > 0 && (
                      <TouchableOpacity
                        className="rounded-md border-2 border-red-500 p-2"
                        onPress={loadLess}
                      >
                        <FontAwesome6 name="arrow-left" size={20} color="red" />
                      </TouchableOpacity>
                    )}

                    {data.map((val, index) => {
                      return (
                        <TouchableOpacity
                          key={index}
                          className={
                            "rounded-xl p-2 items-center justify-center w-10 h-10 mx-2 " +
                            (selectedNumber === val
                              ? "bg-slate-300"
                              : "bg-slate-100")
                          }
                          onPress={() => handleSelect(val)}
                        >
                          <Text className="text-xl text-gray-500">{val}</Text>
                        </TouchableOpacity>
                      );
                    })}

                    {limite < numbers.length && (
                      <>
                        <Text className="mx-2 text-xl text-gray-500">...</Text>
                        <TouchableOpacity
                          className="rounded-lg border-2 border-red-500 p-2"
                          onPress={loadMore}
                        >
                          <FontAwesome6
                            name="arrow-right"
                            size={20}
                            color="red"
                          />
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
