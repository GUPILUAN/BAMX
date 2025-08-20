import React, { useState } from "react";
import { View, SafeAreaView, Platform } from "react-native";
import { selectTheme } from "../slices/themeSlice";
import { useSelector } from "react-redux";
import Semaforo from "../components/Semaforo";
import AnimatedSwitch from "../components/AnimatedSwitch";
import Refrigeradores from "../components/Refrigeradores";
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

  return (
    <SafeAreaView
      className={`${themeColorsTailwind.backgroundTailwind} w-full h-full b flex-1 `}
    >
      <View
        className={`${
          themeColorsTailwind.backgroundTailwind
        } w-full h-full b flex-1 ${isWeb ? "overflow-scroll" : ""}`}
      >
        <View className="flex-col ">
          <AnimatedSwitch onValueChange={handlePanelChange} />
          <View className="flex-row p-5">
            {panel === "Semaforo" ? <Semaforo /> : <Refrigeradores />}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
