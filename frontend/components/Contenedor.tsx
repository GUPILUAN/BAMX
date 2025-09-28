import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StackedBarChart } from "./StackedBarChart";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import { Container } from "@/types/Container";
import { themeColors } from "@/theme";

interface ContenedorProps {
  contenedor: Container;
}

export default function Contenedor({ contenedor }: ContenedorProps) {
  const [isActive, setIsActive] = useState(contenedor.is_active);
  const screenWidth = Dimensions.get("window").width;
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const toggleActiveStatus = () => {
    setIsActive((prev) => !prev);
    contenedor.is_active = !contenedor.is_active;
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
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text
          style={{ color: themeColors.headerText(isDark), ...styles.title }}
        >
          {contenedor.name}
        </Text>
        <View style={styles.iconRow}>
          <FontAwesome6
            name={getIconName()}
            size={isActive ? 60 : 50}
            color={getIconColor()}
          />
          <View style={styles.headerText}>
            <Text style={getTemperatureStyle(contenedor.temperature, isActive)}>
              {contenedor.temperature.toFixed(1)}°C
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.chartContainer}>
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
            Última temperatura: {contenedor.last_opened}
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

const getTemperatureStyle = (temperature: number, isActive: boolean) => ({
  fontSize: 36,
  color:
    !isActive || temperature > 5
      ? "red"
      : temperature < -10
        ? "#003366"
        : "#4193f7",
});

const getStatusStyle = (isActive: boolean) => ({
  color: isActive ? "green" : "red",
  fontWeight: "bold" as "bold",
});

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    maxWidth: "100%",
    height: 300,
    justifyContent: "space-evenly",
  },
  infoContainer: {
    flexDirection: "column",
    marginHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  headerText: {
    marginLeft: 10,
  },

  chartContainer: {
    flexDirection: "column",
    height: "auto",
    width: "60%",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusButton: {
    borderRadius: 50,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: "#d8d8d8",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  lastUpdate: {
    fontSize: 12,
    color: "#888",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
