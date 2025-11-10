import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Platform,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
  AntDesign,
  Feather,
} from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import styles from "./styles";

import {
  DrawerContentComponentProps,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { navigate } from "@/functions/NavigationService";
import { logOut, retrieveData } from "@/api/apiCalls";
import ThemeSelector from "../ThemeSelector/ThemeSelector";
import { useFetchUser } from "@/hooks/useFetchUser";

export default function SideBar({ navigation }: DrawerContentComponentProps) {
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const { width, height } = Dimensions.get("window");
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const isDrawerOpen = useDrawerStatus() === "open";
  const fechaActual = new Date();
  const dia = fechaActual.getDate();
  const meses = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];
  const mes = meses[fechaActual.getMonth()];
  const año = fechaActual.getFullYear();

  const themeColorsTailwind = {
    backgroundTailwind: isDark ? "bg-gray-900" : "bg-gray-50",
    textTailwind: isDark ? "text-gray-300" : "text-gray-900",
  };

  const { user, userImage, loading, setLoading } = useFetchUser();
  const showLogoutAlert = () => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "¿Estás seguro de que deseas cerrar sesión?"
      );
      if (confirmed) {
        loggingOut();
      }
    } else {
      Alert.alert(
        "Confirmar Logout",
        "¿Estás seguro de que deseas cerrar sesión?",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancel pressed"),
            style: "cancel",
          },
          {
            text: "OK",
            onPress: () => loggingOut(),
          },
        ],
        { cancelable: false }
      );
    }
  };

  const loggingOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <SafeAreaView
      className={"flex-1 w-full h-full border-gray-400 border-r"}
      style={sideBarBackground(isDark)}
    >
      <View className={"flex-1 h-full pb-3"}>
        <TouchableOpacity
          className="justify-center items-end p-4"
          style={{
            position: "absolute",
            top: height * 0.03,
            right: -(width * 0.045),
            width: width * 0.12,
            height: width * 0.05,
            backgroundColor: "#e1a244",
            borderRadius: 25,
            elevation: 5,
          }}
          onPress={() =>
            isDrawerOpen ? navigation.closeDrawer() : navigation.openDrawer()
          }
        >
          <AntDesign
            name={isDrawerOpen ? "menu-unfold" : "menu-fold"}
            size={28}
            color={isDark ? "#1a1a1a" : "#ece7dc"}
          />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} bounces={false}>
          <View
            className={
              "flex-1 w-full h-full " +
              (isIOS ? "" : " border-gray-400 border-r")
            }
            style={sideBarBackground(isDark)}
          >
            <View className="py-2 flex-row items-center justify-evenly">
              <Text className="text-center text-gray-600">
                {`Fecha: ${dia}-${mes}-${año}`}{" "}
              </Text>
            </View>
            <View className=" items-center justify-center border-b border-t border-gray-300 px-3">
              <Image
                className="w-full h-24 m-3"
                source={{
                  uri: "https://bamx.org.mx/wp-content/uploads/2023/10/RED-BAMX.png",
                }}
                resizeMode="contain"
              />
            </View>

            <View className="flex-col items-start justify-center  p-4">
              <TouchableOpacity
                className="pl-4 py-2 flex-row items-center"
                onPress={() => navigate("Inicio")}
              >
                <Ionicons name="home" size={30} color="#e1a244" />
                <Text
                  className={"ml-2 font-extrabold text-lg"}
                  style={styles.menuText}
                >
                  Inicio
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="pl-4 py-2 flex-row items-center"
                onPress={() => navigate("Inventario")}
              >
                <FontAwesome6 name="cube" size={30} color="#e1a244" />
                <Text
                  className={"ml-2 font-extrabold text-lg"}
                  style={styles.menuText}
                >
                  Inventario
                </Text>
              </TouchableOpacity>

              <TouchableOpacity className="pl-4 py-2 flex-row items-center">
                <MaterialCommunityIcons
                  name="clipboard-edit-outline"
                  size={30}
                  color="#e1a244"
                />
                <Text
                  className={"ml-2 font-extrabold text-lg"}
                  style={styles.menuText}
                >
                  Registro
                </Text>
              </TouchableOpacity>
            </View>
            <View className="flex-col items-center justify-center border-b border-t border-gray-300 m-2">
              <TouchableOpacity
                className="flex-row items-center justify-center m-4 rounded-2xl"
                style={button(true, width, height)}
              >
                <View className="flex-row items-center p-6">
                  <FontAwesome6
                    name="cart-plus"
                    size={30}
                    color={isDark ? "#1a1a1a" : "#ece7dc"}
                  />
                  <Text
                    className="ml-2 font-extrabold text-lg text-center"
                    style={cartText(isDark)}
                  >
                    Productos{"\n"}entregables
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center justify-center m-4 rounded-2xl"
                style={button(false, width, height)}
              >
                <View className="flex-row items-center p-6">
                  <FontAwesome6
                    name="cart-arrow-down"
                    size={30}
                    color={isDark ? "#1a1a1a" : "#ece7dc"}
                  />
                  <Text
                    className="ml-2 font-extrabold text-lg text-center"
                    style={cartText(isDark)}
                  >
                    Productos no{"\n"}aptos
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <ThemeSelector />
            <View
              className={
                "flex-row items-center justify-evenly px-5 pt-10 " +
                (!isWeb ? "absolute w-full bottom-0" : "")
              }
            >
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => navigate("Usuario")}
              >
                {userImage && (
                  <>
                    <Image
                      source={{
                        // blob de the image in base64 or URL
                        uri: userImage,
                      }}
                      onLoad={() => setLoading(false)}
                      style={{ width: 50, height: 50, borderRadius: 20 }}
                    />
                    {loading && (
                      <View testID="loading-indicator">
                        <ActivityIndicator
                          size="small"
                          style={{ borderRadius: 20 }}
                        />
                      </View>
                    )}
                  </>
                )}

                <Text
                  className={`${themeColorsTailwind.textTailwind} ml-2 text-lg`}
                >
                  {user?.name || "Usuario"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center"
                onPress={showLogoutAlert}
              >
                <Ionicons name="log-out-outline" size={40} color="#e1a244" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const sideBarBackground = (isDark: boolean) => ({
  backgroundColor: isDark ? "#100e09" : "#fff", //"#ece7dc",
});

const cartText = (isDark: boolean) => ({
  color: isDark ? "#1a1a1a" : "#ece7dc",
  fontFamily: "SF-Pro-Semibold",
  fontSize: Dimensions.get("window").width * 0.013,
});

const button = (good: boolean, width: number, height: number) => ({
  backgroundColor: good ? "#78af6d" : "#d65f61",
  width: width * 0.15,
  height: height * 0.15,
  padding: 1,
  borderRadius: 10,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 5 },
  shadowOpacity: 0.3,
  shadowRadius: 10,
  elevation: 10,
});
