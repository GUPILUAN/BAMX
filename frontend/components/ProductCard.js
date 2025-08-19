import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import React, { useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTheme } from "../slices/themeSlice";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ProductCard({ item }) {
  const navigation = useNavigation();
  const theme = useSelector(selectTheme);
  const isDarkMode = theme === "dark";

  const bgColor = isDarkMode ? "bg-gray-800" : " bg-white";
  const textColor = !isDarkMode ? "text-white" : "text-gray-700";

  const [imageUri, setImageUri] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const imageUrl = item.image
        ? item.image
        : "https://upload.wikimedia.org/wikipedia/commons/a/a3/Image-not-found.png";
      setImageUri(imageUrl);
    } catch (error) {
      console.error("Error al cargar la imagen", error);
    } finally {
      setLoading(false);
    }

    return () => {
      if (imageUri) {
        URL.revokeObjectURL(imageUri);
      }
    };
  }, [item.image]);

  if (loading) {
    return (
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.3,
          shadowRadius: 7,
        }}
        className={
          "mr-8 rounded-3xl shadow-lg w-48 h-48 items-center justify-center " +
          bgColor
        }
      >
        <ActivityIndicator size="large" />
      </View>
    );
  }
  return (
    <View
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 7,
      }}
      className={"mr-8 rounded-3xl shadow-lg w-48 h-48 " + bgColor}
    >
      {item != null ? (
        <>
          {loading ? (
            () => <ActivityIndicator />
          ) : (
            <Image
              className="rounded-t-3xl w-full h-1/2"
              source={{
                uri: imageUri,
              }}
              resizeMode="cover"
            />
          )}
          <View className="flex-1 justify-center border-t border-gray-300">
            <View className="flex-row  justify-evenly items-center rounded-b-3xl">
              <Text
                className={
                  "w-1/2  font-semibold  " +
                  (!isDarkMode ? "text-black" : "text-white")
                }
              >
                {item.name}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("Details", { item })}
              >
                <Ionicons
                  name="information-circle-outline"
                  color="#f2a840"
                  size={30}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View className="flex-row w-full items-center justify-center ">
            <TouchableOpacity
              onPress={
                () => {}
                /*() => navigation.navigate("Product", { ...item })*/
              }
              className={"rounded-bl-3xl  w-1/2 h-8 justify-center shadow-sm"}
              style={styles.button(true)}
            >
              <Text style={styles.cartText(isDarkMode)}>Entregar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={
                () => {}
                /*() => navigation.navigate("Product", { ...item })*/
              }
              className={"rounded-br-3xl w-1/2 h-8 justify-center shadow-sm"}
              style={styles.button(false)}
            >
              <Text style={styles.cartText(isDarkMode)}>Desechar</Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  button: (good) => ({
    backgroundColor: good ? "#78af6d" : "#d65f61",
    shadowColor: "#000",
    elevation: 10,
  }),
  cartText: (isDark) => ({
    color: isDark ? "#1a1a1a" : "#fbfbfb",
    fontFamily: "SF-Pro-Semibold",
    fontSize: Dimensions.get("window").width * 0.013,
    textAlign: "center",
  }),
});

/*Propuesta:
 <View className="flex-row w-full items-center justify-center ">
            <TouchableOpacity
              onPress={
                () => {}
               
              }
              className={"rounded-bl-3xl  w-1/2 h-8 justify-center border-2"}
              style={styles.button(isDarkMode, true)}
            >
              <Text style={styles.cartText(true)}>Entregar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={
                () => {}
            
              }
              className={"rounded-br-3xl w-1/2 h-8 justify-center border-2"}
              style={styles.button(isDarkMode, false)}
            >
              <Text style={styles.cartText(false)}>Desechar</Text>
            </TouchableOpacity>
          </View>


const styles = StyleSheet.create({
  button: (isDark, good) => ({
    backgroundColor: isDark ? "#1a1a1a" : "#fbfbfb",
    shadowColor: "#000",
    elevation: 10,
    borderColor: good ? "#78af6d" : "#d65f61",
  }),
  cartText: (good) => ({
    color: good ? "#78af6d" : "#d65f61",
    fontFamily: "SF-Pro-Semibold",
    fontSize: Dimensions.get("window").width * 0.013,
    textAlign: "center",
  }),
});


*/
