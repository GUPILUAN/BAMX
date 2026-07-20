import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { DrawerActions } from "@react-navigation/native";
import { useSelector } from "react-redux";
import { selectTheme } from "@/slices/themeSlice";
import { themeColors } from "@/theme";
import useFetchDeliverables from "@/hooks/useFetchDeliverables";
import DeliverableCard from "@/components/DeliverableCard/DeliverableCard";
import CategoryChips, { Category } from "@/components/CategoryChips/CategoryChips";
import { DeliverableVariant } from "@/types/DeliverableProduct";

type SortBy = "freshness" | "quantity" | "name";

const H_PADDING = 16;
const GAP = 16;
const MIN_CARD = 200;

const VARIANTS = {
  entregable: {
    title: "Productos entregables",
    accent: "#78af6d",
    icon: "cart-check" as const,
    summary: (n: number) =>
      `${n} ${n === 1 ? "producto listo" : "productos listos"} para entregar`,
    emptyIcon: "package-variant" as const,
    emptyTitle: "Aún no hay productos entregables",
    emptyBody:
      "La frescura se calcula desde los lotes con caducidad capturada en Aspel. En cuanto se registren lote y caducidad en las entradas, los productos aptos aparecerán aquí.",
  },
  noapto: {
    title: "Productos no aptos",
    accent: "#d65f61",
    icon: "cart-remove" as const,
    summary: (n: number) =>
      `${n} ${n === 1 ? "producto requiere" : "productos requieren"} atención`,
    emptyIcon: "check-decagram" as const,
    emptyTitle: "Nada marcado como no apto",
    emptyBody:
      "Aquí aparecen los lotes caducados, por caducar (≤2 días) o sin caducidad capturada. Hoy no hay ninguno en ese estado.",
  },
} as const;

// Pantalla compartida por "Productos entregables" y "Productos no aptos": mismo
// grid de tarjetas, cambia el bucket (variant), el acento y los textos. Los
// datos salen de useFetchDeliverables (que filtra por caducidad en el backend).
export default function DeliverablesScreen({
  variant,
}: {
  variant: DeliverableVariant;
}) {
  const theme = useSelector(selectTheme);
  const isDark = theme === "dark";
  const navigation = useNavigation();
  const { width: screenW } = useWindowDimensions();

  const cfg = VARIANTS[variant];
  const { products, totalCount, truncated, loading, refresh } =
    useFetchDeliverables(variant);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("freshness");

  // Productos que matchean la búsqueda (sin aplicar aún el filtro de categoría):
  // base común para los chips y el grid.
  const queryFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.product_name?.toLowerCase().includes(q) ||
        p.product_id?.toLowerCase().includes(q)
    );
  }, [products, query]);

  // Categorías presentes (por CVE_LIN) para los chips. Se cuentan sobre lo que
  // matchea la búsqueda (no sobre la categoría seleccionada) para que el número
  // del chip concuerde con lo visible y no se vacíe al elegir una categoría.
  const categories: Category[] = useMemo(() => {
    const map = new Map<string, Category>();
    for (const p of queryFiltered) {
      const id = p.type_id ?? "";
      const existing = map.get(id);
      if (existing) existing.count += 1;
      else
        map.set(id, {
          id,
          label: p.type || "Sin categoría",
          typeId: p.type_id,
          type: p.type,
          count: 1,
        });
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [queryFiltered]);

  const visible = useMemo(() => {
    let list = queryFiltered;
    if (selectedCategory != null)
      list = list.filter((p) => (p.type_id ?? "") === selectedCategory);

    const sorted = [...list];
    if (sortBy === "quantity")
      sorted.sort((a, b) => b.total_quantity - a.total_quantity);
    else if (sortBy === "name")
      sorted.sort((a, b) =>
        (a.product_name || "").localeCompare(b.product_name || "")
      );
    // "freshness" ya viene ordenado del hook (caduca antes primero)
    return sorted;
  }, [queryFiltered, selectedCategory, sortBy]);

  // Clamp: en el primer render (web) useWindowDimensions puede reportar 0;
  // evitamos un ancho de tarjeta negativo.
  const available = Math.max(0, screenW - H_PADDING * 2);
  const numColumns = Math.max(2, Math.floor((available + GAP) / (MIN_CARD + GAP)));
  const cardWidth = Math.max(120, (available - GAP * (numColumns - 1)) / numColumns);

  const openMenu = () => navigation.dispatch(DrawerActions.openDrawer());

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      style={{ flex: 1, backgroundColor: themeColors.background(isDark) }}
    >
      {/* Hero */}
      <LinearGradient
        colors={[cfg.accent + (isDark ? "33" : "22"), themeColors.background(isDark)]}
        style={{ paddingHorizontal: H_PADDING, paddingTop: 12, paddingBottom: 14 }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={openMenu}
            style={{ padding: 6, marginRight: 6 }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons
              name="menu"
              size={28}
              color={themeColors.text(isDark)}
            />
          </TouchableOpacity>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: cfg.accent,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
            }}
          >
            <MaterialCommunityIcons name={cfg.icon} size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: themeColors.text(isDark),
              }}
            >
              {cfg.title}
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: isDark ? "#a1a1aa" : "#52525b",
                marginTop: 1,
              }}
            >
              {cfg.summary(totalCount)}
            </Text>
          </View>
          <SortButton sortBy={sortBy} setSortBy={setSortBy} isDark={isDark} />
        </View>

        {/* Buscador */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 12,
            backgroundColor: isDark ? "#1f2937" : "#ffffff",
            borderRadius: 14,
            paddingHorizontal: 12,
            height: 44,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          <Ionicons
            name="search-outline"
            size={18}
            color={isDark ? "#9ca3af" : "#6b7280"}
          />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar por nombre o clave…"
            placeholderTextColor={isDark ? "#6b7280" : "#9ca3af"}
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 15,
              color: themeColors.text(isDark),
            }}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={isDark ? "#6b7280" : "#9ca3af"}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>

      {/* Chips de categoría */}
      {categories.length > 0 && (
        <View style={{ paddingVertical: 6 }}>
          <CategoryChips
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            isDark={isDark}
          />
        </View>
      )}

      {/* Aviso de lista parcial (si el bucket excede una página de lotes) */}
      {truncated && (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            marginHorizontal: 16,
            marginBottom: 6,
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 10,
            backgroundColor: isDark ? "#3a2f12" : "#fef3cd",
          }}
        >
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={isDark ? "#fbbf24" : "#92700e"}
          />
          <Text
            style={{ flex: 1, fontSize: 12, color: isDark ? "#fcd34d" : "#92700e" }}
          >
            Lista parcial: hay más lotes de los que caben aquí. Afina con la
            búsqueda o las categorías.
          </Text>
        </View>
      )}

      {/* Grid */}
      {loading && products.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" color={cfg.accent} />
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={visible}
          keyExtractor={(p) => p.product_id}
          numColumns={numColumns}
          columnWrapperStyle={numColumns > 1 ? { gap: GAP } : undefined}
          contentContainerStyle={{
            paddingHorizontal: H_PADDING,
            paddingTop: 8,
            paddingBottom: 32,
            gap: GAP,
            flexGrow: 1,
          }}
          renderItem={({ item }) => (
            <DeliverableCard
              product={item}
              variant={variant}
              width={cardWidth}
              isDark={isDark}
            />
          )}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refresh}
              tintColor={cfg.accent}
              colors={[cfg.accent]}
            />
          }
          ListEmptyComponent={
            <EmptyState
              icon={cfg.emptyIcon}
              title={query || selectedCategory ? "Sin resultados" : cfg.emptyTitle}
              body={
                query || selectedCategory
                  ? "Prueba con otra búsqueda o quita el filtro de categoría."
                  : cfg.emptyBody
              }
              isDark={isDark}
            />
          }
        />
      )}
    </SafeAreaView>
  );
}

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

