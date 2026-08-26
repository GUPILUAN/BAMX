# Despliegue del backend BAMX en Windows

Manual para instalar el backend como **servicio de Windows** en la computadora de BAMX, conectado a la base Firebird de Aspel SAE, arrancando solo al encender el equipo.

> **La app es de solo lectura contra Aspel.** No escribe una sola fila en `INVE`, `LTPD`, `MINVE` ni ninguna tabla del ERP. Instalarla no puede afectar la contabilidad ni el inventario, y desinstalarla deja la máquina exactamente como estaba.

---

## Cómo queda instalado

```
Computadora de BAMX (Windows 10/11 o Server, 64 bits)
│
├── Aspel SAE 8.00 ──── ya instalado, NO se toca
├── Firebird 2.5 ────── ya instalado como servicio, NO se toca
│     └── escucha en 127.0.0.1:3050
│          ├── SAE80EMPRE03.FDB   inventario (solo lectura)
│          └── PERFILES.FDB       usuarios de la app
│
└── C:\BAMX\  ← todo lo nuevo vive aquí
    ├── app\
    │   ├── bamx-backend.jar      la aplicación
    │   ├── .env                  configuración (secretos, NO va a git)
    │   ├── bamx-backend.exe      WinSW: el que lo convierte en servicio
    │   ├── bamx-backend.xml      configuración del servicio
    │   └── runtime\bin\java.exe  JDK 25 portable
    └── logs\                     rotados a diario

        ▲ escucha en 0.0.0.0:8080
        │
   Red local de BAMX
        │
   Tablets Android con el APK
```

**Nada se instala fuera de `C:\BAMX`.** No se toca el PATH, ni el registro, ni Java global, ni Aspel, ni Firebird. El rollback es parar el servicio y borrar una carpeta.

---

## Requisitos de la computadora

| Requisito | Por qué | Lo verifica |
|---|---|---|
| Windows 64 bits | No existe JDK 25 para x86 | `00-preflight.ps1` paso 1 |
| .NET Framework ≥ 4.6.1 | Lo necesita WinSW (viene de fábrica en Win10 1607+) | paso 2 |
| Firebird corriendo en 3050 | Es de donde salen los datos | pasos 4-5 |
| Permisos de Administrador | Para registrar un servicio y abrir el firewall | — |
| **IP fija** | La URL se quema dentro del APK — ver abajo | paso 13 |
| ~500 MB libres | jar + JDK portable + logs | — |

### La IP fija no es opcional

`EXPO_PUBLIC_API_URL` se **inlinea en tiempo de compilación** del APK: la dirección del servidor queda escrita dentro del archivo instalado en cada tablet. Si la computadora cambia de IP porque el router le dio otra, **todas las tablets dejan de funcionar al mismo tiempo** y la única salida es recompilar el APK y reinstalarlo en cada una.

Antes de generar el APK hay que fijar la IP. Lo más limpio es una **reserva DHCP en el router** (asocia la MAC de la PC a una IP fija sin riesgo de conflictos). La alternativa es IP estática en la tarjeta de red.

---

## Qué llevar en la USB

En el repo viajan solo los archivos de texto. El material pesado se arma antes de salir y va en `deploy\dist\` (carpeta ignorada por git):

```
deploy\
├── README.md                      ← este archivo (del repo)
├── winsw\bamx-backend.xml         ← del repo
├── env\.env.produccion.example    ← del repo
├── scripts\*.ps1                  ← del repo
└── dist\                          ← SE ARMA A MANO, no está en git
    ├── bamx-backend.jar               (1) lo produce 01-build.ps1
    ├── WinSW-x64.exe                  (2) descargar
    ├── runtime\bin\java.exe            (3) JDK 25 extraído
    └── .env                            (4) se rellena EN SITIO, tras el preflight
