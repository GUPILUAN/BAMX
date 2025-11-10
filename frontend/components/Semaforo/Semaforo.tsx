import { View, Text, ScrollView } from "react-native";
import React, { useEffect, useState } from "react";
import { LinearGradient } from "expo-linear-gradient";
import FeaturedRow from "../FeaturedRow/FeaturedRow";
import { InventoryItem } from "@/types/InventoryItem";
import styles from "./styles";
import useSemaforoStats from "@/hooks/useSemaforoStats";

export default function Semaforo({
  productos,
}: {
  productos: InventoryItem[];
}) {
  const {
    productsFiltered,
    status,
    getColor,
    critic,
    warning,
    stable,
    locations,
  } = useSemaforoStats(productos);

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
      <View className="flex-auto mb-24 pt-4">
        <ScrollView
          bounces={true}
          nestedScrollEnabled={true}
          horizontal={false}
        >
          {status.map((s, index) => {
            return (
              <FeaturedRow
                key={index}
                status={s}
                productos={productsFiltered[s.category]}
              />
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
