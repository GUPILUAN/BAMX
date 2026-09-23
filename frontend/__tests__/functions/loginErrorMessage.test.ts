import { AxiosError, AxiosResponse } from "axios";
import { loginErrorMessage } from "@/functions/loginErrorMessage";

const URL_API = "http://192.168.1.100:8080";

const conRespuesta = (status: number) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    { status, statusText: "", data: {}, headers: {}, config: {} } as AxiosResponse
  );

describe("loginErrorMessage", () => {
  it("sin respuesta del servidor avisa que no hubo conexión y muestra la URL", () => {
    const mensaje = loginErrorMessage(
      new AxiosError("Network Error", "ERR_NETWORK"),
      URL_API
    );

    expect(mensaje).toContain("No se pudo conectar con el servidor");
    // La URL es el dato clave para diagnosticar en sitio un APK mal compilado.
    expect(mensaje).toContain(URL_API);
  });

  it("un timeout también cuenta como falta de conexión", () => {
    const mensaje = loginErrorMessage(
      new AxiosError("timeout of 30000ms exceeded", "ECONNABORTED"),
      URL_API
    );

    expect(mensaje).toContain("No se pudo conectar con el servidor");
  });

  it.each([401, 403, 404])(
    "si el servidor contesta %i son credenciales incorrectas",
    (status) => {
      expect(loginErrorMessage(conRespuesta(status), URL_API)).toBe(
        "Las credenciales son incorrectas"
      );
    }
  );

  it("un 5xx no se confunde con credenciales incorrectas", () => {
    const mensaje = loginErrorMessage(conRespuesta(500), URL_API);

    expect(mensaje).not.toBe("Las credenciales son incorrectas");
    expect(mensaje).toContain("error");
  });

  it("un error que no es de axios se trata como credenciales incorrectas", () => {
    expect(loginErrorMessage(new Error("algo"), URL_API)).toBe(
      "Las credenciales son incorrectas"
    );
  });
});
