import { View, Text, Image, TouchableOpacity, ScrollView } from "react-native";
import { useSelector } from "react-redux";
import { SafeAreaView } from "react-native-safe-area-context";
import { selectUser } from "@/slices/userSlice";
import useUserColorScheme from "@/hooks/useUserColorScheme";
import { User } from "@/types/User";
import { themeColors } from "@/theme";

export default function ProfileScreen() {
  const user: User | undefined = useSelector(selectUser);
  const { isDark } = useUserColorScheme();

  if (!user) {
    return (
      <SafeAreaView
        style={{ backgroundColor: themeColors.background(isDark) }}
        className="flex-1 justify-center items-center"
      >
        <Text style={{ color: themeColors.text(isDark) }}>
          Loading user data...
        </Text>
      </SafeAreaView>
    );
  }
  const status: { [key: number]: string } = {
    0: "✅ Activo",
    1: "❌ Inactivo",
  };
  return (
    <SafeAreaView
      style={{ backgroundColor: themeColors.background(isDark) }}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header con foto */}
        <View
          className="items-center mb-6 p-6 rounded-2xl"
          style={{ backgroundColor: themeColors.headerBackground(isDark) }}
        >
          {user.profile_picture ? (
            <Image
              source={{
                uri: user?.profile_picture
                  ? `data:image/jpeg;base64,${user.profile_picture}`
                  : "https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-High-Quality-Image.png",
              }}
              className="w-32 h-32 rounded-full border-4 border-white"
            />
          ) : (
            <View className="w-32 h-32 rounded-full bg-blue-500 items-center justify-center">
              <Text className="text-white text-4xl font-bold">
                {user.username?.[0] ?? "?"}
              </Text>
            </View>
          )}
          <Text
            className="mt-4 text-2xl font-bold"
            style={{ color: themeColors.headerText(isDark) }}
          >
            {user.name ?? user.username}
          </Text>
          <Text
            className="text-sm"
            style={{ color: themeColors.text(isDark), opacity: 0.8 }}
          >
            {user.position ?? "No position"} ·{" "}
            {user.department ?? "No department"}
          </Text>
        </View>

        {/* Información */}
        <View
          className="rounded-2xl p-4 shadow mb-4"
          style={{ backgroundColor: themeColors.secondary(isDark) }}
        >
          <Text
            className="text-lg font-semibold mb-2"
            style={{ color: themeColors.text(isDark) }}
          >
            Contact Information
          </Text>
          <Text style={{ color: themeColors.text(isDark), opacity: 0.8 }}>
            E-mail: {user.email ?? "No disponible"} 📧
          </Text>
          <Text style={{ color: themeColors.text(isDark), opacity: 0.8 }}>
            Teléfono: {user.phone ?? "No disponible"} 📱
          </Text>
        </View>

        <View
          className="rounded-2xl p-4 shadow mb-4"
          style={{ backgroundColor: themeColors.secondary(isDark) }}
        >
          <Text
            className="text-lg font-semibold mb-2"
            style={{ color: themeColors.text(isDark) }}
          >
            Empresa & Rol
          </Text>
          <Text style={{ color: themeColors.text(isDark), opacity: 0.8 }}>
            Empresa {user.company ?? "No disponible"}
          </Text>
          <Text style={{ color: themeColors.text(isDark), opacity: 0.8 }}>
            Rol: {user.role ?? "No disponible"}
          </Text>
          <Text style={{ color: themeColors.text(isDark), opacity: 0.8 }}>
            Estado: {status[user.status ?? 1]}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
