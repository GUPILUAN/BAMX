import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";

interface SettingsState {
  settings: {
    theme: "light" | "dark" | "auto";
  };
}

const initialState: SettingsState = {
  settings: {
    theme: "auto",
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    saveSettings: (state, action) => {
      state.settings = action.payload;
    },
  },
});

export const { saveSettings } = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings.settings;

export default settingsSlice.reducer;