```

**(1) El jar** — en tu máquina, con el repo abierto:

```bash
powershell -ExecutionPolicy Bypass -File deploy\scripts\01-build.ps1
```

**(2) WinSW** — descargar `WinSW-x64.exe` de la release **v2.12.0**:
<https://github.com/winsw/winsw/releases/tag/v2.12.0>
Guardarlo en `deploy\dist\` tal cual, sin renombrar (el instalador lo renombra solo).

**(3) JDK 25 portable** — descargar el **.zip** de Temurin JDK 25 (LTS), Windows x64:
<https://adoptium.net/temurin/releases/?version=25&os=windows&arch=x64&package=jdk>

Se usa el `.zip` y no el instalador `.msi` a propósito: no toca el PATH ni el registro, no choca con nada que Aspel necesite, y evita el problema clásico de que el servicio corre como `LocalSystem` y `LocalSystem` no ve el `JAVA_HOME` del usuario.

⚠️ **Al extraerlo hay que quitar la carpeta contenedora.** El resultado correcto es:

```
dist\runtime\bin\java.exe        ✅
dist\runtime\jdk-25.0.2\bin\...  ❌  (sobra un nivel)
```

**(4) El `.env`** — se copia de `env\.env.produccion.example` y se rellena **en sitio**, con los valores que reporte el preflight. No se prepara antes: las rutas reales de BAMX no se saben hasta llegar.

---

# Instalación paso a paso

Todo se corre desde **PowerShell como Administrador**, parado en `deploy\scripts`.

## Paso 1 — Diagnóstico (no instala nada)

```bash
powershell -ExecutionPolicy Bypass -File .\00-preflight.ps1
```

Recorre 14 verificaciones y termina con un resumen. Es lo único que hay que leer con calma.

Si SYSDBA no usa la contraseña por defecto:

```bash
powershell -ExecutionPolicy Bypass -File .\00-preflight.ps1 -DbPassword "laClaveReal"
```

**No continuar si hay BLOQUEANTES.** Los tres más probables:

| Bloqueante | Qué significa | Qué hacer |
|---|---|---|
| No se encontró la base de perfiles | Sin ella nadie puede iniciar sesión | Localizar el `.FDB` de perfiles o llevarlo a la máquina |
| `isql` no pudo conectarse | La contraseña de SYSDBA no es la esperada | Pedirla a quien administra Aspel |
| La tabla `USUARIOS` está vacía | No hay a quién dejar entrar | Dar de alta usuarios antes del go-live |

Al final imprime un bloque con los valores detectados. **Ese bloque es el insumo del paso 2.**

## Paso 2 — Armar el `.env`

```bash
copy ..\env\.env.produccion.example ..\dist\.env
notepad ..\dist\.env
```

Pegar los valores del preflight y generar el secreto:

```bash
powershell -Command "[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))"
```

### Tres reglas que rompen el arranque

1. **Rutas con `/`, nunca con `\`.** El archivo se lee como `.properties`, donde `\` es carácter de escape.
   `C:/Program Files (x86)/...` ✅  ·  `C:\Program Files (x86)\...` ❌
2. **`APP_IMAGES_PATH` termina en `/`.** El código concatena la ruta literalmente.
3. **Ninguna variable obligatoria puede faltar**, ni siquiera `APP_HOST_URL` (hoy no la lee nadie, pero sin ella Spring no arranca).

El instalador valida las tres y se niega a continuar si algo está mal, así que no hay forma de equivocarse en silencio.

## Paso 3 — Instalar

```bash
powershell -ExecutionPolicy Bypass -File .\02-install.ps1
```

Hace, en orden: valida permisos y material → valida el `.env` → copia todo a `C:\BAMX` → ajusta solo el nombre del servicio de Firebird si difiere → registra el servicio → lo pone en arranque automático retrasado → abre el puerto en el firewall (solo perfiles Private y Domain) → arranca y espera respuesta.

Si el puerto 8080 estaba ocupado y usaste otro, se lo pasas:

```bash
powershell -ExecutionPolicy Bypass -File .\02-install.ps1 -Puerto 8081
```

## Paso 4 — Verificar

```bash
powershell -ExecutionPolicy Bypass -File .\03-verify.ps1 -Usuario "unUsuarioReal" -Password "suClave"
```

Prueba ocho cosas, cada una más profunda que la anterior. Sin credenciales solo corre la mitad, y **no queda comprobado que el sufijo de empresa sea el correcto**, que es justo el error más caro de detectar tarde.

## Paso 5 — La prueba de verdad: reiniciar

```bash
shutdown /r /t 0
```

Al volver, **sin iniciar sesión en Windows**, correr `03-verify.ps1` otra vez desde otra máquina de la red:

```bash
powershell -ExecutionPolicy Bypass -File .\03-verify.ps1 -BaseUrl "http://192.168.1.100:8080"
```

Esto prueba de una sola vez las tres cosas que ningún paso anterior prueba: que arranca solo, que no necesita sesión de usuario, y que el firewall y la red dejan pasar a los clientes.

Prueba final, opcional pero recomendada — matar el proceso y ver que revive:

```bash
Stop-Process -Name java -Force
```

En 15 segundos WinSW debe haberlo relanzado.

---

# El APK para las tablets

Después de que el backend esté arriba **y con la IP ya fija**.

### 1. Apuntar el frontend al servidor

En `frontend\.env`:

```
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080
```

### 2. Compilar

```bash
npx eas build --platform android --profile preview
```

Requiere cuenta de Expo (el `projectId` ya está en `app.json`). Al terminar da un link para descargar el `.apk`.

Sin conexión a la nube, la alternativa local es `npx expo run:android --variant release`, que necesita Android Studio y el SDK instalados.

### 3. Instalar en cada tablet

Copiar el `.apk`, abrirlo, y aceptar "Instalar apps de fuentes desconocidas" cuando Android lo pida.

### Dos cosas que ya quedaron configuradas en el repo

- **`usesCleartextTraffic: true`** (`app.json`). Android bloquea HTTP sin TLS en builds de release desde Android 9. El backend habla HTTP plano, así que sin esto el APK no conecta con nada — y el síntoma es engañoso: no sale error, las pantallas simplemente aparecen vacías, porque `apiService.retrieveData` se traga los errores de red que no traen respuesta HTTP.
- **`buildType: apk`** (`eas.json`, perfil `preview`). Sin esto EAS genera un `.aab`, que no se puede instalar a mano.

### Qué esperar al abrir la app

| Pantalla | Estado |
|---|---|
| Inventario, Almacenes, Detalles, Búsqueda | Completas, con los ~37 mil productos |
| Semáforo, Entregables, No aptos | **Casi vacías, y es lo correcto** |
| Refrigeradores | Vacía hasta que haya sensores |

El Semáforo depende de que en Aspel se capture **lote y fecha de caducidad** al registrar entradas. Hoy hay muy pocos registros con ese dato, así que la pantalla sale casi vacía. **No es una falla del despliegue**: es la conversación operativa con BAMX que está documentada en `CLAUDE.md` (sección "Estado real de los datos en BAMX").

---

# Operación diaria

### Ver el estado

```bash
Get-Service bamx-backend
```

### Ver los logs

```bash
Get-Content C:\BAMX\logs\bamx-backend.out.log -Tail 50 -Wait
```

Se rotan solos: a diario a medianoche y cada 10 MB. Los viejos se acumulan con fecha en el nombre; conviene borrar los de más de un par de meses de vez en cuando.

### Reiniciar

```bash
Restart-Service bamx-backend
```

### Actualizar a una versión nueva

En tu máquina: `01-build.ps1`. Copiar el jar nuevo a `deploy\dist\`. En la de BAMX:

```bash
powershell -ExecutionPolicy Bypass -File .\04-update.ps1
```

Para, respalda el jar actual con fecha, copia el nuevo y arranca. **Si el jar nuevo no levanta en 90 segundos, restaura el anterior solo y vuelve a arrancar** — una actualización mala no deja a BAMX sin servicio.

Si además cambió el `.env` (la IP, el secreto): `.\04-update.ps1 -ConEnv`.

### Desinstalar

```bash
powershell -ExecutionPolicy Bypass -File .\99-uninstall.ps1
```

Quita el servicio y la regla de firewall, conservando logs y `.env` por si hay que diagnosticar. Con `-BorrarArchivos` borra también `C:\BAMX`. Aspel y Firebird quedan intactos.

---

# Cuando algo falla

### El servicio arranca y se cae de inmediato

Casi siempre es el `.env`. Empezar por:

```bash
Get-Content C:\BAMX\logs\bamx-backend.out.log -Tail 80
```

| Mensaje en el log | Causa | Solución |
|---|---|---|
| `Could not resolve placeholder 'JWT_SECRET'` | **No está encontrando el `.env`** | Verificar que existe `C:\BAMX\app\.env` y que `bamx-backend.xml` tiene `<workingdirectory>%BASE%</workingdirectory>` |
| `Bad port: '${DATABASE_PORT_AUTH}' is not a number` | Lo mismo de arriba | Ídem |
| `Connection refused` / `Unable to complete network request` | Firebird no está arriba o el puerto está cerrado | `Get-Service *irebird*` y `Test-NetConnection localhost -Port 3050` |
| `I/O error ... No such file or directory` | La ruta del `.FDB` está mal | Revisar `DATABASE_PATH_*`, con `/` y sin errores de dedo |
| `Your user name and password are not defined` | Contraseña de SYSDBA equivocada | Pedirla a quien administra Aspel |
| `Port 8080 was already in use` | Otro programa tomó el puerto | `SERVER_PORT=8081` en el `.env` y reinstalar la regla de firewall |

**El caso del `.env` invisible merece explicación**, porque es el más confuso de todos. La aplicación busca su configuración con `spring.config.import=optional:file:.env[.properties]`, que resuelve la ruta **relativa al directorio de trabajo del proceso**. Un servicio de Windows arranca por defecto en `C:\Windows\System32`. Al ser un import `optional:`, no falla al no encontrarlo: sigue arrancando y revienta más adelante con un error de placeholder que no menciona el `.env` por ningún lado. Por eso el XML fija `<workingdirectory>%BASE%</workingdirectory>`.

### Las tablets no conectan pero desde la PC sí funciona

En orden de probabilidad:

1. **Firewall** — `Get-NetFirewallRule -DisplayName "BAMX Backend API*"`
2. **Aislamiento de clientes en el WiFi** — muchos access points, sobre todo en redes de invitados, bloquean el tráfico entre dispositivos aunque el firewall esté abierto. Se detecta probando desde la tablet, nunca desde la PC. La prueba rápida es abrir `http://<ip>:8080/api/public/fotos-inventarios/x` en el navegador de la tablet: si da 404, la red deja pasar.
3. **Subredes distintas** — que la tablet y la PC estén en el mismo rango de IP.
4. **`usesCleartextTraffic`** — si el APK se compiló sin ese ajuste, Android bloquea el HTTP en silencio.

