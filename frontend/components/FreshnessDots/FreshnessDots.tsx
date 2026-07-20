import React from "react";
import { View } from "react-native";

type Props = {
  dots: number; // cuántos puntos van "llenos"
  color: string;
  total?: number;
  size?: number;
};

// Indicador de frescura tipo "señal": N de 5 puntos llenos del color del bucket.
// Más puntos llenos = más holgura antes de caducar.
export default function FreshnessDots({
  dots,
  color,
  total = 5,
  size = 8,
}: Props) {
  return (
    <View style={{ flexDirection: "row", gap: 4 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: 1.5,
            borderColor: color,
            backgroundColor: i < dots ? color : "transparent",
          }}
        />
      ))}
    </View>
  );
}
