import React, { useEffect, useState } from "react";
import { View, SafeAreaView, Platform } from "react-native";
import { selectTheme } from "../slices/themeSlice";
import { useSelector } from "react-redux";
import Semaforo from "../components/Semaforo";
import AnimatedSwitch from "../components/AnimatedSwitch";
import Refrigeradores from "../components/Refrigeradores";
import { retrieveData } from "@/api/apiCalls";
import { InventoryItem } from "@/types/InventoryItem";
export default function HomeScreen() {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isWeb = Platform.OS === "web";
  const themeColorsTailwind = {
    backgroundTailwind: isDark ? "bg-gray-900" : "bg-gray-50",
    textTailwind: isDark ? "text-gray-300" : "text-gray-900",
  };
  const [panel, setPanel] = useState("Semaforo");

  const handlePanelChange = (newPanel: string) => {
    setPanel(newPanel);
  };
  const [products, setProducts] = useState<InventoryItem[]>([]);
  useEffect(() => {
    const fetchProducts = async () => {
      const productsF = await retrieveData("/api/inventario/");
      setProducts(productsF);
    };
      fetchProducts();
    }, []);

 
  return (
    <SafeAreaView
      className={`${themeColorsTailwind.backgroundTailwind} w-full h-full flex-1 `}
    >
      <View
        className={`${
          themeColorsTailwind.backgroundTailwind
        }   ${isWeb ? "overflow-scroll w-full h-full" : ""}`}
      >
        <AnimatedSwitch onValueChange={handlePanelChange} />
        <View className="flex flex-row p-5">
          {panel === "Semaforo" ? <Semaforo productos={products} /> : <Refrigeradores />}
        </View>
      </View>
    </SafeAreaView>
  );
}
