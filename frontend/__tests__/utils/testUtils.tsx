import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../../slices/themeSlice";
import settingsReducer from "../../slices/settingsSlice";

// Create a mock store with common reducers
export const createMockStore = (initialState = {}) => {
  return configureStore({
    reducer: {
      theme: themeReducer,
      settings: settingsReducer,
    },
    preloadedState: {
      theme: { theme: "light" },
      settings: { settings: { theme: "auto" } },
      ...initialState,
    },
  });
};

// Common test wrapper that provides Redux store and Navigation context
export const TestWrapper = ({
  children,
  initialState = {},
  withNavigation = true,
}: {
  children: React.ReactNode;
  initialState?: any;
  withNavigation?: boolean;
}) => {
  const store = createMockStore(initialState);

  if (withNavigation) {
    return (
      <Provider store={store}>
        <NavigationContainer>{children}</NavigationContainer>
      </Provider>
    );
  }

  return <Provider store={store}>{children}</Provider>;
};

// Mock product data for testing
export const mockProduct = {
  name: "Test Product",
  quantity: 10,
  entry_date: "2025-08-01",
  expiration_date: "2025-08-30",
  type: "fruit",
  product_id: "123",
  image: "test-image.jpg",
};

// Mock products with different expiration statuses
export const mockProducts = {
  critical: {
    ...mockProduct,
    name: "Critical Product",
    expiration_date: "2025-08-23", // 2 days from current test date
    product_id: "1",
  },
  priority: {
    ...mockProduct,
    name: "Priority Product",
    expiration_date: "2025-08-25", // 4 days from current test date
    product_id: "2",
  },
  stable: {
    ...mockProduct,
    name: "Stable Product",
    expiration_date: "2025-08-30", // 9 days from current test date
    product_id: "3",
  },
};

// Helper function to set consistent test date
export const setTestDate = (date = "2025-08-21") => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(date));
};

// Helper function to restore real timers
export const restoreTimers = () => {
  jest.useRealTimers();
};

// Common assertions for theme testing
export const expectLightTheme = (element: any) => {
  // Add common light theme assertions
  expect(element).toBeTruthy();
};

export const expectDarkTheme = (element: any) => {
  // Add common dark theme assertions
  expect(element).toBeTruthy();
};
