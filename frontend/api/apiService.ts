import { instance } from "./axiosInstance";
import { loginUser } from "./apiCalls";
import { deleteData, getData, saveData } from "../functions/userKey";
import { replace } from "../functions/NavigationService";
import { AxiosError } from "axios";

export const apiService = {
  loginUser: async (username: string, password: string) => {
    // Delegate to apiCalls.loginUser so tests can mock that module
    const response = await loginUser(username, password);
    const { access, refresh } = response || {};
    if (access) await saveData("access", access);
    if (refresh) await saveData("refresh", refresh);
  },
  logOut: async () => {
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
  },
  retrieveData: async (route: string) => {
    try {
      const response = await instance.get(route);
      console.log("Server response:", response.data.message);

      return response.data.data;
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error(
          `Error ${error.response.status}:`,
          error.response.data.message
        );
      }
    }
  },
  getImage: async (url: string) => {
    try {
      const response = await instance.get(url, { responseType: "arraybuffer" });
      const base64 = Buffer.from(response.data, "binary").toString("base64");
      const uri = `data:image/jpeg;base64,${base64}`;
      return uri;
    } catch (e) {
      console.error(e);
      return null;
    }
  },
};
