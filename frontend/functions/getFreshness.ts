import { DeliverableVariant } from "@/types/DeliverableProduct";

// Colores del indicador de frescura. Alineados con el semáforo del Home.
export const FRESHNESS_GREEN = "#52C41A";
export const FRESHNESS_AMBER = "#FFC107";
export const FRESHNESS_RED = "#FF4D4F";

export type Freshness = {
  dots: number; // puntos "llenos" de un total de 5 (más = más fresco)
  color: string;
  label: string;
  daysLeft: number | null; // null = sin caducidad capturada
};

// Días de calendario entre hoy y la caducidad (trunca la hora). Negativo = ya
// caducó. null si no hay fecha o no es parseable.
function daysUntil(expiration: string | null): number | null {
  if (!expiration) return null;
  const exp = new Date(expiration);
  if (Number.isNaN(exp.getTime())) return null;
  const today = new Date();
  const a = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const b = Date.UTC(exp.getFullYear(), exp.getMonth(), exp.getDate());
  return Math.round((b - a) / 86_400_000);
}

function dotsForDays(daysLeft: number | null): number {
  if (daysLeft == null) return 0;
  if (daysLeft >= 15) return 5;
  if (daysLeft >= 10) return 4;
  if (daysLeft >= 6) return 3;
  if (daysLeft >= 3) return 2; // warning (3-5 días)
  if (daysLeft >= 1) return 1;
  return 0;
}

function plural(n: number, singular: string, pluralForm: string): string {
  return Math.abs(n) === 1 ? singular : pluralForm;
}

// Traduce la caducidad de un producto a un indicador visual de frescura según
// el bucket. En entregables la frescura va de amarillo (por caducar, 3-5 días)
// a verde (holgado). En no aptos siempre es rojo y el label explica el porqué.
export function getFreshness(
  expiration: string | null,
  variant: DeliverableVariant
): Freshness {
  const daysLeft = daysUntil(expiration);

  if (variant === "noapto") {
    let label: string;
    if (daysLeft == null) label = "Sin caducidad";
    else if (daysLeft < 0)
      label = `Caducó hace ${Math.abs(daysLeft)} ${plural(daysLeft, "día", "días")}`;
    else if (daysLeft === 0) label = "Caduca hoy";
    else label = `Caduca en ${daysLeft} ${plural(daysLeft, "día", "días")}`;
    return { dots: 0, color: FRESHNESS_RED, label, daysLeft };
  }

  // entregable: verde si caduca holgado (> 5 días), amarillo si está por caducar.
  const color = daysLeft != null && daysLeft > 5 ? FRESHNESS_GREEN : FRESHNESS_AMBER;
  const label =
    daysLeft == null
      ? "Sin caducidad"
      : daysLeft === 1
        ? "Caduca mañana"
        : `Caduca en ${daysLeft} ${plural(daysLeft, "día", "días")}`;
  return { dots: dotsForDays(daysLeft), color, label, daysLeft };
}
