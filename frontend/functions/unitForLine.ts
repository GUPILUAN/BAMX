// Mapea una línea de producto (CVE_LIN canónico, o como fallback la
// descripción humana DESC_LIN) a la unidad de medida más natural para esa
// categoría. Existe porque INVE.UNI_MED en BAMX está mal capturado ("pz"
// para todo el catálogo, incluso productos a granel). Cuando BAMX corrija
// UNI_MED en Aspel, podemos quitar este helper y leer el campo directo.

type LineKey = string;

const BY_CVE_LIN: Record<LineKey, string> = {
  // frutas y verduras a granel → kg
  FYV: "kg",
  F1N: "kg",
  F1P: "kg",
  F2P: "kg",
  V1N: "kg",

  // carnes y huevos → kg
  AOA: "kg",
  O1N: "kg",
  O1P: "kg",

  // cereales / granos / leguminosas / azúcar → kg
  CER: "kg",
  C1N: "kg",
  C1P: "kg",
  C2P: "kg",
  G2N: "kg",
  LEG: "kg",
  AZU: "kg",

  // lácteos / aceites → litros
  LECHE: "litros",
  L1P: "litros",
  L2P: "litros",
  AYG: "litros",

  // bebidas embotelladas
  E1P: "botellas",
  E2P: "botellas",

  // abarrotes (típicamente latas, conservas)
  A2P: "latas",
  A2N: "latas",

  // snacks
  B2P: "paquetes",

  // panadería
  P: "piezas",
  P1P: "piezas",

  // comida preparada
  T1P: "porciones",

  // genéricos / no comestibles
  ALL: "unidades",
  NP: "unidades",
  X2: "unidades",
};

const HEURISTICS: Array<{ match: RegExp; unit: string }> = [
  { match: /panad/, unit: "piezas" },
  { match: /prepar|comida prep/, unit: "porciones" },
  { match: /botana|golosin|snack/, unit: "paquetes" },
  { match: /bebida|embotell/, unit: "botellas" },
  { match: /l[áa]cteo|leche|yog/, unit: "litros" },
  { match: /aceite|grasa/, unit: "litros" },
  { match: /carne|huevo|origen animal/, unit: "kg" },
  { match: /fruta|verdura/, unit: "kg" },
  { match: /cereal|grano|legumin/, unit: "kg" },
  { match: /az[úu]car/, unit: "kg" },
  { match: /abarrote/, unit: "latas" },
  { match: /no\s*comest|no aliment/, unit: "unidades" },
];

export function unitForLine(args: {
  typeId?: string | null;
  type?: string | null;
}): string {
  const id = args.typeId?.trim().toUpperCase();
  if (id && BY_CVE_LIN[id]) return BY_CVE_LIN[id];

  const desc = args.type?.trim().toLowerCase();
  if (desc) {
    for (const { match, unit } of HEURISTICS) {
      if (match.test(desc)) return unit;
    }
  }

  return "unidades";
}
