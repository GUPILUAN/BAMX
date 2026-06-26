import React from "react";
import { ScrollView, TouchableOpacity, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { resolveDefaultImage } from "@/components/DefaultProductImage/DefaultProductImage";

export type Category = {
  id: string; // CVE_LIN (type_id); "" para los sin línea
  label: string; // nombre humano (DESC_LIN)
  typeId: string | null;
  type: string | null;
  count: number;
};

type Props = {
  categories: Category[];
  selected: string | null; // null = "Todos"
  onSelect: (id: string | null) => void;
  isDark: boolean;
};

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function Chip({
  active,
  label,
  icon,
  color,
  count,
  isDark,
  onPress,
}: {
  active: boolean;
  label: string;
  icon: IconName;
  color: string;
  count?: number;
  isDark: boolean;
  onPress: () => void;
}) {
  const idleBg = isDark ? "#27272a" : "#f1f0ec";
  const idleText = isDark ? "#e4e4e7" : "#3f3f46";
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        backgroundColor: active ? color : idleBg,
        borderWidth: 1,
        borderColor: active ? color : "transparent",
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={16}
        color={active ? "#fff" : color}
      />
      <Text
        style={{
          marginLeft: 6,
          fontWeight: "600",
          fontSize: 13,
          color: active ? "#fff" : idleText,
        }}
      >
        {label}
      </Text>
      {typeof count === "number" && (
        <View
          style={{
            marginLeft: 6,
            minWidth: 20,
            paddingHorizontal: 5,
            paddingVertical: 1,
            borderRadius: 999,
            backgroundColor: active ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: active ? "#fff" : idleText,
            }}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// Fila de chips para filtrar el grid por línea de producto (CVE_LIN). Reusa la
// paleta/iconos de DefaultProductImage (resolveDefaultImage) para que cada
// categoría tenga el mismo color e icono que en las tarjetas.
export default function CategoryChips({
  categories,
  selected,
  onSelect,
  isDark,
}: Props) {
  const totalCount = categories.reduce((s, c) => s + c.count, 0);
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 4 }}
    >
      <Chip
        active={selected == null}
        label="Todos"
        icon="shape-outline"
        color="#6366f1"
        count={totalCount}
        isDark={isDark}
        onPress={() => onSelect(null)}
      />
      {categories.map((c) => {
        const { bgColor, icon } = resolveDefaultImage({
          typeId: c.typeId,
          type: c.type,
        });
        return (
          <Chip
            key={c.id}
            active={selected === c.id}
            label={c.label}
            icon={icon}
            color={bgColor}
            count={c.count}
            isDark={isDark}
            onPress={() => onSelect(c.id)}
          />
        );
      })}
    </ScrollView>
  );
}
