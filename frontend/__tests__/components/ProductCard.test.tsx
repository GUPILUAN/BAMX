import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import ProductCard from "../../components/ProductCard";
import themeReducer from "../../slices/themeSlice";

// Mock NavigationService
jest.mock("../../functions/NavigationService", () => ({
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
  const mockProduct = {
    name: "Test Product",
    image: "https://example.com/test-image.jpg",
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

  it('renders "Entregar" and "Desechar" buttons', async () => {
    const { getByText } = render(
      <TestWrapper>
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText("Entregar")).toBeTruthy();
      expect(getByText("Desechar")).toBeTruthy();
    });
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
      name: "Test Product No Image",
    };

    const { getByText } = render(
      <TestWrapper>
        <ProductCard item={productWithoutImage} />
      </TestWrapper>
    );

    await waitFor(() => {
      expect(getByText("Test Product No Image")).toBeTruthy();
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

    expect(navigate).toHaveBeenCalledWith("Details", { item: mockProduct });
  });

  it("handles button presses without errors", async () => {
    const { getByText } = render(
      <TestWrapper>
        <ProductCard item={mockProduct} />
      </TestWrapper>
    );

    await waitFor(() => {
      const entregarButton = getByText("Entregar");
      const desecharButton = getByText("Desechar");

      fireEvent.press(entregarButton);
      fireEvent.press(desecharButton);

      // Should not throw any errors
      expect(entregarButton).toBeTruthy();
      expect(desecharButton).toBeTruthy();
    });
  });
});
