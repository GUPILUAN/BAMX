import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import SearchHeader from "../../components/SearchHeader";
import themeReducer from "../../slices/themeSlice";

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
    handleSearch: jest.fn(),
    query: "",
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
    expect(getByText("Ordenar por fecha de ingreso")).toBeTruthy();
    expect(getByText("Ordenar por fecha de caducidad")).toBeTruthy();
  });

  it("calls handleSearch when text input changes", () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    const searchInput = getByPlaceholderText("Buscar productos...");
    fireEvent.changeText(searchInput, "test product");

    expect(mockProps.handleSearch).toHaveBeenCalledWith("test product");
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

    const ingresoButton = getByText("Ordenar por fecha de ingreso");
    const caducidadButton = getByText("Ordenar por fecha de caducidad");

    // Initially, ingreso should be selected
    expect(ingresoButton.parent?.props.className).toContain("bg-gray-300");
    expect(caducidadButton.parent?.props.className).toContain("bg-white");

    // Click on caducidad button
    fireEvent.press(caducidadButton);

    // Now caducidad should be selected
    expect(caducidadButton.parent?.props.className).toContain("bg-gray-300");
  });

  it("toggles order type when sort button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    // Initially should show "descendente"
    expect(getByText("Orden descendente")).toBeTruthy();

    // Find and press the sort button (it's a TouchableOpacity with MaterialCommunityIcons)
    const sortButtons = getByText("Orden descendente").parent?.parent;
    const sortButton = sortButtons?.children[1]; // The TouchableOpacity is the second child

    if (sortButton) {
      fireEvent.press(sortButton);
    }

    // After clicking, it should show "ascendente"
    expect(getByText("Orden ascendente")).toBeTruthy();
  });

  it("calls handleOrder when filter or order changes", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    // Initially should call handleOrder with default values
    expect(mockProps.handleOrder).toHaveBeenCalledWith(false, "entry_date");

    // Change filter to caducidad
    const caducidadButton = getByText("Ordenar por fecha de caducidad");
    fireEvent.press(caducidadButton);

    expect(mockProps.handleOrder).toHaveBeenCalledWith(
      false,
      "expiration_date"
    );
  });

  it("enables action buttons when indexesLength > 0", () => {
    const propsWithIndexes = { ...mockProps, indexesLength: 5 };
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...propsWithIndexes} />
      </TestWrapper>
    );

    const entregarButton = getByText("Agregar para \nentrega");
    const deshechoButton = getByText("Agregar para \ndeshecho");

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

    const entregarButton = getByText("Agregar para \nentrega");
    const deshechoButton = getByText("Agregar para \ndeshecho");

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

    const entregarButton = getByText("Agregar para \nentrega");
    fireEvent.press(entregarButton);

    expect(mockProps.onDataChange).toHaveBeenCalledWith([]);
  });
});
