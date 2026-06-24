import { deleteData, getData, saveData } from "@/functions/userKey";
import axios from "axios";
import { replace } from "../functions/NavigationService";

export const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080",
});

// Rutas de auth cuyo 401 NO significa "sesión expirada" (es credenciales o
// refresh inválido), así que no deben gatillar el cierre de sesión automático.
// Mismas que el request interceptor deja pasar sin inyectar token.
const AUTH_ROUTES = [
  "/api/usuarios/login",
  "/api/usuarios/refresh-token",
  "/api/usuarios/logout",
];

// Single-flight guard: evita redirigir a login (y loguear) varias veces cuando
// muchos requests fallan a la vez por la misma sesión expirada. Se re-arma solo
// en cuanto vuelve a haber un token válido (login o refresh exitoso).
let redirectingToAuth = false;

// Cierra la sesión localmente: borra tokens y redirige a login una sola vez.
// NO llama a /logout: si llegamos aquí el token ya está muerto, así que
// blocklistearlo en el backend no aporta nada (y generaría otro 401 ruidoso).
const endSession = async () => {
  await deleteData("access");
  await deleteData("refresh");
  if (!redirectingToAuth) {
    redirectingToAuth = true;
    replace("Auth");
  }
};

instance.interceptors.request.use(
  async (config) => {
    if (AUTH_ROUTES.includes(config.url ?? "")) {
      return config;
    }

    let access = await getData("access");
    if (!access || tokenExpired(access)) {
      // refreshToken() ya limpia la sesión y redirige si falla; aquí solo
      // dejamos propagar el error para abortar este request.
      access = await refreshToken();
    } else {
      // Token sano: re-armamos el guard para un futuro 401 (p. ej. tras re-login).
      redirectingToAuth = false;
    }
    config.headers.Authorization = `Bearer ${access}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Maneja de forma centralizada los 401 que devuelve el backend para tokens que
// el cliente creía válidos (p. ej. el JWT_SECRET cambió entre reinicios). Sin
// esto, ese 401 llegaba a cada handler sin redirigir a login.
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? "";
    // Solo cerramos sesión por 401 de NUESTRA API (rutas relativas) que no sean
    // de auth. Las imágenes externas (fallbacks absolutos de getImage) pasan por
    // este mismo instance; su 401 no debe desloguear al usuario.
    const isExternal = /^https?:\/\//i.test(url);
    if (status === 401 && !isExternal && !AUTH_ROUTES.includes(url)) {
      await endSession();
    }
    return Promise.reject(error);
  }
);

export const tokenExpired = (token: string) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch {
    // Token malformado / indecodificable: tratarlo como expirado en vez de
    // tirar una excepción no atrapada dentro del interceptor.
    return true;
  }
};

const refreshToken = async () => {
  const refresh_token = await getData("refresh");
  if (!refresh_token) {
    await endSession();
    throw new Error("No refresh token found");
  }
  try {
    const response = await instance.post("/api/usuarios/refresh-token", null, {
      headers: {
        Authorization: `Bearer ${refresh_token}`,
      },
    });
    const { access, refresh } = response.data;
    await saveData("access", access);
    if (refresh) {
      await saveData("refresh", refresh);
    }
    redirectingToAuth = false;
    return access;
  } catch (error) {
    console.log("Sesión expirada, redirigiendo a login.");
    await endSession();
    throw error;
  }
};

// Re-export loginUser from apiCalls so tests can mock it via that module
export { loginUser } from "./apiCalls";
