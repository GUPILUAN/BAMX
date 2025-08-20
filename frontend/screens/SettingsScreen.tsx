import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import React, { useState, useEffect } from "react";
import { selectTheme } from "../slices/themeSlice";
import { loadSettings, selectSettings } from "../slices/settingsSlice";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { logOut } from "../api/apiCalls";
import { useNavigation } from "@react-navigation/native";

export default function SettingsScreen() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);
  const settings = useSelector(selectSettings);
  const [isAutoTheme, setIsAutoTheme] = useState(false);
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const dispatch = useDispatch();

  useEffect(() => {
    const loadStoredSettings = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem("userSettings");
        if (savedSettings !== null) {
          const parsedSettings = JSON.parse(savedSettings);
          dispatch(loadSettings(parsedSettings));
        }
      } catch (e) {
        console.error("Error loading settings:", e);
      }
    };

    loadStoredSettings();
  }, [dispatch]);

  useEffect(() => {
    if (settings.isAutoTheme) {
      setIsAutoTheme(settings.isAutoTheme);
    }
  }, [settings]);
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

  const toggleSwitch = () => {
    setIsSwitchOn((previousState) => !previousState);
    const newTheme = !isSwitchOn ? "light" : "dark";
    const newSetting = {
      isSwitchOn: !isSwitchOn,
      theme: newTheme,
      isAutoTheme: isAutoTheme,
    };
    if (theme !== newSetting.theme) {
      dispatch(loadSettings(newSetting));
    }
  };

  const setAuto = () => {
    setIsAutoTheme((previousState) => !previousState);
    const newTheme = isAutoTheme ? theme : "auto";
    const newSetting = {
      isSwitchOn: theme === "light",
      theme: newTheme,
      isAutoTheme: !isAutoTheme,
    };
    dispatch(loadSettings(newSetting));
  };

  useEffect(() => {
    setIsSwitchOn(theme === "light");
  }, [theme]);

  const themeColorsTailwind = {
    backgroundTailwind: isDark ? "bg-gray-900" : "bg-gray-50",
    textTailwind: isDark ? "text-gray-300" : "text-gray-900",
  };
  return (
    <SafeAreaView
      className={`${themeColorsTailwind.backgroundTailwind} flex-1`}
    >
      <View className="flex-1 justify-between p-4">
        <View className="flex-row justify-end space-x-4 items-center">
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isSwitchOn ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isSwitchOn}
            disabled={isAutoTheme}
          />
          <TouchableOpacity
            className={`rounded-full px-4 py-2 ${
              isAutoTheme
                ? isDark
                  ? "bg-gray-200"
                  : "bg-slate-600"
                : isDark
                  ? "bg-gray-600"
                  : "bg-slate-200"
            }`}
            onPress={setAuto}
          >
            <View className="flex-row items-center">
              <Text
                className={`mr-2 ${
                  isDark === isAutoTheme ? "text-black" : "text-white"
                }`}
              >
                Auto
              </Text>
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={24}
                color={isDark === isAutoTheme ? "black" : "white"}
              />
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-blue-500 rounded-full p-4 items-center "
          onPress={async () => await logOut()}
        >
          <Text className="text-white text-lg font-bold">Cerrar sesión</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
