import { themeColors } from "@/theme";
import { useFont } from "@shopify/react-native-skia";
import React from "react";
import { View, StyleSheet } from "react-native";
import { CartesianChart, StackedBar } from "victory-native";

type Props = {
  data: {
    labels: string[];
    data: number[][];
    barColors: string[];
    legend: string[];
  };
  width: number;
  height: number;
  fromZero?: boolean;
  style?: object;
  isDark?: boolean;
};

export const StackedBarChart: React.FC<Props> = ({
  data,
  width,
  height,
  fromZero = true,
  style,
  isDark = false,
}) => {
  // Mapear los datos a objetos { x, y1, y2, y3 } para el StackedBar
  const mappedData = data.data.map((values, index) => {
    return {
      x: data.labels[index],
      y1: values[0],
      y2: values[1],
      y3: values[2],
    };
  });

  const maxY = Math.max(
    ...data.data.map((arr) => arr.reduce((a, b) => a + b, 0))
  );

  const fontSize = 12;
  const font = useFont(
    require("@/assets/fonts/SF-Pro-Rounded-Bold.otf"),
    fontSize
  );

  return (
    <CartesianChart
      data={mappedData}
      xKey="x"
      yKeys={["y1", "y2", "y3"]}
      domain={{ y: fromZero ? [0, maxY] : undefined }}
      domainPadding={{ left: 50, right: 50, top: 10 }}
      axisOptions={{
        font,
        lineColor: isDark ? "#71717a" : "#d4d4d8",
        labelColor: themeColors.headerText(isDark),
      }}
      padding={5}
    >
      {({ points, chartBounds }) => (
        <StackedBar
          animate={{ type: "spring" }}
          points={[points.y1, points.y2, points.y3]}
          chartBounds={chartBounds}
          innerPadding={0.6}
          colors={data.barColors}
          barOptions={({ isBottom, isTop }) => {
            const roundedCorner = 5;
            return {
              roundedCorners: isTop
                ? {
                    topLeft: roundedCorner,
                    topRight: roundedCorner,
                  }
                : isBottom
                  ? {
                      bottomRight: 0,
                      bottomLeft: 0,
                    }
                  : undefined,
            };
          }}
        />
      )}
    </CartesianChart>
  );
};
