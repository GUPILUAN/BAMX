import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createDrawerNavigator } from "@react-navigation/drawer";
import AuthScreen from "./screens/AuthScreen";
import HomeScreen from "./screens/HomeScreen";
import InventoryScreen from "./screens/InventoryScreen";
import SideBar from "./components/SideBar";
import { useSelector } from "react-redux";
import { selectTheme } from "./slices/themeSlice";
import { themeColors } from "./theme";
import SettingsScreen from "./screens/SettingsScreen";
import { StatusBar } from "react-native";
import DetailsScreen from "./screens/DetailsScreen";
import AuthLoadingScreen from "./screens/AuthLoadingScreen";
import { navigationRef } from "./functions/NavigationService";

const Stack = createNativeStackNavigator();
const Drawer = createDrawerNavigator();

function DrawerNavigator() {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          width: 240,
        },
        headerStyle: {
          backgroundColor: themeColors.headerBackground(isDark),
        },
        headerTintColor: themeColors.headerText(isDark),
        headerTitleStyle: {
          fontWeight: "bold",
        },
        cardStyle: {
          flex: 1,
        },
      }}
      initialRouteName="Inicio"
      drawerContent={() => <SideBar />}
    >
      <Drawer.Screen name="Inicio" component={HomeScreen} />
      <Drawer.Screen name="Inventario" component={InventoryScreen} />
      <Drawer.Screen name="Configuracion" component={SettingsScreen} />
    </Drawer.Navigator>
  );
}

export default function Navigation() {
  return (
    <NavigationContainer ref={navigationRef}>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="AuthLoading"
        screenOptions={{
          animationEnabled: true,
          headerShown: false,
        }}
        options={{
          animationTypeForReplace: "pop",
          cardStyle: {
            flex: 1,
          },
        }}
      >
        <Stack.Screen name="AuthLoading" component={AuthLoadingScreen} />
        <Stack.Screen
          name="Auth"
          component={AuthScreen}
          options={{ animation: "fade" }}
        />
        <Stack.Screen
          name="DashBoard"
          component={DrawerNavigator}
          options={{ gestureEnabled: false }}
        />
        <Stack.Screen
          name="Details"
          options={{ presentation: "modal", animation: "fade" }}
          component={DetailsScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
