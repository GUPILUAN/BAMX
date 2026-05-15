import React from "react";
import { View, StyleProp, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type ImageDescriptor = {
  bgColor: string;
  icon: IconName;
};

const FALLBACK: ImageDescriptor = {
  bgColor: "#bdbdbd",
  icon: "image-off-outline",
};

const BY_CVE_LIN: Record<string, ImageDescriptor> = {
  FYV: { bgColor: "#e57373", icon: "food-apple" },
  F1N: { bgColor: "#e57373", icon: "food-apple" },
  F1P: { bgColor: "#e57373", icon: "food-apple" },
  F2P: { bgColor: "#e57373", icon: "food-apple" },
  V1N: { bgColor: "#81c784", icon: "carrot" },
  LECHE: { bgColor: "#90caf9", icon: "bottle-tonic" },
  L1P: { bgColor: "#90caf9", icon: "bottle-tonic" },
  L2P: { bgColor: "#90caf9", icon: "bottle-tonic" },
  A2P: { bgColor: "#a1887f", icon: "food-variant" },
  A2N: { bgColor: "#a1887f", icon: "food-variant" },
  AYG: { bgColor: "#4db6ac", icon: "bottle-soda-classic" },
  E1P: { bgColor: "#26a69a", icon: "bottle-soda-classic" },
  E2P: { bgColor: "#26a69a", icon: "bottle-soda-classic" },
  CER: { bgColor: "#dcb874", icon: "barley" },
  C1N: { bgColor: "#dcb874", icon: "barley" },
  C1P: { bgColor: "#dcb874", icon: "barley" },
  C2P: { bgColor: "#dcb874", icon: "barley" },
  G2N: { bgColor: "#dcb874", icon: "barley" },
  LEG: { bgColor: "#bcaaa4", icon: "peanut" },
  AZU: { bgColor: "#f8bbd0", icon: "cube-outline" },
  B2P: { bgColor: "#ffb74d", icon: "cookie" },
  AOA: { bgColor: "#ef9a9a", icon: "food-drumstick" },
  O1N: { bgColor: "#ef9a9a", icon: "food-drumstick" },
  O1P: { bgColor: "#ef9a9a", icon: "food-drumstick" },
  P: { bgColor: "#d7ccc8", icon: "bread-slice" },
  P1P: { bgColor: "#d7ccc8", icon: "bread-slice" },
  T1P: { bgColor: "#ffab91", icon: "silverware-fork-knife" },
  ALL: { bgColor: "#aed581", icon: "leaf" },
  NP: { bgColor: "#90a4ae", icon: "package-variant" },
  X2: { bgColor: "#90a4ae", icon: "package-variant" },
};

const HEURISTICS: Array<{ match: RegExp; descriptor: ImageDescriptor }> = [
  { match: /panad/, descriptor: BY_CVE_LIN.P1P },
  { match: /prepar|comida prep/, descriptor: BY_CVE_LIN.T1P },
  { match: /botana|golosin|snack/, descriptor: BY_CVE_LIN.B2P },
  { match: /carne|huevo|origen animal/, descriptor: BY_CVE_LIN.AOA },
  { match: /l[áa]cteo|leche|yog/, descriptor: BY_CVE_LIN.LECHE },
  { match: /bebida|embotell/, descriptor: BY_CVE_LIN.E2P },
  { match: /aceite|grasa/, descriptor: BY_CVE_LIN.AYG },
  { match: /verdura/, descriptor: BY_CVE_LIN.V1N },
  { match: /fruta/, descriptor: BY_CVE_LIN.FYV },
  { match: /cereal|grano/, descriptor: BY_CVE_LIN.CER },
  { match: /legumin/, descriptor: BY_CVE_LIN.LEG },
  { match: /az[úu]car/, descriptor: BY_CVE_LIN.AZU },
  { match: /alimentos libres/, descriptor: BY_CVE_LIN.ALL },
  { match: /no\s*comest|no comestible|no aliment/, descriptor: BY_CVE_LIN.NP },
  { match: /abarrote/, descriptor: BY_CVE_LIN.A2P },
];

export function resolveDefaultImage(args: {
  typeId?: string | null;
  type?: string | null;
}): ImageDescriptor {
  const id = args.typeId?.trim().toUpperCase();
  if (id && BY_CVE_LIN[id]) return BY_CVE_LIN[id];

  const desc = args.type?.trim().toLowerCase();
  if (desc) {
    for (const { match, descriptor } of HEURISTICS) {
      if (match.test(desc)) return descriptor;
    }
  }

  return FALLBACK;
}

type Props = {
  typeId?: string | null;
  type?: string | null;
  size?: number;
  className?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
};

export default function DefaultProductImage({
  typeId,
  type,
  size = 80,
  className,
  style,
  testID,
}: Props) {
  const { bgColor, icon } = resolveDefaultImage({ typeId, type });

  return (
    <View
      testID={testID}
      className={`items-center justify-center ${className ?? ""}`}
      style={[
        { backgroundColor: bgColor, width: size, height: size },
        style,
      ]}
    >
      <MaterialCommunityIcons
        name={icon}
        size={Math.max(16, Math.round(size * 0.55))}
        color="#fff"
      />
    </View>
  );
}
