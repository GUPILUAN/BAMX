import { Animated } from "react-native";
const handlePress = (button: string, animatedValue: Animated.Value, setActive: (value: string) => void, onValueChange: (value: string) => void) => {
    setActive(button);
    onValueChange(button);
    Animated.timing(animatedValue, {
      toValue: button === "Semaforo" ? 0 : 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
};
export default handlePress;