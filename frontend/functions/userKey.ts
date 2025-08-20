import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Funciones para guardar, recuperar o eliminar cookies o tokens dependiendo el dispositivo

export const saveData = async (key: string, value: string) => {
  if (Platform.OS === "web") {
    console.log("oa");
    localStorage.setItem(key, value);
  } else {
    await SecureStore.setItemAsync(key, value);
  }
};

export const getData = async (key: string) => {
  if (Platform.OS === "web") {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

export const deleteData = async (key: string) => {
  if (Platform.OS === "web") {
    localStorage.removeItem(key);
  } else {
    await SecureStore.deleteItemAsync(key);
  }
};