### Las fotos de producto no cargan

Sin gravedad, la app dibuja un icono por línea de producto. Dos causas: `APP_IMAGES_PATH` apunta a la empresa equivocada (`Empresa01` en vez de `Empresa03`), o le falta el `/` final.

Ojo con un detalle: el endpoint de fotos es **público**, corre sin token, y sin token el sufijo de empresa cae al valor por defecto `01`. Por eso ese endpoint consulta `FOTO_INVE01` aunque los datos vivan en la empresa 03. El preflight verifica que esa tabla exista.

### Cuándo aparecen los errores de esquema

`application.properties` declara `spring.jpa.hibernate.ddl-auto=validate`, pero los `EntityManagerFactory` se construyen a mano en `EmpresaDbConfig` y `AuthDbConfig` con su propio mapa de propiedades, que no incluye esa. En la práctica **no hay que dar por hecho que valide el esquema al arrancar**: un desajuste de tablas o columnas se va a manifestar como error 500 al usar una pantalla, no como un fallo limpio de arranque. Por eso el paso 4 de `03-verify.ps1` (login + consulta real de inventario) importa tanto: es lo que de verdad prueba que el esquema responde.

---

# Si Aspel está en otra computadora

El preflight lo detecta y lo avisa. Cambian cuatro cosas:

