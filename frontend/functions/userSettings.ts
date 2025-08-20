import AsyncStorage from "@react-native-async-storage/async-storage";
import { ColorSchemeName } from "react-native";

export const saveSettingsToStorage = async (
  settings: { theme: ColorSchemeName; isAutoTheme: boolean },
  colorScheme: string | null | undefined
) => {
  try {
    console.log(settings);
    const updatedSettings = {
      ...settings,
      isSwitchOn: colorScheme !== "dark",
    };
    const jsonSettings = JSON.stringify(updatedSettings);
    await AsyncStorage.setItem("userSettings", jsonSettings);
  } catch (error) {
    console.error("Error saving settings:", error);
  }
};