function SortButton({
  sortBy,
  setSortBy,
  isDark,
}: {
  sortBy: SortBy;
  setSortBy: (s: SortBy) => void;
  isDark: boolean;
}) {
  const order: SortBy[] = ["freshness", "quantity", "name"];
  const labels: Record<SortBy, string> = {
    freshness: "Frescura",
    quantity: "Cantidad",
    name: "Nombre",
  };
  const next = () =>
    setSortBy(order[(order.indexOf(sortBy) + 1) % order.length]);
  return (
    <TouchableOpacity
      onPress={next}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 10,
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0.3 : 0.08,
        shadowRadius: 3,
        elevation: 2,
      }}
    >
      <MaterialCommunityIcons
        name="sort"
        size={15}
        color={isDark ? "#d1d5db" : "#374151"}
      />
      <Text
        style={{
          marginLeft: 5,
          fontSize: 12,
          fontWeight: "600",
          color: isDark ? "#d1d5db" : "#374151",
        }}
      >
        {labels[sortBy]}
      </Text>
    </TouchableOpacity>
  );
}

function EmptyState({
  icon,
  title,
  body,
  isDark,
}: {
  icon: IconName;
  title: string;
  body: string;
  isDark: boolean;
}) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 32,
        paddingVertical: 48,
      }}
    >
      <MaterialCommunityIcons
        name={icon}
        size={64}
        color={isDark ? "#3f3f46" : "#d4d4d8"}
      />
      <Text
        style={{
          marginTop: 16,
          fontSize: 17,
          fontWeight: "700",
          color: isDark ? "#e4e4e7" : "#3f3f46",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          marginTop: 8,
          fontSize: 13,
          lineHeight: 19,
          color: isDark ? "#a1a1aa" : "#71717a",
          textAlign: "center",
          maxWidth: 440,
        }}
      >
        {body}
      </Text>
    </View>
  );
}
