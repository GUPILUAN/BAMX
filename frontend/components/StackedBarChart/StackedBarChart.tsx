import { themeColors } from "@/theme";
import { useFont } from "@shopify/react-native-skia";
import React from "react";
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
  const ys = (values: number[]) =>
    values.reduce(
      (acc, val, index) => ({ ...acc, [`y${index + 1}`]: val }),
      {} as { [key: string]: number }
    );

  const mappedData = data.data.map((values, index): any => {
    const x = data.labels[index];
    return {
      x,
      ...ys(values),
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
  const yKeys = Object.keys(mappedData[0]).filter((key) => key.startsWith("y"));
  if (!font) return null;
  const xPadding = 0.6;

  return (
    <CartesianChart
      viewport={{
        y: [0, maxY * 1.15],
        x: [-xPadding, data.labels.length],
      }}
      domainPadding={xPadding}
      data={mappedData}
      xKey="x"
      yKeys={yKeys}
      domain={{ y: fromZero ? [0, maxY] : undefined }}
      axisOptions={{
        font,
        lineColor: isDark ? "#71717a" : "#d4d4d8",
        labelColor: themeColors.headerText(isDark),
        axisSide: { x: "bottom", y: "left" },
        formatYLabel: (label) => (label ? `${label}` : ""),
        formatXLabel: (label) => (label ? `${label}` : ""),
      }}
    >
      {({ points, chartBounds }) => {
        return (
          <StackedBar
            animate={{ type: "spring" }}
            points={yKeys.map((key) => points[key])}
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
        );
      }}
    </CartesianChart>
  );
};
