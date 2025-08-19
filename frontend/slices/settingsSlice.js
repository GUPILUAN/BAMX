import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  settings: {
    theme: "auto",
  },
};

const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {
    loadSettings: (state, action) => {
      state.settings = action.payload;
    },
  },
});

export const { loadSettings } = settingsSlice.actions;
export const selectSettings = (state) => state.settings.settings;
export default settingsSlice.reducer;
