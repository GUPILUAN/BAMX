import axios from "axios";
import { deleteData, getData, saveData } from "../functions/userKey";
import { replace } from "../functions/NavigationService";

const instance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || "http://localhost:8080",
});

instance.interceptors.request.use(
  async (config) => {
    if (
      config.url === "/api/usuarios/login" ||
      // config.url === "/api/auth/register" ||
      config.url === "/api/usuarios/refresh-token" ||
      config.url === "/api/usuarios/logout"
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
    const refresh_token = await getData("refresh");
    if (!refresh_token) {
      throw new Error("No refresh token found");
    }
    const response = await instance.post("/api/usuarios/logout", null, {
      headers: {
        Authorization: `Bearer ${refresh_token}`,
      },
    });
    await deleteData("access");
    await deleteData("refresh");

    if (response.status === 200) {
      console.log("Sesión cerrada correctamente.");
    }
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  } finally {
    replace("Auth");
  }
};

const refreshToken = async () => {
  try {
    const refresh_token = await getData("refresh");
    if (!refresh_token) {
      throw new Error("No refresh token found");
    }
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
    return access;
  } catch (error) {
    replace("Auth");
    console.log("Error al refrescar el token:", error);
    throw error;
  }
};

export const loginUser = async (username: string, password: string) => {
  const response = await instance.post("/api/usuarios/login", {
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
    console.log("Server response:", response.data.message);
    return response.data.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      console.error(
        `Error ${error.response.status}:`,
        error.response.data.message
      );
    }
  }
};

export const getImage = async (url: string) => {
  try {
    const response = await instance.get(url, { responseType: "arraybuffer" });
    const base64 = Buffer.from(response.data, "binary").toString("base64");
    const uri = `data:image/jpeg;base64,${base64}`;
    return uri;
  } catch (e) {
    console.error(e);
    return null;
  }
};
