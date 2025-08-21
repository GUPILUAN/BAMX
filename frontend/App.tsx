import Navigation from "./navigation";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store";
import { useEffect } from "react";
import { useColorScheme } from "react-native";
import { setTheme } from "./slices/themeSlice";
import { selectSettings } from "./slices/settingsSlice";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveSettingsToStorage } from "./functions/userSettings";
import { useFonts } from "expo-font";
import "./global.css";

const App = () => {
  const colorScheme = useColorScheme();
  const dispatch = useDispatch();

  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("userSettings");
        if (savedSettings === null) {
          saveSettingsToStorage(
            { theme: colorScheme, isAutoTheme: false },
            colorScheme
          );
        }
      } catch (e) {
        console.error("Failed to load settings:", e);
      }
    };
    loadStoredSettings();
  }, [colorScheme]);

  const settings = useSelector(selectSettings);
  useEffect(() => {
    if (settings.theme === "auto") {
      dispatch(setTheme(colorScheme));
    } else {
      dispatch(setTheme(settings.theme));
    }
  }, [settings, colorScheme, dispatch]);

  const [fontsLoaded] = useFonts({
    "SF-Compact-Bold": require("./assets/fonts/SF-Compact-Display-Bold.otf"),
    "SF-Compact-Heavy": require("./assets/fonts/SF-Compact-Display-Heavy.otf"),
    "SF-Compact-Light": require("./assets/fonts/SF-Compact-Display-Light.otf"),
    "SF-Compact-Medium": require("./assets/fonts/SF-Compact-Display-Medium.otf"),
    "SF-Compact-Regular": require("./assets/fonts/SF-Compact-Display-Regular.otf"),
    "SF-Compact-Semibold": require("./assets/fonts/SF-Compact-Display-Semibold.otf"),
    "SF-Compact-Thin": require("./assets/fonts/SF-Compact-Display-Thin.otf"),
    "SF-Pro-Bold": require("./assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "SF-Pro-Heavy": require("./assets/fonts/SF-Pro-Rounded-Heavy.otf"),
    "SF-Pro-Light": require("./assets/fonts/SF-Pro-Rounded-Light.otf"),
    "SF-Pro-Medium": require("./assets/fonts/SF-Pro-Rounded-Medium.otf"),
    "SF-Pro-Regular": require("./assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "SF-Pro-Semibold": require("./assets/fonts/SF-Pro-Rounded-Semibold.otf"),
    "SF-Pro-Thin": require("./assets/fonts/SF-Pro-Rounded-Thin.otf"),
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <>
      <Navigation />
    </>
  );
};

export default () => (
  <Provider store={store}>
    <App />
  </Provider>
);
