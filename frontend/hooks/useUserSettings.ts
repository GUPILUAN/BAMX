import { saveSettingsToStorage } from "@/functions/userSettings";
import { saveSettings, selectSettings } from "@/slices/settingsSlice";
import { setTheme } from "@/slices/themeSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { useDispatch, useSelector } from "react-redux";

export const useUserSettings = () => {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();
  const settings = useSelector(selectSettings);

  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("userSettings");
        if (savedSettings === null) {
          saveSettingsToStorage({ theme: colorScheme }, colorScheme);
        } else {
          dispatch(saveSettings(JSON.parse(savedSettings)));
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    loadStoredSettings();
  }, [colorScheme]);

  useEffect(() => {
    if (settings.theme === "auto") {
      dispatch(setTheme(colorScheme));
    } else {
      dispatch(setTheme(settings.theme));
    }
  }, [settings, colorScheme, dispatch]);

  return { settings };
};
