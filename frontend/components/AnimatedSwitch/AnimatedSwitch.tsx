import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import { LinearGradient } from "expo-linear-gradient";
import styles from "./styles";

type AnimatedSwitchProps = {
  onValueChange: (value: string) => void;
};

export default function AnimatedSwitch({ onValueChange }: AnimatedSwitchProps) {
  const [active, setActive] = useState("Semaforo");
  const [animatedValue] = useState(new Animated.Value(0));
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";

  const handlePress = (button: string) => {
    setActive(button);
    onValueChange(button);
    Animated.timing(animatedValue, {
      toValue: button === "Semaforo" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const interpolatedLeft = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "50%"],
  });

  return (
    <View className={"items-center justify-start "}>
      <View style={getSwitchContainerStyle(isDark)}>
        <Animated.View
          style={[styles.animatedBg, { left: interpolatedLeft }]}
        />

        <LinearGradient
          colors={["rgba(0, 0, 0, 0.15)", "transparent", "rgba(0, 0, 0, 0.15)"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 0, y: 0 }}
          style={styles.innerShadowVertical}
        />

        <LinearGradient
          colors={["rgba(0, 0, 0, 0.1)", "transparent", "rgba(0, 0, 0, 0.1)"]}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 0 }}
          style={styles.innerShadowHorizontal}
        />

        <TouchableOpacity
          style={[styles.button, active === "Semaforo" && styles.activeButton]}
          onPress={() => handlePress("Semaforo")}
        >
          <Text
            style={[
              styles.text,
              active === "Semaforo" ? styles.activeText : styles.inactiveText,
            ]}
          >
            Semáforo
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            active === "Refrigeradores" && styles.activeButton,
          ]}
          onPress={() => handlePress("Refrigeradores")}
        >
          <Text
            style={[
              styles.text,
              active === "Refrigeradores"
                ? styles.activeText
                : styles.inactiveText,
            ]}
          >
            Refrigeradores
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const getSwitchContainerStyle = (isDark: boolean) => ({
  flexDirection: "row" as "row",
  backgroundColor: isDark ? "#362e1d" : "#fff",
  borderRadius: 25,
  width: 400,
  height: 50,
  position: "relative" as "relative",
  overflow: "hidden" as "hidden",
});