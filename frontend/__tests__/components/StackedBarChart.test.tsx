import React from "react";
import { render } from "@testing-library/react-native";

// Mock useFont to return a truthy value
jest.mock("@shopify/react-native-skia", () => ({ useFont: () => ({}) }));

// Mock victory-native CartesianChart and StackedBar to simple components
jest.mock("victory-native", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    CartesianChart: ({ children }: any) => (
      <View testID="cartesian">
        <Text>cartesian</Text>
        {children({ points: {}, chartBounds: {} })}
      </View>
    ),
    StackedBar: () => <View testID="stackedbar" />,
  };
});

import { StackedBarChart } from "@/components/StackedBarChart/StackedBarChart";

describe("StackedBarChart", () => {
  it("renders when font is available and data provided", () => {
    const data = {
      labels: ["L1", "L2"],
      data: [
        [1, 2, 3],
        [2, 1, 1],
      ],
      barColors: ["#f00", "#0f0", "#00f"],
      legend: ["A", "B", "C"],
    };

    const { getByTestId } = render(
      <StackedBarChart data={data as any} width={300} height={200} />
    );

    expect(getByTestId("cartesian")).toBeTruthy();
    expect(getByTestId("stackedbar")).toBeTruthy();
  });
});
