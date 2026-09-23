import React from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { ProductWarehouse } from "@/types/ProductLocation";
import { formatQuantity } from "@/functions/formatQuantity";
import { useFetchProductWarehouses } from "@/hooks/useFetchProductWarehouses";
import {
  FRESHNESS_AMBER,
  FRESHNESS_GREEN,
  FRESHNESS_RED,
} from "@/functions/getFreshness";

type Props = {
  productId: string | null | undefined;
  isDark: boolean;
};

const GRAY = "#9CA3AF";

// Cantidad que se muestra por almacén. Los lotes mandan cuando existen: es la
// cifra que ya usan el Semáforo y las pantallas de entregables. MULT.EXIST
// cubre el resto del catálogo, que en BAMX es casi todo.
function visibleQuantity(warehouse: ProductWarehouse): number {
  return warehouse.lots_quantity > 0
    ? warehouse.lots_quantity
    : warehouse.stock_quantity;
}

// Días de calendario hasta la caducidad (negativo = ya caducó). Misma cuenta
// que getFreshness.daysUntil, en UTC para no arrastrar la hora.
function daysUntil(expiration: string): number | null {
  const exp = new Date(expiration);
  if (Number.isNaN(exp.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate());
  return Math.round((b - a) / 86_400_000);
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "fecha inválida";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function plural(n: number, one: string, many: string): string {
  return n === 1 ? one : many;
}

// Segunda línea de cada almacén. Distingue los tres casos reales de BAMX: el
// producto vive sólo en MULT (sin lote), tiene lotes con caducidad, o tiene
// lotes que nadie capturó con caducidad en Aspel.
function detailLine(warehouse: ProductWarehouse): string {
  const { lots_count, lots_without_expiration, nearest_expiration } = warehouse;

  if (lots_count === 0) return "Sin lote capturado en Aspel";

  const lotes = `${lots_count} ${plural(lots_count, "lote", "lotes")}`;

  if (nearest_expiration == null) {
    return `${lotes} · sin caducidad capturada`;
  }

  const dias = daysUntil(nearest_expiration);
  const fecha = formatDate(nearest_expiration);

  let caducidad: string;
  if (dias == null) caducidad = `caduca el ${fecha}`;
  else if (dias < 0) caducidad = `caducó el ${fecha}`;
  else if (dias === 0) caducidad = "caduca hoy";
  else if (dias <= 7) caducidad = `caduca en ${dias} ${plural(dias, "día", "días")}`;
  else caducidad = `caduca el ${fecha}`;

  // Un almacén puede tener lotes con caducidad y otros sin ella. Decirlo evita
  // que la fecha más próxima se lea como si cubriera todo el almacén.
  const sinFecha =
    lots_without_expiration > 0
      ? ` (+${lots_without_expiration} sin caducidad)`
      : "";

  return `${lotes} · ${caducidad}${sinFecha}`;
}

function dotColor(warehouse: ProductWarehouse): string {
  if (warehouse.lots_count === 0) return GRAY;
  if (warehouse.nearest_expiration == null) return FRESHNESS_RED;
  const dias = daysUntil(warehouse.nearest_expiration);
  if (dias == null) return GRAY;
  if (dias <= 2) return FRESHNESS_RED;
  if (dias <= 5) return FRESHNESS_AMBER;
  return FRESHNESS_GREEN;
}

// Sección "Dónde está" del detalle de producto. Une las dos fuentes de Aspel
// (MULT para existencia por bodega, LTPD para lote y caducidad) vía el endpoint
// /api/inventarios/{cveArt}/almacenes.
export default function ProductWarehouses({ productId, isDark }: Props) {
  const { location, loading } = useFetchProductWarehouses(productId);

  const labelColor = isDark ? "text-gray-400" : "text-gray-800";
  const valueColor = isDark ? "text-gray-200" : "text-gray-900";
  const mutedColor = isDark ? "text-gray-500" : "text-gray-500";

  const warehouses = location?.warehouses ?? [];
  const unit = location?.unit ?? "";

  return (
    <View
      testID="product-warehouses"
      className="mt-5 border-t border-gray-200 dark:border-zinc-800 pt-4"
    >
      <Text className={`${labelColor} text-sm mb-3`}>Dónde está</Text>

      {loading ? (
        <ActivityIndicator size="small" color={isDark ? "#a5b4fc" : "#6366f1"} />
      ) : warehouses.length === 0 ? (
        <Text className={`${mutedColor} text-sm`}>
          Sin existencia registrada en Aspel para este producto.
        </Text>
      ) : (
        warehouses.map((warehouse) => (
          <View
            key={warehouse.warehouse_id}
            testID={`warehouse-${warehouse.warehouse_id}`}
            className="flex-row items-start justify-between mb-3"
          >
            <View className="flex-row items-start flex-1 pr-3">
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginTop: 6,
                  marginRight: 8,
                  backgroundColor: dotColor(warehouse),
                }}
              />
              <View className="flex-1">
                <Text className={`${valueColor} text-sm font-medium`}>
                  {warehouse.warehouse_name}
                </Text>
                <Text className={`${mutedColor} text-xs mt-0.5`}>
                  {detailLine(warehouse)}
                </Text>
              </View>
            </View>

            <Text className={`${valueColor} text-sm font-medium`}>
              {formatQuantity(visibleQuantity(warehouse))} {unit}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}
