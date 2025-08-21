// Date utility functions for testing
export const formatDate = (date: string) => {
  const fecha = new Date(date);
  const dia = String(fecha.getUTCDate()).padStart(2, "0");
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, "0");
  const año = fecha.getUTCFullYear();
  return `${dia}/${mes}/${año}`;
};

export const evaluateExpirationStatus = (expirationDate: string): string => {
  const today = new Date();
  const expDate = new Date(expirationDate);
  const timeDiff = expDate.getTime() - today.getTime();
  const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff <= 2) {
    return "crítico";
  } else if (daysDiff <= 5) {
    return "prioritario";
  } else {
    return "estable";
  }
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case "crítico":
      return "#FF4D4F";
    case "prioritario":
      return "#FFC107";
    case "estable":
      return "#52C41A";
    default:
      return "#000000";
  }
};

export const getUnitLabel = (productType: string): string => {
  const units: { [key: string]: string } = {
    fruit: "unidades",
    canned_food: "latas",
    bottle: "botellas",
    grain: "kilogramos",
    dairy: "litros",
    snack: "paquetes",
    jar: "frasco",
  };
  return units[productType] || "unidades";
};
