import React from "react";
import { View, ActivityIndicator } from "react-native";
import useCheckLoginStatus from "@/hooks/useCheckLoginStatus";

export default function AuthLoadingScreen() {
  useCheckLoginStatus();

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
    </View>
  );
}
