import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import useSaveUserSettings from "@/hooks/useSaveUserSettings";
import useUserColorScheme from "@/hooks/useUserColorScheme";

const ThemeSelector = () => {
  const { isAutoTheme, toggleSchema } = useSaveUserSettings();
  const { isDark } = useUserColorScheme();

  // Determinar estado actual: "auto" | "dark" | "light"
  const mode = isAutoTheme ? "auto" : isDark ? "dark" : "light";

  // Configuración de estilos por estado
  const themeStyles: Record<
    "auto" | "dark" | "light",
    {
      label: string;
      bgClass: string;
      textColor: string;
      icon: keyof typeof Ionicons.glyphMap;
      iconColor: string;
    }
  > = {
    auto: {
      label: "Automático",
      bgClass: "bg-green-500",
      textColor: "text-white",
      icon: isDark ? "contrast" : "contrast-outline",
      iconColor: "white",
    },
    dark: {
      label: "Oscuro",
      bgClass: "bg-gray-800",
      textColor: "text-gray-100",
      icon: "moon",
      iconColor: "#60a5fa",
    },
    light: {
      label: "Claro",
      bgClass: "bg-sky-500",
      textColor: "text-gray-800",
      icon: "sunny",
      iconColor: "#facc15",
    },
  };

  const { label, bgClass, textColor, icon, iconColor } = themeStyles[mode];

  return (
    <View className="px-4 py-3 rounded-2xl space-y-4">
      <Text
        className="font-bold text-lg"
        style={{ color: isDark ? "white" : "black" }}
      >
        Tema
      </Text>

      <TouchableOpacity
        onPress={toggleSchema}
        activeOpacity={0.85}
        className={`rounded-xl px-4 py-3 flex-row shadow-md items-center justify-between ${bgClass}`}
      >
        <Text className={`font-semibold ${textColor}`}>{label}</Text>
        <Ionicons name={icon} size={22} color={iconColor} />
      </TouchableOpacity>
    </View>
  );
};

export default ThemeSelector;