1. **En la máquina de Aspel**: dejar vacío `RemoteBindAddress` en `firebird.conf` y abrir el puerto 3050 en el firewall **solo para la IP del servidor de la app**, nunca para toda la red.
2. **En el `.env`**: `DATABASE_HOST_EMPRESA` y `DATABASE_HOST_AUTH` con la IP de la máquina de Aspel.
3. **El `<depend>` del XML**: el instalador lo quita solo al no encontrar Firebird local. Los reintentos escalonados cubren el arranque.
4. **`APP_IMAGES_PATH`**: quedaría en una ruta de red `\\servidor\...`, y **`LocalSystem` no puede leer recursos compartidos de red**. O se corre el servicio con una cuenta de dominio (`<serviceaccount>` en el XML), o se copia la carpeta de imágenes localmente, o se acepta que las fotos no carguen y la app dibuje los iconos.

---

# Deuda conocida

Esta entrega es **solo despliegue**: no se modificó el backend. Lo siguiente queda documentado a propósito, no arreglado.

| # | Punto | Riesgo real hoy |
|---|---|---|
| 1 | `SecurityConfig` con `permitAll("/**")` y CORS `*` | La autorización real la aplica `JwtAuthenticationFilter`. Mitigado porque la API solo vive en la LAN. **Nunca abrir este puerto a internet ni hacerle port forwarding.** |
| 2 | Sin endpoint de health ni Actuator | Se usa el truco del 404. Un `/api/public/health` de cinco líneas lo haría explícito. |
| 3 | Sin logging a archivo desde la app | Se depende de que WinSW capture stdout. No hay control de niveles. |
| 4 | HikariCP sin configurar: hasta 20 conexiones a Firebird | 10 por datasource. Debería aguantar, pero vale la pena vigilarlo la primera semana. |
| 5 | `TOKEN_BLOCK_LIST` no existe | El logout responde 200 pero no invalida el token; sigue vivo hasta 10 minutos. |
| 6 | Axios sin timeout | Si el backend se cae, las peticiones de la tablet quedan colgadas en vez de dar error. |
| 7 | `criticalDate`/`warningDate` invertidos en `InveService` | Latente; no se manifiesta con los datos actuales. |

---

## Referencia rápida de los scripts

| Script | Dónde | Admin | Qué hace |
|---|---|---|---|
| `00-preflight.ps1` | BAMX | no | Diagnostica. No modifica nada. |
| `01-build.ps1` | desarrollo | no | Compila el jar. |
| `02-install.ps1` | BAMX | **sí** | Instala el servicio. |
| `03-verify.ps1` | ambas | no | Prueba de humo end-to-end. |
| `04-update.ps1` | BAMX | **sí** | Actualiza el jar, revierte solo si falla. |
| `99-uninstall.ps1` | BAMX | **sí** | Desinstala. No toca Aspel. |

Los `.ps1` están escritos **sin acentos** a propósito: PowerShell 5.1 lee los scripts como ANSI cuando no traen BOM, y los acentos se verían rotos en máquinas con otra configuración regional.
