import React from "react";
import { ScrollView } from "react-native";
import { contenedoresDummy } from "@/constants/Stores";
import Contenedor from "../Contenedor/Contenedor";
import { useTemperatureSensors } from "@/hooks/useTemperatureSensors";

export default function Refrigeradores() {
  const { latestBySensor } = useTemperatureSensors();
  const contenedores = contenedoresDummy.results.map((item) => ({
    ...item,
    temperature: latestBySensor[item.id]?.temperature ?? item.temperature,
  }));

  return (
    <ScrollView
      bounces={true}
      className="h-dvh"
      style={{ flex: 1, marginBottom: "auto" }}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {contenedores.map((contenedor, index) => (
        <Contenedor key={index} contenedor={contenedor} />
      ))}
    </ScrollView>
  );
}
