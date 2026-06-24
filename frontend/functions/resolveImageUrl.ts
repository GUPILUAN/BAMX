// Resuelve una URL de imagen del backend a absoluta.
//
// El backend devuelve rutas relativas (p. ej. "/api/public/fotos-inventarios/XYZ"
// o "/api/foto-usuario/") para no acoplar la URL al host/túnel por el que se le
// accede. El componente <Image> de React Native necesita una URL absoluta, así
// que le anteponemos la baseURL de la API. URLs ya absolutas (http/https) o data:
// (base64) se dejan tal cual.
//
// Nota: el avatar que pasa por apiService.getImage NO necesita esto — axios ya
// antepone la baseURL a las rutas relativas. Este helper es para los <Image>
// que reciben la URL directo (ProductCard, DetailsScreen).

const API_BASE = process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080";

export function resolveImageUrl(
  url: string | null | undefined
): string | null | undefined {
  if (!url) return url;
  const trimmed = url.trim();
  if (trimmed === "") return trimmed;
  if (/^(https?:|data:)/i.test(trimmed)) return trimmed;
  return `${API_BASE.replace(/\/$/, "")}/${trimmed.replace(/^\//, "")}`;
}
