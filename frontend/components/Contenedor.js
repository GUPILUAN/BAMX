import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { StackedBarChart } from "react-native-chart-kit";
import { FontAwesome6 } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "../slices/themeSlice";

export default function Contenedor({ contenedor }) {
  const [isActive, setIsActive] = useState(false);
  const screenWidth = Dimensions.get("window").width;
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const chartConfig = {
    backgroundGradientFrom: isDark ? "#1a1a1a" : "#fff",
    backgroundGradientFromOpacity: 1,
    backgroundGradientTo: isDark ? "#08130D" : "#d4d4d4",
    backgroundGradientToOpacity: 0.5,
    color: (opacity = 1) =>
      isDark ? `rgba(255,255,255,${opacity})` : `rgba(0,0,0,${opacity})`,
    barPercentage: 1.5,
  };

  const toggleActiveStatus = () => {
    setIsActive((prev) => !prev);
    contenedor.is_active = !contenedor.is_active;
  };

  const getIconName = () => {
    if (!contenedor.is_active) return "temperature-arrow-up";
    return contenedor.temperature < -10 ? "snowflake" : "temperature-low";
  };

  const getIconColor = () => {
    if (!contenedor.is_active) return "red";
    return contenedor.temperature < -10 ? "#003366" : "#4193f7";
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{contenedor.name}</Text>
        <View style={styles.iconRow}>
          <FontAwesome6
            name={getIconName()}
            size={contenedor.is_active ? 60 : 50}
            color={getIconColor()}
          />
          <View style={styles.headerText}>
            <Text
              style={styles.temperature(
                contenedor.temperature,
                contenedor.is_active
              )}
            >
              {contenedor.temperature}°C
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
            <Text style={styles.status(contenedor.is_active)}>
              {contenedor.is_active ? "Activo" : "Off"}
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
          chartConfig={chartConfig}
          style={styles.chart}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    padding: 16,
    maxWidth: 6000,
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
  temperature: (temperature, isActive) => ({
    fontSize: 36,
    color: !isActive ? "red" : temperature < -10 ? "#003366" : "#4193f7",
  }),
  chartContainer: {
    flexDirection: "column",
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
  status: (active) => ({
    color: active ? "green" : "red",
    fontWeight: "bold",
  }),
  lastUpdate: {
    fontSize: 12,
    color: "#888",
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
});
