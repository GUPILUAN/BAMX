import { configureStore } from "@reduxjs/toolkit";
import themeSclice from "./slices/themeSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    theme: themeSclice,
    settings: settingsSlice,
  },
});
