import React from "react";
import { render } from "@testing-library/react-native";
import DetailsScreen from "@/screens/DetailsScreen/DetailsScreen";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "@/slices/themeSlice";

// Mock useLocalSearchParams from expo-router
jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ item: JSON.stringify(mockProduct) }),
}));

// Mock NavigationService.goBack
jest.mock("@/functions/NavigationService", () => ({ goBack: jest.fn() }));

const createMockStore = (theme = "light") =>
  configureStore({
    reducer: { theme: themeReducer },
    preloadedState: { theme: { theme } },
  });

// create a dynamic production date (today - 5 days) to avoid hardcoded dates
const makeDateString = (offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  return d.toISOString().split("T")[0];
};

const mockProduct = {
  product_id: "P-123",
  product_name: "Producto Prueba",
  production_date: makeDateString(5),
  type: "test-type",
  image: "",
};

describe("DetailsScreen", () => {
  it("renders product details and dynamic date", () => {
    const store = createMockStore();
    const { getByText, getAllByText } = render(
      <Provider store={store}>
        <DetailsScreen />
      </Provider>
    );

    expect(getByText("Producto Prueba")).toBeTruthy();
    // The Registro line should include the dynamic production_date
    expect(getByText(new RegExp(mockProduct.production_date))).toBeTruthy();
    // Assert that the type and id values are shown (labels may vary)
    expect(getAllByText(mockProduct.type).length).toBeGreaterThan(0);
    expect(getAllByText(mockProduct.product_id).length).toBeGreaterThan(0);
  });
});
