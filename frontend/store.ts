import { configureStore } from "@reduxjs/toolkit";
import themeSlice from "@/slices/themeSlice";
import settingsSlice from "@/slices/settingsSlice";
import userSlice from "@/slices/userSlice";

export const store = configureStore({
  reducer: {
    theme: themeSlice,
    settings: settingsSlice,
    user: userSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
