import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import React from "react";
import { LinearGradient } from "expo-linear-gradient";
import FeaturedRow from "./FeaturedRow";
import { productosDummy } from "../constants/Products";

export default function Semaforo() {
  const critic = 1024;
  const warning = 2048;
  const stable = 4096;

  const status = [
    { title: "Estado crítico", category: "crítico" },
    { title: "Estado prioritario", category: "prioritario" },
    { title: "Estado estable", category: "estable" },
  ];

  function lerp(a, b, t) {
    return a + t * (b - a);
  }

  const productos = {
    crítico: [],
    prioritario: [],
    estable: [],
  };

  function evaluarFechaDelProducto(producto) {
    const hoy = new Date();
    const fecha = new Date(producto.expiration_date);

    const diferenciaTiempo = fecha - hoy;

    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 60 * 60 * 24));

    if (diferenciaDias <= 2) {
      productos.crítico.push(producto);
    } else if (diferenciaDias <= 5) {
      productos.prioritario.push(producto);
    } else {
      productos.estable.push(producto);
    }
  }

  const getColor = (state) => {
    if (state === "crítico") {
      return "#FF4D4F";
    } else if (state === "prioritario") {
      return "#FFC107";
    } else {
      return "#52C41A";
    }
  };

  productosDummy.results.forEach((p) => {
    evaluarFechaDelProducto(p);
  });

  const findLocation = (x, y, z) => {
    const total = x + y + z;
    const locCritic = x / total;
    const locStable = locCritic + y / total;
    const locWarning = lerp(locCritic, locStable, 0.5);
    const location = [0, locCritic, locWarning, locStable, 1];
    return location;
  };

  const locations = findLocation(critic, warning, stable);

  return (
    <View className="flex-1 justify-end items-center w-full">
      <View className="items-center justify-center pb-5 w-full">
        <View style={styles.statusContainer}>
          <View style={styles.statusBox}>
            <Text style={[styles.number, { color: getColor("crítico") }]}>
              {critic}
            </Text>
            <Text style={styles.description}>
              Productos se {"\n"} encuentran en{"\n"} estado CRITICO
            </Text>
          </View>
          <View style={styles.separatorV} />
          <View style={styles.statusBox}>
            <Text style={[styles.number, { color: getColor("prioritario") }]}>
              {warning}
            </Text>
            <Text style={styles.description}>
              Productos se {"\n"} encuentra en {"\n"} estado prioritario
            </Text>
          </View>
          <View style={styles.separatorV} />
          <View style={styles.statusBox}>
            <Text style={[styles.number, { color: getColor("estable") }]}>
              {stable}
            </Text>
            <Text style={styles.description}>
              Productos se {"\n"} encuentran en {"\n"} estado estable
            </Text>
          </View>
        </View>

        <View style={styles.gradientBarContainer}>
          <LinearGradient
            colors={["#FF4D4F", "#FF6D4F", "#FFC107", "#B2C107", "#52C41A"]}
            locations={locations}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBar}
          />
        </View>
      </View>
      <View className="flex-auto mb-12 pt-4">
        <ScrollView vertical bounces={false} nestedScrollEnabled={true}>
          {status.map((s, index) => {
            return (
              <FeaturedRow
                key={index}
                status={s}
                productos={productos[s.category]}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "90%",
    marginVertical: 10,
  },
  statusBox: {
    alignItems: "center",
    flex: "row",
  },
  number: {
    fontSize: Dimensions.get("window").width * 0.04,
    fontWeight: "bold",
  },
  description: {
    textAlign: "center",
    marginTop: 10,
    fontSize: Dimensions.get("window").width * 0.015,
    color: "#555",
  },
  separatorV: {
    width: 3,
    height: "100%",
    backgroundColor: "#D9D9D9",
  },

  gradientBarContainer: {
    width: "90%",
    height: 8,
    backgroundColor: "#FFF",
    borderRadius: 4,
    overflow: "hidden",
    marginTop: 20,
  },
  gradientBar: {
    width: "100%",
    height: "100%",
  },
});
