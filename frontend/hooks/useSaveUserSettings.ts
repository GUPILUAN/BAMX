import { useEffect } from "react";
import { saveSettings, selectSettings } from "@/slices/settingsSlice";
import { useDispatch, useSelector } from "react-redux";

import AsyncStorage from "@react-native-async-storage/async-storage";
import useUserColorSchema from "./useUserColorScheme";

const useSaveUserSettings = () => {
  const settings = useSelector(selectSettings);
  const isAutoTheme = settings.theme === "auto";
  const { theme } = useUserColorSchema();
  const dispatch = useDispatch();

  const steps: { [key: string]: "light" | "dark" | "auto" } = {
    auto: "light",
    light: "dark",
    dark: "auto",
  };

  const toggleSchema = () => {
    const newTheme = steps[settings.theme];
    const newSetting = {
      theme: newTheme,
    };

    dispatch(saveSettings(newSetting));
  };

  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("userSettings");
        if (savedSettings !== null) {
          const parsedSettings = JSON.parse(savedSettings);
          dispatch(saveSettings(parsedSettings));
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };
    loadStoredSettings();
  }, [dispatch]);

  useEffect(() => {
    const saveSettings = async (newSettings: any) => {
      try {
        if (newSettings) {
          await AsyncStorage.setItem("userSettings", newSettings);
        }
      } catch (e) {
        console.error("Error saving settings:", e);
      }
    };
    saveSettings(JSON.stringify(settings));
  }, [settings]);

  return { isAutoTheme, toggleSchema };
};
export default useSaveUserSettings;
