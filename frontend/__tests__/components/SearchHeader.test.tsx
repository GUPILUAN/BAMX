import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import SearchHeader from "@/components/SearchHeader/SearchHeader";
import themeReducer from "@/slices/themeSlice";

const mockNavigate = jest.fn();
jest.mock("@react-navigation/native", () => ({
  ...jest.requireActual("@react-navigation/native"),
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

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
    const lineaButton = getByText("Línea de producto");

    fireEvent.press(lineaButton);

    expect(mockProps.handleSort).toHaveBeenCalledWith("linProd");
  });

  it("toggles order direction when sort button is pressed", () => {
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );
    const orderText = getByText("Descendente");
    expect(orderText).toBeTruthy();

    fireEvent.press(orderText);

    expect(mockProps.handleOrder).toHaveBeenCalledWith("asc");
  });

  it("shows 'Ascendente' label when sortDirection is asc", () => {
    const propsAsc = { ...mockProps, sortDirection: "asc" as const };
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader {...propsAsc} />
      </TestWrapper>
    );

    expect(getByText("Ascendente")).toBeTruthy();
  });

  it("applies dark theme styles correctly", () => {
    const { getByText } = render(
      <TestWrapper theme="dark">
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    expect(getByText("Descendente")).toBeTruthy();
  });

  it("applies light theme styles correctly", () => {
    const { getByText } = render(
      <TestWrapper theme="light">
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    expect(getByText("Descendente")).toBeTruthy();
  });

  it("renders 'Solo con existencia' toggle when setOnlyWithStock is provided", () => {
    const setOnlyWithStock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader
          {...mockProps}
          onlyWithStock={true}
          setOnlyWithStock={setOnlyWithStock}
        />
      </TestWrapper>
    );

    expect(getByText("Solo productos con existencia")).toBeTruthy();
  });

  it("does not render the toggle when setOnlyWithStock is not provided", () => {
    const { queryByText } = render(
      <TestWrapper>
        <SearchHeader {...mockProps} />
      </TestWrapper>
    );

    expect(queryByText("Solo productos con existencia")).toBeNull();
  });

  it("calls setOnlyWithStock with the opposite value when the toggle is pressed", () => {
    const setOnlyWithStock = jest.fn();
    const { getByText } = render(
      <TestWrapper>
        <SearchHeader
          {...mockProps}
          onlyWithStock={true}
          setOnlyWithStock={setOnlyWithStock}
        />
      </TestWrapper>
    );

    fireEvent.press(getByText("Solo productos con existencia"));
    expect(setOnlyWithStock).toHaveBeenCalledWith(false);
  });
});
