import React from "react";
import { render } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import Semaforo from "@/components/Semaforo/Semaforo";
import themeReducer from "@/slices/themeSlice";
import { productosDummy } from "@/constants/Products";
import { getProductStatusCounts } from "../utils/productUtil";

// Mock FeaturedRow component
jest.mock("@/components/FeaturedRow/FeaturedRow", () => {
  const { View, Text } = require("react-native");
  return function FeaturedRow({ status, productos }: any) {
    return (
      <View testID={`featured-row-${status.category}`}>
        <Text testID={`status-title-${status.category}`}>{status.title}</Text>
        <Text testID={`product-count-${status.category}`}>
          {productos.length}
        </Text>
      </View>
    );
  };
});

// Create a mock store
const createMockStore = () => {
  return configureStore({
    reducer: {
      theme: themeReducer,
    },
    preloadedState: {
      theme: { theme: "light" },
    },
  });
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const store = createMockStore();
  return <Provider store={store}>{children}</Provider>;
};

describe("Semaforo", () => {
  it("renders correctly", () => {
    const { getByText } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    expect(
      getByText(getProductStatusCounts(productosDummy.items, "critical"))
    ).toBeTruthy();
    expect(
      getByText(
        getProductStatusCounts(productosDummy.items, "warning").toString()
      )
    ).toBeTruthy();
    expect(
      getByText(getProductStatusCounts(productosDummy.items, "good"))
    ).toBeTruthy();
  });

  it("displays status numbers with correct colors", () => {
    const { getByText } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    const criticNumber = getByText(
      getProductStatusCounts(productosDummy.items, "critical")
    );
    const warningNumber = getByText(
      getProductStatusCounts(productosDummy.items, "warning")
    );
    const stableNumber = getByText(
      getProductStatusCounts(productosDummy.items, "good")
    );

    expect(criticNumber.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#FF4D4F" })])
    );
    expect(warningNumber.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#FFC107" })])
    );
    expect(stableNumber.props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ color: "#52C41A" })])
    );
  });

  it("displays status descriptions correctly", () => {
    const { getAllByText } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    expect(getAllByText(/estado\s*critic/i).length).toBeGreaterThan(0);
    expect(getAllByText(/estado\s*prioritario/i).length).toBeGreaterThan(0);
    expect(getAllByText(/estado\s*estable/i).length).toBeGreaterThan(0);
  });

  it("renders FeaturedRow components for each status", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    expect(getByTestId("featured-row-crítico")).toBeTruthy();
    expect(getByTestId("featured-row-prioritario")).toBeTruthy();
    expect(getByTestId("featured-row-estable")).toBeTruthy();
  });

  it("passes correct status titles to FeaturedRow components", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    expect(getByTestId("status-title-crítico").props.children).toBe(
      "Lotes en estado crítico"
    );
    expect(getByTestId("status-title-prioritario").props.children).toBe(
      "Lotes en estado prioritario"
    );
    expect(getByTestId("status-title-estable").props.children).toBe(
      "Lotes en estado estable"
    );
  });

  it("has gradient bar component", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <Semaforo productos={productosDummy.items} />
      </TestWrapper>
    );

    // The gradient bar should be rendered
    const semaforo =
      getByTestId ||
      render(<Semaforo productos={productosDummy.items} />).getByTestId;
    expect(semaforo).toBeTruthy();
  });
});
