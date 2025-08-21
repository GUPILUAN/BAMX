import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getData } from "../functions/userKey";

export default function AuthLoadingScreen({ navigation }: any) {
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getData("access");
      if (token) {
        navigation.navigate("DashBoard");
      } else {
        navigation.navigate("Auth");
      }
    };
    checkLoginStatus();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
