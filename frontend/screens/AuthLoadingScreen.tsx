import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { getData } from "../functions/userKey";
import { useRouter } from "expo-router";

export default function AuthLoadingScreen() {
  const router = useRouter();
  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await getData("access");
      if (token) {
       router.push("/inicio");
      } else {
        router.push("/auth");
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
