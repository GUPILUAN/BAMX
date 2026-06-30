import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { navigate } from "@/functions/NavigationService";
import { isUsableImage } from "@/functions/isUsableImage";
import { resolveImageUrl } from "@/functions/resolveImageUrl";
import { formatQuantity } from "@/functions/formatQuantity";
import { unitForLine } from "@/functions/unitForLine";
import { getFreshness, FRESHNESS_AMBER } from "@/functions/getFreshness";
import DefaultProductImage from "@/components/DefaultProductImage/DefaultProductImage";
import FreshnessDots from "@/components/FreshnessDots/FreshnessDots";
import {
  DeliverableProduct,
  DeliverableVariant,
} from "@/types/DeliverableProduct";

type Props = {
  product: DeliverableProduct;
  variant: DeliverableVariant;
  width?: number;
  isDark: boolean;
};

const MEDIA_HEIGHT = 132;

// Texto legible sobre el color del badge (el amarillo necesita texto oscuro).
function badgeTextColor(bg: string): string {
  return bg === FRESHNESS_AMBER ? "#1a1a1a" : "#ffffff";
}

function statusLabel(variant: DeliverableVariant, daysLeft: number | null): string {
  if (variant === "noapto") return "No apto";
  // Verde (> 5 días) = entregable holgado; amarillo (3-5) = por caducar.
  return daysLeft != null && daysLeft > 5 ? "Entregable" : "Por caducar";
}

// Tarjeta de producto para las pantallas de entregables / no aptos. Reusa el
// patrón de imagen de ProductCard (URL real -> fallback DefaultProductImage por
// categoría) y muestra cantidad agregada + indicador de frescura. Al tocarla
// abre el modal de detalles existente.
export default function DeliverableCard({
  product,
  variant,
  width,
  isDark,
}: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [imageFailed, setImageFailed] = useState<boolean>(false);

  const fresh = getFreshness(product.nearest_expiration, variant);
  const imageUrl = resolveImageUrl(product.image);
  const showRealImage = isUsableImage(imageUrl) && !imageFailed;
  const unit = unitForLine({ typeId: product.type_id, type: product.type });

  const detailItem = JSON.stringify({
    product_id: product.product_id,
    product_name: product.product_name,
    type: product.type,
    type_id: product.type_id,
    production_date: null,
    expiration_date: product.nearest_expiration,
    image: product.image,
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => navigate("Details", { item: detailItem })}
      style={{
        width,
        borderRadius: 24,
        overflow: "hidden",
        backgroundColor: isDark ? "#1f2937" : "#ffffff",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: isDark ? 0.4 : 0.12,
        shadowRadius: 8,
        elevation: 4,
      }}
    >
      {/* Media + badge de estado */}
      <View style={{ height: MEDIA_HEIGHT, width: "100%" }}>
        {showRealImage ? (
          <>
            <Image
              source={{ uri: imageUrl as string }}
              style={{ width: "100%", height: MEDIA_HEIGHT }}
              resizeMode="cover"
              onLoad={() => setLoading(false)}
              onError={() => {
                setImageFailed(true);
                setLoading(false);
              }}
            />
            {loading && (
              <View
                testID="loading-indicator"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="small" />
              </View>
            )}
          </>
        ) : (
          <DefaultProductImage
            typeId={product.type_id}
            type={product.type}
            size={MEDIA_HEIGHT}
            style={{ width: "100%", height: MEDIA_HEIGHT }}
          />
        )}

        <View
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 999,
            backgroundColor: fresh.color,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: badgeTextColor(fresh.color),
            }}
          >
            {statusLabel(variant, fresh.daysLeft)}
          </Text>
        </View>
      </View>

      {/* Cuerpo */}
      <View style={{ paddingHorizontal: 14, paddingTop: 10, paddingBottom: 14 }}>
        <Text
          numberOfLines={2}
          style={{
            fontWeight: "600",
            fontSize: 14,
            minHeight: 38,
            color: isDark ? "#f4f4f5" : "#18181b",
          }}
        >
          {product.product_name}
        </Text>

        <View style={{ flexDirection: "row", alignItems: "baseline", marginTop: 4 }}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "800",
              color: isDark ? "#ffffff" : "#111827",
            }}
          >
            {formatQuantity(product.total_quantity)}
          </Text>
          <Text
            style={{
              marginLeft: 4,
              fontSize: 12,
              color: isDark ? "#9ca3af" : "#6b7280",
            }}
          >
            {unit}
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <FreshnessDots dots={fresh.dots} color={fresh.color} />
          <Text
            numberOfLines={1}
            style={{ fontSize: 11, fontWeight: "600", color: fresh.color, flexShrink: 1, textAlign: "right", marginLeft: 8 }}
          >
            {fresh.label}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
