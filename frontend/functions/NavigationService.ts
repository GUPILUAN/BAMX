import { router } from "expo-router";

export function replace(
  name: string,
  params?: Record<string, any> | undefined
) {
  // Convert traditional route names to Expo Router format
  const route = convertRouteToPath(name);
  router.replace({
    pathname: route,
    params,
  });
}

export function navigate(name: string, params?: any) {
  // Convert traditional route names to Expo Router format
  const route = convertRouteToPath(name);
  router.push({
    pathname: route,
    params,
  });
}

export function goBack() {
  router.back();
}

// Helper function to convert traditional route names to Expo Router paths
function convertRouteToPath(routeName: string): string {
  switch (routeName) {
    case "Auth":
      return "/(auth)/login";
    case "Dashboard":
      return "/(drawer)/inicio";
    case "Details":
      return "/details";
    case "AuthLoading":
      return "/";
    case "Inicio":
      return "/(drawer)/inicio";
    case "Inventario":
      return "/(drawer)/inventario";
    case "ProductosEntregables":
      return "/(drawer)/productosEntregables";
    case "ProductosNoAptos":
      return "/(drawer)/productosNoAptos";
    case "Configuracion":
      return "/(drawer)/configuracion";
    case "Usuario":
      return "/(drawer)/usuario";
    default:
      return routeName.toLowerCase();
  }
}
