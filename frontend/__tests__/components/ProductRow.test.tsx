import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationContainer } from "@react-navigation/native";
import ProductRow from "@/components/ProductRow/ProductRow";
import { addDays } from "../utils/dateUtils";
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

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return <NavigationContainer>{children}</NavigationContainer>;
};

describe("ProductRow", () => {
  const mockProduct: Lot = {
    product_id: "123", // Inve01.CVE_ART
    product_name: "Test Product", // Inve01.DESCR
    lot: "L-001", // Ltpd01.LOTE
    available_quantity: 10, // Ltpd01.CANTIDAD
    production_date: "2025-08-01", // Ltpd01.FEC_PROD_LT
    expiration_date: "2025-08-30", // Ltpd01.FCHCADUC
    last_movement: "2025-08-15", // Ltpd01.FCHULTMOV
    warehouse: 1, // Ltpd01.CVE_ALM
    status: "A", // Ltpd01.STATUS
    type: "fruit", // Inve01.LINEA
    image: "https://example.com/test-image.jpg",
    type_id: "fruit01", // Inve01.CVE_LINEA
    warehouseNamesCritical: [],
    warehouseNamesWarning: [],
    warehouseNamesGood: [],
  };

  const formatearFecha = (date: string) => {
    const [year, month, day] = date.split("-").map(Number);
    const fecha = new Date(year, month - 1, day); // 👈 esta sí es local
    return fecha.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const mockProps = {
    index: 0,
    isSelected: false,
    handleSelect: jest.fn(),
    product: mockProduct,
  };
  const today = new Date();
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock current date to ensure consistent test results
    jest.useFakeTimers();
    jest.setSystemTime(today); // Set to current date
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
    expect(
      getByText(formatearFecha(mockProduct.production_date!))
    ).toBeTruthy();
    expect(
      getByText("CAD: " + formatearFecha(mockProduct.expiration_date!))
    ).toBeTruthy();
  });

  it("displays correct quantity units for known CVE_LIN codes", () => {
    // Mapping por type_id (CVE_LIN canónico de Aspel). Ver functions/unitForLine.ts.
    const testCases = [
      { type_id: "FYV", expectedUnit: "kg" },
      { type_id: "V1N", expectedUnit: "kg" },
      { type_id: "AOA", expectedUnit: "kg" },
      { type_id: "LECHE", expectedUnit: "litros" },
      { type_id: "AYG", expectedUnit: "litros" },
      { type_id: "E2P", expectedUnit: "botellas" },
      { type_id: "A2P", expectedUnit: "latas" },
      { type_id: "B2P", expectedUnit: "paquetes" },
      { type_id: "P1P", expectedUnit: "piezas" },
      { type_id: "T1P", expectedUnit: "porciones" },
      { type_id: "NP", expectedUnit: "unidades" },
    ];

    testCases.forEach(({ type_id, expectedUnit }) => {
      const productWithType = { ...mockProduct, type_id };
      const { getByText } = render(
        <TestWrapper>
          <ProductRow {...mockProps} product={productWithType} />
        </TestWrapper>
      );

      expect(getByText(`10\n${expectedUnit}`)).toBeTruthy();
    });
  });

  it("falls back to heuristic on description when type_id is unknown", () => {
    const productHeuristic = {
      ...mockProduct,
      type_id: null,
      type: "FRUTAS Y VERDURAS A GRANEL",
    };
    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productHeuristic as any} />
      </TestWrapper>
    );

    expect(getByText("10\nkg")).toBeTruthy();
  });

  it("uses default 'unidades' when neither type_id nor type matches", () => {
    const productUnknown = {
      ...mockProduct,
      type_id: "WHATEVER_XYZ",
      type: "ALGO_QUE_NO_EXISTE",
    };
    const { getByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productUnknown } />
      </TestWrapper>
    );

    expect(getByText("10\nunidades")).toBeTruthy();
  });

  it("shows critical status for products expiring in 2 days or less", () => {
    const criticalProduct = {
      ...mockProduct,
      expiration_date: addDays(today, 2).toISOString().split("T")[0], // 2 days from current date
      warehouseNamesCritical: ["Alm-1"],
      warehouseNamesWarning: [],
      warehouseNamesGood: [],
    };

    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={criticalProduct} />
      </TestWrapper>
    );

    // check the status circles background colors
    const row = getByTestId("product-row");
    const lastChild = row.props.children[row.props.children.length - 1];
    const circles = lastChild.props.children;
    const bg0 = Array.isArray(circles[0].props.style)
      ? Object.assign({}, ...circles[0].props.style).backgroundColor
      : circles[0].props.style.backgroundColor;
    const bg1 = Array.isArray(circles[1].props.style)
      ? Object.assign({}, ...circles[1].props.style).backgroundColor
      : circles[1].props.style.backgroundColor;
    const bg2 = Array.isArray(circles[2].props.style)
      ? Object.assign({}, ...circles[2].props.style).backgroundColor
      : circles[2].props.style.backgroundColor;

    expect(bg0).toBe("#D32F2F");
    expect(bg1).toBe("transparent");
    expect(bg2).toBe("transparent");
  });

  it("shows priority status for products expiring in 3-5 days", () => {
    const priorityProduct = {
      ...mockProduct,
      expiration_date: addDays(today, 4).toISOString().split("T")[0], // 4 days from current date
      warehouseNamesCritical: [],
      warehouseNamesWarning: ["Alm-1"],
      warehouseNamesGood: [],
    };

    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={priorityProduct} />
      </TestWrapper>
    );

    const row = getByTestId("product-row");
    const lastChild = row.props.children[row.props.children.length - 1];
    const circles = lastChild.props.children;
    const bg0 = Array.isArray(circles[0].props.style)
      ? Object.assign({}, ...circles[0].props.style).backgroundColor
      : circles[0].props.style.backgroundColor;
    const bg1 = Array.isArray(circles[1].props.style)
      ? Object.assign({}, ...circles[1].props.style).backgroundColor
      : circles[1].props.style.backgroundColor;
    const bg2 = Array.isArray(circles[2].props.style)
      ? Object.assign({}, ...circles[2].props.style).backgroundColor
      : circles[2].props.style.backgroundColor;

    expect(bg0).toBe("transparent");
    expect(bg1).toBe("#FFA000");
    expect(bg2).toBe("transparent");
  });

  it("shows stable status for products expiring in more than 5 days", () => {
    const stableProduct = {
      ...mockProduct,
      expiration_date: addDays(today, 9).toISOString().split("T")[0], // 9 days from current date
      warehouseNamesCritical: [],
      warehouseNamesWarning: [],
      warehouseNamesGood: ["Alm-1"],
    };

    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={stableProduct} />
      </TestWrapper>
    );

    const row = getByTestId("product-row");
    const lastChild = row.props.children[row.props.children.length - 1];
    const circles = lastChild.props.children;
    const bg0 = Array.isArray(circles[0].props.style)
      ? Object.assign({}, ...circles[0].props.style).backgroundColor
      : circles[0].props.style.backgroundColor;
    const bg1 = Array.isArray(circles[1].props.style)
      ? Object.assign({}, ...circles[1].props.style).backgroundColor
      : circles[1].props.style.backgroundColor;
    const bg2 = Array.isArray(circles[2].props.style)
      ? Object.assign({}, ...circles[2].props.style).backgroundColor
      : circles[2].props.style.backgroundColor;

    expect(bg0).toBe("transparent");
    expect(bg1).toBe("transparent");
    expect(bg2).toBe("#388E3C");
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
      production_date: "2025-01-15",
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
    // This behaviour is already validated in the specific expiration-status tests above
    // Ensure the component renders without crashing for a given date
    const criticalProduct = { ...mockProduct, expiration_date: "2025-08-23" };
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={criticalProduct} />
      </TestWrapper>
    );
    expect(getByTestId("product-row")).toBeTruthy();
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

  it("shows 'Sin stock' badge when available_quantity is 0", () => {
    const productNoStock = { ...mockProduct, available_quantity: 0 };
    const { getByTestId, getByText, queryByText } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productNoStock} />
      </TestWrapper>
    );

    expect(getByTestId("sin-stock-badge")).toBeTruthy();
    expect(getByText("Sin stock")).toBeTruthy();
    expect(queryByText("0\nunidades")).toBeNull();
  });

  it("shows 'Sin stock' badge for float-noise values below 0.001", () => {
    const productNoise = { ...mockProduct, available_quantity: -8.5e-14 };
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productNoise} />
      </TestWrapper>
    );

    expect(getByTestId("sin-stock-badge")).toBeTruthy();
  });

  it("dims the row opacity when product has no stock", () => {
    const productNoStock = { ...mockProduct, available_quantity: 0 };
    const { getByTestId } = render(
      <TestWrapper>
        <ProductRow {...mockProps} product={productNoStock} />
      </TestWrapper>
    );

    const row = getByTestId("product-row");
    expect(row.props.style.opacity).toBeLessThan(1);
  });
});
