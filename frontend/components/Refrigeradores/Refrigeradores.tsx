import React, { useEffect, useState } from "react";
import { ScrollView } from "react-native";
import { contenedoresDummy } from "@/constants/Stores";
import Contenedor from "../Contenedor/Contenedor";
import { useTemperatureSensors } from "@/hooks/useTemperatureSensors";
import { Warehouse } from "@/types/Warehouse";
import { apiService } from "@/api/apiService";

export default function Refrigeradores() {
  const { latestBySensor } = useTemperatureSensors();

  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);

  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await apiService.retrieveData(
          "/api/almacenes/dashboard"
        );
        setWarehouses(response);
      } catch (error) {
        console.error("Error fetching warehouses:", error);
        setWarehouses(contenedoresDummy.results);
      }
    };
    fetchWarehouses();
  }, []);

  if (!warehouses || warehouses.length === 0) {
    return null; // or a loading indicator
  }

  const contenedores = warehouses.map((item) => ({
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
