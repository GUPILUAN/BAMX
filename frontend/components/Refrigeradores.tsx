import React from "react";
import { ScrollView, View } from "react-native";
import { contenedoresDummy } from "../constants/Stores";
import Contenedor from "./Contenedor";

export default function Refrigeradores() {
  const contenedores = contenedoresDummy.results;

  return (
    <View className="flex-1 justify-end items-center w-full">
      <View className="items-center justify-center pb-10 w-full border-b border-gray-300">
        <ScrollView bounces={false}>
          {contenedores.map((contenedor, index) => (
            <Contenedor key={index} contenedor={contenedor} />
          ))}
        </ScrollView>
      </View>
    </View>
  );
}
