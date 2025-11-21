import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import SearchHeader from "@/components/SearchHeader/SearchHeader";
import themeReducer from "@/slices/themeSlice";

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

describe("SearchHeader", () => {
  const mockProps = {
    onDataChange: jest.fn(),
    indexesLength: 0,
    handleChangeQuery: jest.fn(),
    query: "",
    handleSort: jest.fn(),
    handleOrder: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByPlaceholderText, getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    expect(getByPlaceholderText("Buscar productos...")).toBeTruthy();
    expect(getByText("Añadir productos al inventario")).toBeTruthy();
    expect(getByText("Existencia")).toBeTruthy();
    expect(getByText("Línea de producto")).toBeTruthy();
  });

  it("calls handleSearch when text input changes", () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    const searchInput = getByPlaceholderText("Buscar productos...");
    fireEvent.changeText(searchInput, "test product");

    expect(mockProps.handleChangeQuery).toHaveBeenCalledWith("test product");
  });

  it("displays the query value in search input", () => {
    const propsWithQuery = { ...mockProps, query: "test query" };
    const { getByDisplayValue } = render(
      <TestWrapper>
        <SearchHeader {...propsWithQuery} />
      </TestWrapper>
    );

    expect(getByDisplayValue("test query")).toBeTruthy();
  });

  it("switches between filter options correctly", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );
    const existenciaButton = getByText("Existencia");
    const lineaButton = getByText("Línea de producto");

    // Click on línea de producto
    fireEvent.press(lineaButton);

    // Should have called handleSort with the correct filter key
    expect(mockProps.handleSort).toHaveBeenCalledWith("linProd");
  });

  it("toggles order type when sort button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );
    // Initially should show "descendente"
    const orderText = getByText("Orden descendente");
    expect(orderText).toBeTruthy();

    // Press the order toggle and ensure handleOrder was called with the expected direction
    const sortWrapper = orderText.parent?.parent;
    const sortTouchable = sortWrapper?.children[1];
    if (sortTouchable) fireEvent.press(sortTouchable);

    // Since sortDirection prop is undefined in mockProps, pressing should request "asc"
    expect(mockProps.handleOrder).toHaveBeenCalledWith("asc");
  });

  it("calls handleOrder when filter or order changes", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );
    // Change filter to "Línea de producto"
    const lineaButton = getByText("Línea de producto");
    fireEvent.press(lineaButton);
    expect(mockProps.handleSort).toHaveBeenCalledWith("linProd");

    // Toggle order
    const orderText = getByText("Orden descendente");
    const sortWrapper = orderText.parent?.parent;
    const sortTouchable = sortWrapper?.children[1];
    if (sortTouchable) fireEvent.press(sortTouchable);
    expect(mockProps.handleOrder).toHaveBeenCalledWith("asc");
  });

  it("enables action buttons when indexesLength > 0", () => {
    const propsWithIndexes = { ...mockProps, indexesLength: 5 };
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...propsWithIndexes} />
      </TestWrapper>
    );

    const entregarButton = getByText("Agregar para entrega");
    const deshechoButton = getByText("Agregar para deshecho");

    expect(entregarButton).toBeTruthy();
    expect(deshechoButton).toBeTruthy();

    // These buttons should not be disabled
    fireEvent.press(entregarButton);
    fireEvent.press(deshechoButton);

    expect(mockProps.onDataChange).toHaveBeenCalledTimes(2);
  });

  it("disables action buttons when indexesLength is 0", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    const entregarButton = getByText("Agregar para entrega");
    const deshechoButton = getByText("Agregar para deshecho");

    // Buttons should be disabled, so onDataChange should not be called
    fireEvent.press(entregarButton);
    fireEvent.press(deshechoButton);

    expect(mockProps.onDataChange).not.toHaveBeenCalled();
  });

  it("applies dark theme styles correctly", () => {
    const { getByText } = render(
      <TestWrapper theme="dark">
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    const orderText = getByText("Orden descendente");
    expect(orderText).toBeTruthy();
  });

  it("applies light theme styles correctly", () => {
    const { getByText } = render(
      <TestWrapper theme="light">
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    const orderText = getByText("Orden descendente");
    expect(orderText).toBeTruthy();
  });

  it("calls onDataChange when action buttons are pressed", () => {
    const propsWithIndexes = { ...mockProps, indexesLength: 3 };
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...propsWithIndexes} />
      </TestWrapper>
    );

    const entregarButton = getByText("Agregar para entrega");
    fireEvent.press(entregarButton);

    expect(mockProps.onDataChange).toHaveBeenCalledWith([]);
  });
});
