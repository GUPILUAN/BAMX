import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "./slices/themeSlice";
import settingsSlice from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    theme: themeSlice,
    settings: settingsSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
