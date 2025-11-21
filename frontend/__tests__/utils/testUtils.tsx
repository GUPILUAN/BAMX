import React from "react";
import { Provider } from "react-redux";
import { NavigationContainer } from "@react-navigation/native";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../../slices/themeSlice";
import settingsReducer from "../../slices/settingsSlice";

// Create a mock store with common reducers
type RootState = {
  theme: ReturnType<typeof themeReducer>;
  settings: ReturnType<typeof settingsReducer>;
};

export const createMockStore = (initialState: Partial<RootState> = {}) => {
  return configureStore<RootState>({
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
