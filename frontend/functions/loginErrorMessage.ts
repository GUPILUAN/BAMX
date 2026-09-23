import { AxiosError } from "axios";

// Traduce un fallo de login al mensaje que ve el usuario.
//
// El login es el primer contacto de la tablet con el servidor, así que es donde
// aparecen los problemas de despliegue: IP equivocada dentro del APK, firewall,
// WiFi que aísla a los clientes, backend caído. Antes todo eso salía como "Las
// credenciales son incorrectas" y mandaba a buscar el problema donde no estaba.
//
// Se distingue "el servidor contestó que no" de "no hubo servidor", y en el
// segundo caso se muestra la URL que quedó quemada en el APK: es justo el dato
// que hace falta para diagnosticar en sitio.
export function loginErrorMessage(error: unknown, apiUrl: string): string {
  if (error instanceof AxiosError && !error.response) {
    return (
      `No se pudo conectar con el servidor ${apiUrl}. ` +
      "Revisa que la tablet esté en la red de BAMX y que el servidor esté encendido."
    );
  }

  const status = error instanceof AxiosError ? error.response?.status : undefined;
  if (status !== undefined && status >= 500) {
    return "El servidor respondió con un error. Intenta de nuevo en unos minutos.";
  }

  return "Las credenciales son incorrectas";
}
