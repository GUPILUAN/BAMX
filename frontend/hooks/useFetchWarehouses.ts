import { retrieveData } from "@/api/apiCalls";
import { Warehouse } from "@/types/Warehouse";
import { useEffect, useState } from "react";
import useTemperatureSensors from "./useTemperatureSensors";
import { contenedoresDummy } from "@/constants/Stores";
const useFetchWarehouses = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const { latestBySensor } = useTemperatureSensors();

  useEffect(() => {
    const fetchWarehouses = async () => {
      const data = await retrieveData("/api/almacenes/");
      const warehouses: Warehouse[] =
        data?.warehouses || contenedoresDummy.results;
      setWarehouses(
        warehouses.map((item: Warehouse) => ({
          ...item,
          temperature: latestBySensor[item.id]?.temperature ?? 0,
        }))
      );
    };
    fetchWarehouses();
  }, []);

  const contenedores = warehouses.map((item) => ({
    ...item,
    temperature: latestBySensor[item.id]?.temperature ?? item.temperature,
  }));
  return contenedores;
};

export default useFetchWarehouses;
