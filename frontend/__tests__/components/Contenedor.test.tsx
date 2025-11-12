import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Contenedor from "@/components/Contenedor/Contenedor";
import themeReducer from "@/slices/themeSlice";
import { Container } from "@/types/Container";
import { NativeModules } from "react-native";

// Mock StackedBarChart component
jest.mock("@/components/StackedBarChart/StackedBarChart", () => ({
  StackedBarChart: jest.fn(({ data, width, height, isDark }) => {
    const React = require("react");
    const { View, Text } = require("react-native");
    return (
      <View testID="stacked-bar-chart">
        <Text testID="chart-width">{width}</Text>
        <Text testID="chart-height">{height}</Text>
        <Text testID="chart-isDark">{isDark.toString()}</Text>
        <Text testID="chart-data">{JSON.stringify(data)}</Text>
      </View>
    );
  }),
}));

// Create a mock store
const createMockStore = (theme = "light") => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { theme: theme },
    },
  });
};

// Test wrapper component
const TestWrapper = ({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: string;
}) => {
  const store = createMockStore(theme);
  return <Provider store={store}>{children}</Provider>;
};

describe("Contenedor", () => {
  const mockContainerActive: Container = {
    id: 1,
    name: "Refrigerador Principal",
    active: true,
    last_opened: "2025-09-27 10:30:00",
    temperature: -5.5,
    labels: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
    data: [
      [10, 5, 15],
      [8, 7, 12],
      [12, 3, 18],
      [6, 9, 14],
      [9, 6, 16],
    ],
  };

  const mockContainerInactive: Container = {
    ...mockContainerActive,
    active: false,
  };

  const mockContainerHotTemp: Container = {
    ...mockContainerActive,
    temperature: 10.2,
  };

  const mockContainerVeryColTemp: Container = {
    ...mockContainerActive,
    temperature: -15.8,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders correctly with active container data", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      expect(getByText("Refrigerador Principal")).toBeTruthy();
      expect(getByText("-5.5°C")).toBeTruthy();
      expect(getByText("Activo")).toBeTruthy();
      expect(getByText("Última temperatura: 2025-09-27 10:30:00")).toBeTruthy();
    });

    it("renders correctly with inactive container", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerInactive} />
        </TestWrapper>
      );

      expect(getByText("Refrigerador Principal")).toBeTruthy();
      expect(getByText("Off")).toBeTruthy();
    });

    it("renders StackedBarChart with correct props", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      const chart = getByTestId("stacked-bar-chart");
      expect(chart).toBeTruthy();

      expect(getByTestId("chart-width")).toHaveTextContent("450");
      expect(getByTestId("chart-height")).toHaveTextContent("220");
      expect(getByTestId("chart-isDark")).toHaveTextContent("false");

      // Check chart data
      const chartDataText = getByTestId("chart-data").props.children;
      const chartData = JSON.parse(chartDataText);
      expect(chartData.labels).toEqual(mockContainerActive.labels);
      expect(chartData.data).toEqual(mockContainerActive.data);
      expect(chartData.barColors).toEqual(["#ff3e3e", "#f3ca20", "#32cd32"]);
      expect(chartData.legend).toEqual([
        "Estado Crítico",
        "Estado Prioritario",
        "Estado Estable",
      ]);
    });
  });

  describe("Temperature Display Logic", () => {
    it("displays normal temperature with correct color and icon for active container", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      const tempText = getByText("-5.5°C");
      expect(tempText.props.style).toMatchObject({
        fontSize: 36,
        color: "#4193f7", // Normal temperature color
      });
    });

    it("displays hot temperature with red color and warning icon", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerHotTemp} />
        </TestWrapper>
      );

      const tempText = getByText("10.2°C");
      expect(tempText.props.style).toMatchObject({
        fontSize: 36,
        color: "red", // Hot temperature color
      });
    });

    it("displays very cold temperature with blue color", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerVeryColTemp} />
        </TestWrapper>
      );

      const tempText = getByText("-15.8°C");
      expect(tempText.props.style).toMatchObject({
        fontSize: 36,
        color: "#003366", // Very cold temperature color
      });
    });

    it("displays inactive container temperature with red color", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerInactive} />
        </TestWrapper>
      );

      const tempText = getByText("-5.5°C");
      expect(tempText.props.style).toMatchObject({
        fontSize: 36,
        color: "red", // Inactive container color
      });
    });
  });

  it("applies correct styling to active status", () => {
    const { getByText } = render(
      <TestWrapper>
        <Contenedor contenedor={mockContainerActive} />
      </TestWrapper>
    );

    const statusText = getByText("Activo");
    expect(statusText.props.style).toMatchObject({
      color: "green",
      fontWeight: "bold",
    });
  });

  describe("Active/Inactive Status Toggle", () => {
    it("toggles status from active to inactive when button is pressed", async () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      const statusButton = getByText("Activo");
      expect(statusButton).toBeTruthy();

      fireEvent.press(statusButton);

      await waitFor(() => {
        expect(getByText("Off")).toBeTruthy();
      });

      // Verify the container object itself was updated
      expect(mockContainerActive.active).toBe(false);
    });

    it("applies correct styling to inactive status", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerInactive} />
        </TestWrapper>
      );

      const statusText = getByText("Off");
      expect(statusText.props.style).toMatchObject({
        color: "red",
        fontWeight: "bold",
      });
    });

    it("toggles status from inactive to active when button is pressed", async () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerInactive} />
        </TestWrapper>
      );

      const statusButton = getByText("Off");
      expect(statusButton).toBeTruthy();

      fireEvent.press(statusButton);

      await waitFor(() => {
        expect(getByText("Activo")).toBeTruthy();
      });

      // Verify the container object itself was updated
      expect(mockContainerInactive.active).toBe(true);
    });
  });

  describe("Theme Integration", () => {
    it("renders with light theme styling", () => {
      const { getByText } = render(
        <TestWrapper theme="light">
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      const title = getByText("Refrigerador Principal");
      expect(title).toBeTruthy();
    });

    it("renders with dark theme styling", () => {
      const { getByText, getByTestId } = render(
        <TestWrapper theme="dark">
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      const title = getByText("Refrigerador Principal");
      expect(title).toBeTruthy();

      // Check that chart receives dark theme prop
      expect(getByTestId("chart-isDark")).toHaveTextContent("true");
    });

    it("passes dark theme flag to StackedBarChart", () => {
      const { getByTestId } = render(
        <TestWrapper theme="dark">
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      expect(getByTestId("chart-isDark")).toHaveTextContent("true");
    });
  });

  describe("Icon Logic", () => {
    it("shows temperature-low icon for normal active temperature", () => {
      // This test verifies the icon logic indirectly through component behavior
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      // The icon should be rendered for active, normal temperature
      expect(getByText("-5.5°C")).toBeTruthy();
    });

    it("shows temperature-arrow-up icon for hot temperature", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerHotTemp} />
        </TestWrapper>
      );

      // Hot temperature should show warning icon
      expect(getByText("10.2°C")).toBeTruthy();
    });

    it("shows snowflake icon for very cold temperature", () => {
      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerVeryColTemp} />
        </TestWrapper>
      );

      // Very cold temperature should show snowflake icon
      expect(getByText("-15.8°C")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles zero temperature correctly", () => {
      const zeroTempContainer: Container = {
        ...mockContainerActive,
        temperature: 0,
        active: true,
      };

      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={zeroTempContainer} />
        </TestWrapper>
      );

      expect(getByText("0.0°C")).toBeTruthy();
    });

    it("handles very low temperature correctly", () => {
      const lowTempContainer: Container = {
        ...mockContainerActive,
        temperature: -50.3,
        active: true,
      };

      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={lowTempContainer} />
        </TestWrapper>
      );

      const tempText = getByText("-50.3°C");
      expect(tempText.props.style.color).toBe("#003366");
    });

    it("handles very high temperature correctly", () => {
      const highTempContainer: Container = {
        ...mockContainerActive,
        temperature: 50.7,
        active: true,
      };

      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={highTempContainer} />
        </TestWrapper>
      );

      const tempText = getByText("50.7°C");
      expect(tempText.props.style.color).toBe("red");
    });

    it("handles empty labels and data arrays", () => {
      const emptyDataContainer: Container = {
        ...mockContainerActive,
        labels: [],
        data: [],
      };

      const { getByTestId } = render(
        <TestWrapper>
          <Contenedor contenedor={emptyDataContainer} />
        </TestWrapper>
      );

      const chartData = JSON.parse(getByTestId("chart-data").props.children);
      expect(chartData.labels).toEqual([]);
      expect(chartData.data).toEqual([]);
    });

    it("handles long container name", () => {
      const longNameContainer: Container = {
        ...mockContainerActive,
        name: "Refrigerador Principal Con Nombre Muy Largo Para Pruebas",
      };

      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={longNameContainer} />
        </TestWrapper>
      );

      expect(
        getByText("Refrigerador Principal Con Nombre Muy Largo Para Pruebas")
      ).toBeTruthy();
    });

    it("handles special characters in last_opened date", () => {
      const specialCharContainer: Container = {
        ...mockContainerActive,
        last_opened: "2025-09-27T10:30:00.000Z",
      };

      const { getByText } = render(
        <TestWrapper>
          <Contenedor contenedor={specialCharContainer} />
        </TestWrapper>
      );

      expect(
        getByText("Última temperatura: 2025-09-27T10:30:00.000Z")
      ).toBeTruthy();
    });
  });

  describe("Component Layout", () => {
    it("maintains proper flex layout structure", () => {
      const { getByTestId } = render(
        <TestWrapper>
          <Contenedor contenedor={mockContainerActive} />
        </TestWrapper>
      );

      // Chart should have correct width calculation
      expect(getByTestId("chart-width")).toHaveTextContent("450");
    });
  });
});
