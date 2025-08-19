import AsyncStorage from "@react-native-async-storage/async-storage";

export const saveSettingsToStorage = async (settings, colorScheme) => {
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
