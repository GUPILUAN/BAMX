import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "@/store";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import useUserSettings from "@/hooks/useUserSettings";
import { useFonts } from "expo-font";

import "@/global.css";

export function RootLayout() {
  const { settings } = useUserSettings();

  const [fontsLoaded] = useFonts({
    "SF-Compact-Bold": require("../assets/fonts/SF-Compact-Display-Bold.otf"),
    "SF-Compact-Heavy": require("../assets/fonts/SF-Compact-Display-Heavy.otf"),
    "SF-Compact-Light": require("../assets/fonts/SF-Compact-Display-Light.otf"),
    "SF-Compact-Medium": require("../assets/fonts/SF-Compact-Display-Medium.otf"),
    "SF-Compact-Regular": require("../assets/fonts/SF-Compact-Display-Regular.otf"),
    "SF-Compact-Semibold": require("../assets/fonts/SF-Compact-Display-Semibold.otf"),
    "SF-Compact-Thin": require("../assets/fonts/SF-Compact-Display-Thin.otf"),
    "SF-Pro-Bold": require("../assets/fonts/SF-Pro-Rounded-Bold.otf"),
    "SF-Pro-Heavy": require("../assets/fonts/SF-Pro-Rounded-Heavy.otf"),
    "SF-Pro-Light": require("../assets/fonts/SF-Pro-Rounded-Light.otf"),
    "SF-Pro-Medium": require("../assets/fonts/SF-Pro-Rounded-Medium.otf"),
    "SF-Pro-Regular": require("../assets/fonts/SF-Pro-Rounded-Regular.otf"),
    "SF-Pro-Semibold": require("../assets/fonts/SF-Pro-Rounded-Semibold.otf"),
    "SF-Pro-Thin": require("../assets/fonts/SF-Pro-Rounded-Thin.otf"),
  });

  if (!fontsLoaded || !settings) {
    return null;
  }

  const statusBarStyle: { [key: string]: "light" | "dark" | "auto" } = {
    auto: "auto",
    light: "dark",
    dark: "light",
  };

  return (
    <SafeAreaProvider>
      <StatusBar style={statusBarStyle[settings.theme]} />
      <Stack
        screenOptions={{
          animation: "fade",
          headerShown: false,
          gestureEnabled: false,
          contentStyle: {
            flex: 1,
          },
        }}
        initialRouteName="index"
      >
        <Stack.Screen
          name="details"
          options={{
            presentation: "modal",
            animation: "fade",
          }}
        />
      </Stack>
    </SafeAreaProvider>
  );
}

export default () => (
  <Provider store={store}>
    <RootLayout />
  </Provider>
);
