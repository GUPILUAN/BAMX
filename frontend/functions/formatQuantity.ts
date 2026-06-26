// Formatea cantidades provenientes de Aspel: descarta ruido de punto flotante
// (residuos tipo 1e-12 que dejan las sumas/restas de movimientos) y valores
// residuales escalados (< 0.01) que no son stock operativo, y aplica locale
// es-MX. Extraído de ProductRow para reusarlo en las pantallas de entregables
// / no aptos y mantener una sola fuente de verdad del formateo de cantidades.
export function formatQuantity(value: unknown): string {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return "0";
  if (Math.abs(n) < 0.01) return "0";
  return n.toLocaleString("es-MX", { maximumFractionDigits: 2 });
}
