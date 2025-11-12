import { InventoryItem } from "@/types/InventoryItem";
import { useEffect, useState } from "react";
const useSemaforoStats = (productos: InventoryItem[]) => {
  const [productsFiltered, setProductsFiltered] = useState<{
    crítico: InventoryItem[];
    prioritario: InventoryItem[];
    estable: InventoryItem[];
  }>({
    crítico: [],
    prioritario: [],
    estable: [],
  });

  useEffect(() => {
    const críticos: InventoryItem[] = productos.filter(
      (producto) => producto.status === "critical"
    );
    const prioritarios: InventoryItem[] = productos.filter(
      (producto) => producto.status === "warning"
    );
    const estables: InventoryItem[] = productos.filter(
      (producto) => producto.status === "good"
    );
    setProductsFiltered({
      crítico: críticos,
      prioritario: prioritarios,
      estable: estables,
    });
  }, [productos]);

  const status: {
    title: string;
    category: "crítico" | "prioritario" | "estable";
  }[] = [
    { title: "Lotes en estado crítico", category: "crítico" },
    { title: "Lotes en estado prioritario", category: "prioritario" },
    { title: "Lotes en estado estable", category: "estable" },
  ];

  function lerp(a: number, b: number, t: number) {
    return a + t * (b - a);
  }

  const getColor = (state: string) => {
    if (state === "crítico") {
      return "#FF4D4F";
    } else if (state === "prioritario") {
      return "#FFC107";
    } else {
      return "#52C41A";
    }
  };

  const critic = productsFiltered["crítico"]
    .map((p) => p.available_quantity)
    .reduce((a, b) => a + b, 0);
  const warning = productsFiltered["prioritario"]
    .map((p) => p.available_quantity)
    .reduce((a, b) => a + b, 0);
  const stable = productsFiltered["estable"]
    .map((p) => p.available_quantity)
    .reduce((a, b) => a + b, 0);

  const findLocation = (
    x: number,
    y: number,
    z: number
  ): [number, number, ...number[]] => {
    const total = x + y + z;
    const locCritic = x / total;
    const locStable = locCritic + y / total;
    const locWarning = lerp(locCritic, locStable, 0.5);
    // Ensure the return type is a tuple with at least two elements
    const location: [number, number, ...number[]] = [
      0,
      locCritic,
      locWarning,
      locStable,
      1,
    ];
    return location;
  };

  const locations = findLocation(critic, warning, stable);
  return {
    productsFiltered,
    status,
    getColor,
    critic,
    warning,
    stable,
    locations,
  };
};

export default useSemaforoStats;
