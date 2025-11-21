import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
  Image,
  ImageBackground,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { navigate } from "@/functions/NavigationService";
import useUserColorScheme from "@/hooks/useUserColorScheme";
import { apiService } from "@/api/apiService";

export default function AuthScreen() {
  const { width } = useWindowDimensions();
  const isTablet = width >= 768;
  const { isDark } = useUserColorScheme();

  const colors = {
    light: {
      background: "#E30613",
      card: "#fff",
      border: "#ccc",
      text: "#333",
      placeholder: "#999",
      buttonText: "#fff",
    },
    dark: {
      background: "#121212",
      card: "#1e1e1e",
      border: "#444",
      text: "#f5f5f5",
      placeholder: "#888",
      buttonText: "#fff",
    },
    brand: {
      red: "#E30613",
      green: "#6FB544",
    },
  };

  const theme = isDark ? colors.dark : colors.light;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ username: string; password: string }>({
    username: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    let validationErrors = { username: "", password: "" };

    if (!username) validationErrors.username = "El username es requerido";
    if (!password) validationErrors.password = "La contraseña es requerida";

    if (validationErrors.username || validationErrors.password) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      await apiService.loginUser(username, password);
      navigate("Dashboard");
    } catch (error: any) {
      if (Platform.OS === "web") {
        const confirmed = window.confirm("Las credenciales son incorrectas");
        if (confirmed) {
          return;
        }
      } else {
        Alert.alert("Error", "Las credenciales son incorrectas");
      }

      setUsername("");
      setPassword("");
      setErrors({ username: "", password: "" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => Platform.OS !== "web" && Keyboard.dismiss()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ImageBackground
          source={require("@/assets/bg-bamx.jpeg")}
          style={{ flex: 1, width: "100%" }}
          resizeMode="cover"
        >
          {/* Overlay */}
          <View
            style={[
              StyleSheet.absoluteFillObject,
              {
                backgroundColor: isDark
                  ? "rgba(0,0,0,0.6)"
                  : "rgba(227,6,19,0.7)",
              },
            ]}
          />

          {/* Header con logo */}
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              alignItems: "center",
              paddingTop: 40,
            }}
          >
            <Image
              source={require("@/assets/logo.png")}
              style={{
                width: isTablet ? 160 : 120,
                height: isTablet ? 160 : 120,
                borderRadius: 50,
                resizeMode: "contain",
              }}
            />
            <Text
              style={{
                fontSize: isTablet ? 26 : 20,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 15,
              }}
            >
              ¡Bienvenido de nuevo!
            </Text>
          </View>

          {/* Card del formulario */}
          <View
            style={{
              flex: 2,
              backgroundColor: theme.card,
              borderTopLeftRadius: 40,
              borderTopRightRadius: 40,
              padding: isTablet ? 40 : 20,
              shadowColor: "#000",
              shadowOpacity: 0.15,
              shadowRadius: 8,
              elevation: 5,
            }}
          >
            {/* Username */}
            <TextInput
              placeholder="Username"
              placeholderTextColor={theme.placeholder}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              style={{
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                paddingVertical: 12,
                fontSize: isTablet ? 18 : 16,
                marginBottom: 25,
                color: theme.text,
              }}
            />
            {errors.username && (
              <Text style={{ color: "red", fontSize: 14 }}>
                {errors.username}
              </Text>
            )}

            {/* Password con botón de ver */}
            <View style={{ position: "relative", marginBottom: 30 }}>
              <TextInput
                placeholder="Password"
                placeholderTextColor={theme.placeholder}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={{
                  borderBottomWidth: 1,
                  borderBottomColor: theme.border,
                  paddingVertical: 12,
                  fontSize: isTablet ? 18 : 16,
                  color: theme.text,
                  paddingRight: 40,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: 0,
                  top: 8,
                  padding: 4,
                }}
              >
                <Ionicons
                  name={showPassword ? "eye-off" : "eye"}
                  size={22}
                  color={theme.placeholder}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={{ color: "red", fontSize: 14 }}>
                {errors.password}
              </Text>
            )}

            {/* Botón Login */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              style={{
                backgroundColor: colors.brand.red,
                padding: 15,
                borderRadius: 30,
                alignItems: "center",
                marginTop: 10,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? (
                <ActivityIndicator
                  size="small"
                  color={theme.buttonText}
                  testID="ActivityIndicator"
                />
              ) : (
                <Text
                  style={{
                    color: theme.buttonText,
                    fontWeight: "bold",
                    fontSize: isTablet ? 18 : 16,
                  }}
                >
                  INICIAR SESIÓN
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
