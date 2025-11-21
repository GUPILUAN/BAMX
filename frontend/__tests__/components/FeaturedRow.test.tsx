import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import FeaturedRow from "@/components/FeaturedRow/FeaturedRow";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/slices/themeSlice";

jest.mock("@/functions/NavigationService", () => ({ navigate: jest.fn() }));

const createMockStore = (theme = "light") =>
  configureStore({
    reducer: { theme: themeReducer },
    preloadedState: { theme: { theme } },
  });

const TestWrapper = ({ children, theme = "light" }: any) => {
  const store = createMockStore(theme);
  return <Provider store={store}>{children}</Provider>;
};

describe("FeaturedRow", () => {
  it("shows empty state when no productos", () => {
    const { getByText } = render(
      <TestWrapper>
        <FeaturedRow
          status={{ title: "Prueba", category: "estable" }}
          productos={[]}
        />
      </TestWrapper>
    );

    expect(getByText("No hay productos disponibles")).toBeTruthy();
  });

  it("renders productos and footer button when productos provided", () => {
    const productos = [
      {
        product_id: "p1",
        product_name: "A",
        expiration_date: new Date().toISOString().split("T")[0],
      },
    ];
    const { getByText } = render(
      <TestWrapper>
        <FeaturedRow
          status={{ title: "Prueba", category: "crítico" }}
          productos={productos as any}
        />
      </TestWrapper>
    );

    // Footer contains 'Ver inventario' text
    expect(getByText("Ver inventario")).toBeTruthy();
  });
});
