import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import ProductList from "@/components/ProductList/ProductList";
import { NavigationContainer } from "@react-navigation/native";

const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <NavigationContainer>{children}</NavigationContainer>
);

describe("ProductList", () => {
  const productos = Array.from({ length: 3 }).map((_, i) => ({
    id: `p-${i}`,
    product_id: `CVE-${i}`,
    product_name: `Producto ${i}`,
    available_quantity: 5 + i,
    type: "fruit",
    production_date: new Date().toISOString().split("T")[0],
    expiration_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * (10 + i))
      .toISOString()
      .split("T")[0],
    warehouseNamesCritical: [],
    warehouseNamesWarning: [],
    warehouseNamesGood: [],
  }));

  it("renders headers and rows and handles pagination", () => {
    const loadMore = jest.fn();
    const loadLess = jest.fn();
    const setCurrentPage = jest.fn();

    const { getByText, getAllByText } = render(
      <TestWrapper>
        <ProductList
          productos={productos as any}
          currentPage={0}
          totalPages={3}
          loadMore={loadMore}
          loadLess={loadLess}
          setCurrentPage={setCurrentPage}
        />
      </TestWrapper>
    );

    // Headers
    expect(getByText("Producto")).toBeTruthy();
    expect(getByText("Cantidad")).toBeTruthy();
    expect(getByText("Tipo")).toBeTruthy();

    // Rows: product names
    expect(getByText("Producto 0")).toBeTruthy();

    // Pagination numbers (1..3)
    expect(getAllByText("1").length).toBeGreaterThan(0);

    // Click page 2
    const page2 = getByText("2");
    fireEvent.press(page2);
    expect(setCurrentPage).toHaveBeenCalledWith(1);

    // We already validated page button click above; loadMore/loadLess are provided by props
  });
});
