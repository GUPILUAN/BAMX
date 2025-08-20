import axios from "axios";
import { deleteData, getData, saveData } from "../functions/userKey";
import { replace } from "../functions/NavigationService";

const instance = axios.create({
  baseURL: "http://192.168.0.39:5000",
});

instance.interceptors.request.use(
  async (config) => {
    if (
      config.url === "/api/login/" ||
      config.url === "/api/register/" ||
      config.url === "/api/token/refresh/"
    ) {
      return config;
    }
    let access = await getData("access");
    if (!access || tokenExpired(access)) {
      try {
        access = await refreshToken();
      } catch (error) {
        await logOut();
        throw error;
      }
    }
    config.headers.Authorization = `Bearer ${access}`;

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const tokenExpired = (token: string) => {
  const payload = JSON.parse(atob(token.split(".")[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

export const logOut = async () => {
  try {
    await deleteData("access");
    await deleteData("refresh");

    console.log("Sesión expirada, redirigiendo al login...");

    replace("Auth");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};

const refreshToken = async () => {
  try {
    const refresh = await getData("refresh");
    if (!refresh) {
      throw new Error("No refresh token found");
    }
    const response = await instance.post("/api/token/refresh/", {
      refresh: refresh,
    });
    const { access } = response.data;
    await saveData("access", access);
    return access;
  } catch (error) {
    console.log("Error al refrescar el token:", error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string) => {
  const response = await instance.post("/api/login/", {
    username: username,
    password: password,
  });
  const { access, refresh } = response.data;
  await saveData("access", access);
  await saveData("refresh", refresh);
};

export const retrieveData = async (route: string) => {
  try {
    const response = await instance.get(route);
    return response.data.results;
  } catch (error) {
    console.log("Error al obtener datos:", error);
  }
};
