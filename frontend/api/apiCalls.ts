import { instance } from "./axiosInstance";

export async function loginUser(username: string, password: string) {
  // Minimal implementation for tests; real implementation uses axios instance
  const resp = await instance.post("/api/usuarios/login", {
    username,
    password,
  });
  return resp.data;
}
