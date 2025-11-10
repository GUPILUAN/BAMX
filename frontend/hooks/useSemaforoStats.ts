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
    const críticos: InventoryItem[] = [];
    const prioritarios: InventoryItem[] = [];
    const estables: InventoryItem[] = [];

    const evaluarFechaDelProducto = (producto: InventoryItem) => {
      if (!producto.expiration_date) {
        críticos.push(producto);
        return;
      }

      const hoy = new Date();
      const fecha = new Date(producto.expiration_date || "");

      const diferenciaTiempo = fecha.getTime() - hoy.getTime();

      const diferenciaDias = Math.ceil(
        diferenciaTiempo / (1000 * 60 * 60 * 24)
      );

      if (diferenciaDias <= 2) {
        críticos.push(producto);
      } else if (diferenciaDias <= 5) {
        prioritarios.push(producto);
      } else {
        estables.push(producto);
      }
    };
    productos?.forEach((producto) => {
      evaluarFechaDelProducto(producto);
    });
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
    { title: "Estado crítico", category: "crítico" },
    { title: "Estado prioritario", category: "prioritario" },
    { title: "Estado estable", category: "estable" },
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

  const critic = productsFiltered["crítico"].length;
  const warning = productsFiltered["prioritario"].length;
  const stable = productsFiltered["estable"].length;

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
