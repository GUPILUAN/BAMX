import React from "react";
import { ScrollView, View } from "react-native";
import { contenedoresDummy } from "../constants/Stores";
import Contenedor from "./Contenedor";

export default function Refrigeradores() {
  const contenedores = contenedoresDummy.results;

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
