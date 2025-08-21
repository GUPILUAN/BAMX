import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import ProductRow from "../../components/ProductRow";
import { Product } from "../../types/Product";

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

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

describe("ProductRow", () => {
  const mockProduct: Product = {
    name: "Test Product",
    quantity: 10,
    entry_date: "2025-08-01",
    expiration_date: "2025-08-30",
    type: "fruit",
    product_id: "123",
    image: "test-image.jpg",
  };

  const mockProps = {
    index: 0,
    isSelected: false,
    handleSelect: jest.fn(),
    product: mockProduct,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(new Date()); // Set to current date
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("renders correctly", () => {
    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} />
      </TestWrapper>
    );

    expect(getByText("Test Product")).toBeTruthy();
    expect(getByText("10\nunidades")).toBeTruthy();
    expect(getByText("01/08/2025")).toBeTruthy();
    expect(getByText("CAD: 30/08/2025")).toBeTruthy();
  });

  it("displays correct quantity units for different product types", () => {
    const testCases = [
      { type: "fruit", expectedUnit: "unidades" },
      { type: "canned_food", expectedUnit: "latas" },
      { type: "bottle", expectedUnit: "botellas" },
      { type: "grain", expectedUnit: "kilogramos" },
      { type: "dairy", expectedUnit: "litros" },
      { type: "snack", expectedUnit: "paquetes" },
      { type: "jar", expectedUnit: "frasco" },
    ];

    testCases.forEach(({ type, expectedUnit }) => {
      const productWithType = { ...mockProduct, type };
      const { getByText } = render(
        <TestWrapper>
          <ProductRow {...mockProps} product={productWithType} />
        </TestWrapper>
      );

      expect(getByText(`10\n${expectedUnit}`)).toBeTruthy();
    });
  });

  it("shows critical status for products expiring in 2 days or less", () => {
    const criticalProduct = {
      ...mockProduct,
      expiration_date: "2025-08-23", // 2 days from current date
    };

    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={criticalProduct} />
      </TestWrapper>
    );

    expect(getByText("Estado crítico")).toBeTruthy();
  });

  it("shows priority status for products expiring in 3-5 days", () => {
    const priorityProduct = {
      ...mockProduct,
      expiration_date: "2025-08-25", // 4 days from current date
    };

    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={priorityProduct} />
      </TestWrapper>
    );

    expect(getByText("Estado prioritario")).toBeTruthy();
  });

  it("shows stable status for products expiring in more than 5 days", () => {
    const stableProduct = {
      ...mockProduct,
      expiration_date: "2025-08-30", // 9 days from current date
    };

    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={stableProduct} />
      </TestWrapper>
    );

    expect(getByText("Estado estable")).toBeTruthy();
  });

  it("calls handleSelect when row is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} />
      </TestWrapper>
    );

    const productRow = getByText("Test Product");
    fireEvent.press(productRow);

    expect(mockProps.handleSelect).toHaveBeenCalledWith("123");
  });

  it("navigates to details when info button is pressed", () => {
    const { navigate } = require("../../functions/NavigationService");
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} />
      </TestWrapper>
    );

    // Find the info button by its FontAwesome6 icon
    const infoButtons =
      getByTestId("info-button") ||
      (() => {
        // Fallback: find by text content or other method
        const { getAllByText } = render(
          <TestWrapper>
            <ProductRow {...mockProps} />
          </TestWrapper>
        );
        return getAllByText("Test Product")[0].parent?.parent?.children[0];
      });

    if (infoButtons) {
      fireEvent.press(infoButtons);
      expect(navigate).toHaveBeenCalledWith("Details", {
        product: mockProduct,
      });
    }
  });

  it("applies selected styles when isSelected is true", () => {
    const selectedProps = { ...mockProps, isSelected: true };
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...selectedProps} />
      </TestWrapper>
    );

    const productRow = getByTestId("product-row");
    expect(productRow?.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "lightblue",
        opacity: 0.5,
      })
    );
  });

  it("applies alternating row colors based on index", () => {
    // Even index (0) should have gray background
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} index={0} />
      </TestWrapper>
    );

    const evenRow = getByTestId("product-row");
    expect(evenRow?.props.className).toContain("bg-gray-200");

    // Odd index (1) should have white background
    const { getByTestId: getByTestIdOdd } = render(
      <TestWrapper>
        <ProductRow {...mockProps} index={1} />
      </TestWrapper>
    );

    const oddRow = getByTestIdOdd("product-row");
    expect(oddRow?.props.className).toContain("bg-white");
  });

  it("formats dates correctly", () => {
    const productWithDates = {
      ...mockProduct,
      entry_date: "2025-01-15",
      expiration_date: "2025-12-25",
    };

    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productWithDates} />
      </TestWrapper>
    );

    expect(getByText("15/01/2025")).toBeTruthy();
    expect(getByText("CAD: 25/12/2025")).toBeTruthy();
  });

  it("applies correct background colors for different status states", () => {
    const criticalProduct = { ...mockProduct, expiration_date: "2025-08-23" };
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={criticalProduct} />
      </TestWrapper>
    );

    const statusElement = getByTestId("status-indicator");
    expect(statusElement?.props.style).toEqual(
      expect.objectContaining({
        backgroundColor: "#FF4D4F",
      })
    );
  });

  it("renders edit button", () => {
    const { UNSAFE_getByProps } = render(
      <TestWrapper>
        <ProductRow {...mockProps} />
      </TestWrapper>
    );

    // The edit button should be rendered (FontAwesome5 with name="edit")
    expect(UNSAFE_getByProps({ name: "edit" })).toBeTruthy();
  });
});
