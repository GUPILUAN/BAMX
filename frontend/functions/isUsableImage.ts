// Detecta URLs que el backend manda como "no image" placeholder (ej. pngtree)
// o cadenas vacías. Centralizado aquí para que ProductCard, DetailsScreen y
// cualquier otro consumidor traten el placeholder externo como "sin imagen"
// y caigan al DefaultProductImage por tipo.

const PLACEHOLDER_HOSTS = ["pngtree.com", "png.pngtree.com"];

export function isUsableImage(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (trimmed === "") return false;
  const lower = trimmed.toLowerCase();
  return !PLACEHOLDER_HOSTS.some((host) => lower.includes(host));
}
