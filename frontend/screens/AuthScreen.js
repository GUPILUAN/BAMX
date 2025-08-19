import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Keyboard,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { loginUser } from "../functions/apiCalls";

export default function AuthScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleLogin = async () => {
    let validationErrors = {};
    if (!username) {
      validationErrors.username = "El username es requerido";
    }
    if (!password) {
      validationErrors.password = "La contraseña es requerida";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      setLoading(true);
      setErrors({});
      await loginUser(username, password);
      navigation.navigate("DashBoard");
    } catch (error) {
      Alert.alert("Error", "Las credenciales son incorrectas");
      setUsername("");
      setPassword("");
      setErrors({});
      console.error(error.response);
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
        <View className="flex-1 justify-center p-6 bg-white">
          {loading && <ActivityIndicator size="large" />}
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold mb-2">Iniciar Sesión</Text>
          </View>

          <View className="space-y-4">
            <TextInput
              placeholder="Username"
              placeholderTextColor="#A0A0A0"
              value={username}
              onChangeText={setUsername}
              className="h-12 border border-gray-300 px-4 rounded-full"
              autoCapitalize="none"
            />
            {errors.username && (
              <Text style={{ color: "red" }}>{errors.username}</Text>
            )}
            <TextInput
              placeholder="Password"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="h-12 border border-gray-300 px-4 rounded-full"
            />
            {errors.password && (
              <Text style={{ color: "red" }}>{errors.password}</Text>
            )}
            <Button
              title={loading ? "Cargando..." : "Iniciar sesión"}
              onPress={handleLogin}
              disabled={loading}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}
