import React, { useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { StackedBarChart } from "../StackedBarChart/StackedBarChart";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import { themeColors } from "@/theme";
import styles from "./styles";
import getTemperatureStyle from "./utils/getTemperatureStyle";
import getStatusStyle from "./utils/getStatusStyle";
import { Warehouse } from "@/types/Warehouse";

interface ContenedorProps {
  contenedor: Warehouse;
}

export default function Contenedor({ contenedor }: ContenedorProps) {
  const [isActive, setIsActive] = useState(contenedor.active);
  const screenWidth = Dimensions.get("window").width;
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const toggleActiveStatus = () => {
    setIsActive((prev) => !prev);
    contenedor.active = !contenedor.active;
  };

  const getIconName = () => {
    if (!isActive || contenedor.temperature > 5) return "temperature-arrow-up";
    return contenedor.temperature < -10 ? "snowflake" : "temperature-low";
  };

  const getIconColor = () => {
    if (!isActive || contenedor.temperature > 5) return "red";
    return contenedor.temperature < -10 ? "#003366" : "#4193f7";
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: themeColors.background(isDark) },
      ]}
    >
      <View style={styles.infoContainer}>
        <Text
          style={{ color: themeColors.headerText(isDark), ...styles.title }}
        >
          {contenedor.name}
        </Text>
        {contenedor.refrigerated && (
          <View style={styles.iconRow}>
            <FontAwesome6
              name={getIconName()}
              size={isActive ? 60 : 50}
              color={getIconColor()}
            />
            <View style={styles.headerText}>
              <Text
                style={getTemperatureStyle(contenedor.temperature, isActive)}
              >
                {contenedor.temperature.toFixed(1)}°C
              </Text>
            </View>
          </View>
        )}
      </View>

      <View
        style={[
          styles.chartContainer,
          { backgroundColor: themeColors.headerBackground(isDark) },
        ]}
      >
        <View style={styles.statusRow}>
          <TouchableOpacity
            onPress={toggleActiveStatus}
            style={styles.statusButton}
          >
            <Text style={getStatusStyle(isActive)}>
              {isActive ? "Activo" : "Off"}
            </Text>
          </TouchableOpacity>
          <Text style={styles.lastUpdate}>
            Última temperatura: {contenedor.last_update}
          </Text>
        </View>

        <StackedBarChart
          data={{
            labels: contenedor.labels,
            legend: ["Estado Crítico", "Estado Prioritario", "Estado Estable"],
            data: contenedor.data,
            barColors: ["#ff3e3e", "#f3ca20", "#32cd32"],
          }}
          width={screenWidth - 300}
          height={220}
          fromZero={true}
          style={styles.chart}
          isDark={isDark}
        />
      </View>
    </View>
  );
}
