import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleProp,
  ViewStyle,
} from "react-native";
import { FontAwesome5, FontAwesome6 } from "@expo/vector-icons";
import { InventoryItem } from "@/types/InventoryItem";
import { Lot } from "@/types/Lot";
import DefaultProductImage from "@/components/DefaultProductImage/DefaultProductImage";
import { unitForLine } from "@/functions/unitForLine";

import { navigate } from "@/functions/NavigationService";

type ProductRowProduct = InventoryItem | Lot;

interface ProductRowProps {
  index: number;
  isSelected: boolean;
  handleSelect?: (id: string) => void;
  product: ProductRowProduct;
  style?: StyleProp<ViewStyle>;
  isDark?: boolean;
}

export default function ProductRow({
  index,
  product,
  style,
  isDark = false,
  isSelected = false,
  handleSelect,
}: ProductRowProps & {
  isSelected?: boolean;
  handleSelect?: (id: string) => void;
}) {
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | null>(
    null
  );

  // support both new InventoryItem shape and older Lot-like objects used in tests
  const warehouseNamesCritical = (product as any).warehouseNamesCritical || [];
  const warehouseNamesWarning = (product as any).warehouseNamesWarning || [];
  const warehouseNamesGood = (product as any).warehouseNamesGood || [];

  const allWarehouses = Array.from(
    new Set([
      ...warehouseNamesCritical,
      ...warehouseNamesWarning,
      ...(warehouseNamesGood || []),
    ])
  );

  // helper to read fields whether product is InventoryItem or Lot-like
  const productId = (product as any).product_id || (product as any).id || "";
  const productName =
    (product as any).product_name || (product as any).name || "";
  const available_quantity =
    (product as any).available_quantity ??
    (product as any).availableQuantity ??
    0;
  const prodType = (product as any).type || "";
  const production_date =
    (product as any).production_date || (product as any).productionDate;
  const expiration_date =
    (product as any).expiration_date ||
    (product as any).expiration_date ||
    (product as any).expirationDate ||
    (product as any).expiration_date;

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);
  const selectWarehouse = (name: string) => {
    setSelectedWarehouse(name);
    setDropdownVisible(false);
  };

  const numericQty =
    typeof available_quantity === "number"
      ? available_quantity
      : Number(available_quantity);
  // Threshold 0.01: descarta ruido de Aspel (residuos tipo 1.62e-12) y
  // también "residuo escalado" tipo CARNE DE POLLO con 0.01 pz que es 10g
  // — no es stock operativo. Mantiene sincronizado con InveRepository.
  const hasStock = Number.isFinite(numericQty) && Math.abs(numericQty) >= 0.01;

  const baseStyle: any = {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: isDark ? "#555" : "#ddd",
    backgroundColor: isSelected
      ? "lightblue"
      : isDark
        ? index % 2 === 0
          ? "#333"
          : "#444"
        : index % 2 === 0
          ? "#f2f2f2"
          : "#fff",
    opacity: isSelected ? 0.5 : hasStock ? 1 : 0.55,
  };

  const mergedStyle = Object.assign({}, baseStyle, (style as any) || {});

  return (
    <View
      testID="product-row"
      style={mergedStyle}
      className={index % 2 === 0 ? "bg-gray-200" : "bg-white"}
    >
      {/* Nombre */}
      <View
        style={{
          flex: 1.5,
          justifyContent: "flex-start",
          paddingHorizontal: 4,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <DefaultProductImage
          typeId={(product as any).type_id}
          type={(product as any).type}
          size={36}
          style={{ borderRadius: 6, marginRight: 6 }}
        />
        <TouchableOpacity
          testID="info-button"
          onPress={() => navigate("Details", { product })}
          style={{ padding: 6 }}
        >
          <FontAwesome5 name="info-circle" size={16} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity style={{ padding: 6 }}>
          <FontAwesome5 name="edit" size={16} color="gray" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleSelect && handleSelect(productId)}
        >
          <Text style={{ color: isDark ? "#fff" : "#000" }}>{productName}</Text>
        </TouchableOpacity>
      </View>

      {/* Cantidad */}
      <View
        style={{ flex: 1.5, justifyContent: "center", alignItems: "center" }}
      >
        {hasStock ? (
          <Text style={{ color: isDark ? "#fff" : "#000" }}>
            {formatQuantity(available_quantity)}
            {"\n"}
            {unitForLine({
              typeId: (product as any).type_id,
              type: prodType,
            })}
          </Text>
        ) : (
          <View
            testID="sin-stock-badge"
            style={{
              backgroundColor: isDark ? "#444" : "#e5e7eb",
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 10,
            }}
          >
            <Text
              style={{
                color: isDark ? "#bbb" : "#6b7280",
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              Sin stock
            </Text>
          </View>
        )}
      </View>

      {/* Tipo */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: isDark ? "#fff" : "#000" }}>{prodType}</Text>
        {production_date && (
          <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 12 }}>
            {formatDateProduction(production_date)}
          </Text>
        )}
        {expiration_date && (
          <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 12 }}>
            CAD: {formatDateProduction(expiration_date)}
          </Text>
        )}
      </View>

      {/* Dropdown */}
      <View style={{ flex: 1.5, paddingHorizontal: 4 }}>
        <TouchableOpacity
          onPress={toggleDropdown}
          style={{
            borderWidth: 1,
            borderColor: isDark ? "#555" : "#ccc",
            borderRadius: 6,
            paddingHorizontal: 6,
            paddingVertical: 4,
            backgroundColor: isDark ? "#555" : "#fafafa",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
          disabled={allWarehouses.length === 0}
        >
          <Text
            numberOfLines={1}
            style={{
              color: isDark ? "#fff" : "#000",
              flexShrink: 1,
              fontSize: 11,
            }}
          >
            {allWarehouses.length === 0
              ? "No hay almacenes con existencia"
              : "Mostrar almacenes con existencia"}
          </Text>
          {allWarehouses.length > 0 && (
            <FontAwesome6
              name={dropdownVisible ? "chevron-up" : "chevron-down"}
              size={12}
              color={isDark ? "#fff" : "#000"}
            />
          )}
        </TouchableOpacity>

        {dropdownVisible && allWarehouses.length > 0 && (
          <View
            style={{
              position: "absolute",
              top: 32,
              left: 0,
              right: 0,
              borderWidth: 1,
              borderColor: isDark ? "#555" : "#ccc",
              borderRadius: 6,
              backgroundColor: isDark ? "#555" : "#fff",
              zIndex: 10,
            }}
          >
            {allWarehouses.map((name, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => selectWarehouse(name)}
                style={{
                  paddingHorizontal: 6,
                  paddingVertical: 4,
                  backgroundColor:
                    selectedWarehouse === name
                      ? isDark
                        ? "#666"
                        : "#eee"
                      : "transparent",
                  borderBottomWidth: i < allWarehouses.length - 1 ? 1 : 0,
                  borderBottomColor: isDark ? "#555" : "#ddd",
                }}
              >
                <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 13 }}>
                  {name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>

      {/* Estado como círculos */}
      <View
        style={{
          flex: 1.5,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {renderEstadoCirculos(product)}
      </View>
    </View>
  );
}
function formatQuantity(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0";
  // Threshold 0.01: descarta ruido de Aspel (residuos tipo 1e-12 que dejan
  // las sumas/restas de movimientos) y también valores residuales escalados
  // como 0.01 que en piezas significa "casi nada". Sincronizado con
  // hasStock arriba y con InveRepository.findAllInveWithStock en backend.
  if (Math.abs(n) < 0.01) return "0";
  return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}

function formatDateProduction(dateStr: string) {
  // expected input 'YYYY-MM-DD' or similar
  try {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, (month || 1) - 1, day || 1);
    return d.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

function renderEstadoCirculos(product: ProductRowProduct) {
  const warehouseNamesCritical = (product as any).warehouseNamesCritical || [];
  const warehouseNamesWarning = (product as any).warehouseNamesWarning || [];
  const warehouseNamesGood = (product as any).warehouseNamesGood || [];

  const estados = [
    { color: "#D32F2F", active: warehouseNamesCritical.length > 0 },
    { color: "#FFA000", active: warehouseNamesWarning.length > 0 },
    { color: "#388E3C", active: warehouseNamesGood.length > 0 },
  ];

  return estados.map((estado, i) => (
    <View
      key={i}
      style={{
        width: 14,
        height: 14,
        borderRadius: 7,
        borderWidth: 1.5,
        borderColor: estado.color,
        backgroundColor: estado.active ? estado.color : "transparent",
        marginHorizontal: 3,
      }}
    />
  ));
}
