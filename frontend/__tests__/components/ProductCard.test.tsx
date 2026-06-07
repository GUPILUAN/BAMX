import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import ProductCard from "@/components/ProductCard/ProductCard";
import themeReducer from "@/slices/themeSlice";
import { Lot } from "@/types/Lot";

// Mock NavigationService
jest.mock("@/functions/NavigationService", () => ({
  navigate: jest.fn(),
}));

// Mock useNavigation
const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
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
  return (
    <Provider store={store}>
      <NavigationContainer>{children}</NavigationContainer>
    </Provider>
  );
};

describe("ProductCard", () => {
  const mockProduct: Lot = {
    product_id: "123", // Inve01.CVE_ART
    product_name: "Test Product", // Inve01.DESCR
    lot: "L-001", // Ltpd01.LOTE
    available_quantity: 10, // Ltpd01.CANTIDAD
    production_date: "2025-08-01", // Ltpd01.FEC_PROD_LT
    expiration_date: "2025-08-30", // Ltpd01.FCHCADUC
    last_movement: "2025-08-15", // Ltpd01.FCHULTMOV
    warehouse: 1, // Ltpd01.CVE_ALM
    status: "critical", // Ltpd01.STATUS
    type: "fruit", // Inve01.LINEA
    image: "https://example.com/test-image.jpg",
    type_id: "fruit01", // Inve01.CVE_LINEA
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly with product data", async () => {
    const { getByText } = render(
      <TestWrapper>
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText("Test Product")).toBeTruthy();
    });
  });

  it("shows loading indicator initially", () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    // The loading view should be present initially
    expect(getByTestId("loading-indicator")).toBeTruthy();
  });

  it("applies dark theme styles correctly", async () => {
    const { getByText } = render(
      <TestWrapper theme="dark">
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      const productName = getByText("Test Product");
      expect(productName.props.className).toContain("text-white");
    });
  });

  it("applies light theme styles correctly", async () => {
    const { getByText } = render(
      <TestWrapper theme="light">
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      const productName = getByText("Test Product");
      expect(productName.props.className).toContain("text-black");
    });
  });

  it("handles missing image gracefully", async () => {
    const productWithoutImage = {
      product_id: "123", // Inve01.CVE_ART
      product_name: "Test Product", // Inve01.DESCR
      lot: "L-001", // Ltpd01.LOTE
      available_quantity: 10, // Ltpd01.CANTIDAD
      production_date: "2025-08-01", // Ltpd01.FEC_PROD_LT
      expiration_date: "2025-08-30", // Ltpd01.FCHCADUC
      last_movement: "2025-08-15", // Ltpd01.FCHULTMOV
      warehouse: 1, // Ltpd01.CVE_ALM
      status: "critical", // Ltpd01.STATUS
      type: "fruit", // Inve01.LINEA
      image: null,
      type_id: "fruit01", // Inve01.CVE_LINEA
    };

    const { getByText, getByTestId } = render(
      <TestWrapper>
        <ProductCard item={productWithoutImage} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByTestId("default-product-image")).toBeTruthy();
      expect(getByText("Test Product")).toBeTruthy();
    });
  });

  it("navigates to details when info button is pressed", async () => {
    const { navigate } = require("../../functions/NavigationService");

    const { getByTestId } = render(
      <TestWrapper>
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      const infoButton = getByTestId("info-button");
      fireEvent.press(infoButton);
    });

    expect(navigate).toHaveBeenCalledWith("Details", {
      item: JSON.stringify(mockProduct),
    });
  });

});
