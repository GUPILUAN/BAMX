# Demo de BAMX en una laptop desde cero

Objetivo: que en una laptop Windows **sin nada instalado** corra la app completa
—inventario real de Aspel incluido— dentro de un emulador de tablet Android, para
enseñársela a la directora.

Este documento está escrito para que lo ejecute una sesión de Claude Code en la
laptop, pero se puede seguir a mano.

---

## Cómo queda la demo

```
   LAPTOP
   ┌──────────────────────────────────────────────────────────┐
   │                                                          │
   │  Firebird 2.5 portable  :3050                            │
   │      └── C:\BAMX-DEMO\db\SAE80EMPRE03.FDB  (inventario)  │
   │      └── C:\BAMX-DEMO\db\PERFILES.FDB      (usuarios)    │
   │                    ▲                                     │
   │                    │ Jaybird                             │
   │  Backend Spring    │                                     │
   │  java -jar ...     :8080                                 │
   │                    ▲                                     │
   │                    │ HTTP                                │
   │  Metro / Expo      :8081                                 │
   │                    ▲                                     │
   │  ┌─────────────────┼──────────────────┐                  │
   │  │ Emulador Android (Medium Tablet)   │                  │
   │  │   Expo Go ── llama a 10.0.2.2:8080 │                  │
   │  └────────────────────────────────────┘                  │
   └──────────────────────────────────────────────────────────┘
```

**No se instala Aspel.** La laptop solo necesita los archivos `.FDB` y un Firebird
que los sirva. La app nunca escribe en ellos.

**`10.0.2.2` no es un typo.** Es la dirección con la que el emulador de Android
alcanza el `localhost` de la laptop. Adentro del emulador, `localhost` es el
emulador mismo, y ahí no hay backend. Este es el error número uno de esta demo.

---

## Línea de tiempo

Lo que tarda es **Android Studio** (~4 GB entre programa, SDK e imagen de
sistema). Todo lo demás son minutos.

### Hoy en la noche (~45 min de trabajo, el resto es descarga)

| # | Paso | Tiempo |
|---|---|---|
| 0 | En **esta** computadora: armar el kit | ~5 min |
| 1 | En la laptop: lanzar la descarga de Android Studio y **dejarla corriendo** | 30-60 min de descarga |
| 2 | Copiar el kit a la laptop (USB o nube) | 5-20 min |
| 3 | Preparar la laptop (script) | ~10 min |
| 4 | `npm install` del frontend | ~5 min |
| 5 | Crear el AVD Medium Tablet y **abrir la app una vez** | ~15 min |

El paso 5 es obligatorio hacerlo hoy: la primera vez, Expo descarga e instala
Expo Go dentro del emulador, y Metro compila el bundle desde cero (1-3 min).
Mañana ya está en caché.

### Mañana antes de la demo (~10 min)

Checklist al final de este documento.

---

## Paso 0 — En esta computadora: armar el kit

```powershell
.\deploy\scripts\10-armar-kit-demo.ps1
```

Deja en el Escritorio una carpeta `BAMX-DEMO-KIT` (~1.2 GB) con todo adentro:
respaldos de las bases, el backend compilado, Firebird portable, Java portable,
Node portable, las imágenes de producto y una copia del repo.

El respaldo se hace con `gbak`, que saca una copia consistente **sin parar el
servicio de Firebird y sin escribir nada** en la base de Aspel.

Si el internet donde vas a demostrar es malo, agrega `-ConNodeModules` para no
depender de `npm install` (son 900 MB más y tarda bastante en copiarse).

---

## Paso 1 — En la laptop: Android Studio primero

Es lo que tarda. **Lánzalo antes que cualquier otra cosa** y sigue con los
demás pasos mientras descarga.

```powershell
winget install Google.AndroidStudio
```

Si `winget` no existe (Windows 10 viejo), bájalo de
<https://developer.android.com/studio>.

Aprovecha e instala Node, que se necesita para Expo y para Claude Code:

```powershell
winget install OpenJS.NodeJS.LTS
```

> El kit trae Node portable en `node\` como respaldo si no hay internet, pero la
> instalación normal es más cómoda porque deja `npm` en el PATH.

Y si vas a usar Claude Code en la laptop, después de instalar Node:

```powershell
npm install -g @anthropic-ai/claude-code
```

### El emulador necesita virtualización

Si al arrancar el AVD sale un error de HAXM/WHPX, falta habilitar la
virtualización. Como administrador:

```powershell
dism /online /Enable-Feature /FeatureName:HypervisorPlatform /All /NoRestart
dism /online /Enable-Feature /FeatureName:VirtualMachinePlatform /All /NoRestart
```

Y reiniciar. Si sigue fallando, hay que habilitar VT-x / SVM en la BIOS. **Esto
descúbrelo hoy, no mañana** — es el único problema de esta lista que puede
obligarte a cambiar de plan (ver Plan B).

---

## Paso 2 — Copiar el kit

Copia `BAMX-DEMO-KIT` a la laptop y **renómbrala** a:

```
C:\BAMX-DEMO
```

La ruta importa: el archivo `app\.env` ya trae escritas rutas
`C:/BAMX-DEMO/db/...`. Si la pones en otro lado, hay que editar ese `.env`.

> **El kit trae datos de BAMX, no solo software.** Adentro van el inventario
> completo, la tabla de usuarios de la app y las contraseñas de base de datos
> del `.env`. Pásalo por USB o por un enlace privado. Nada de subirlo a un
> servicio de transferencia con enlace público, y bórralo de la laptop cuando
> termine la demo.

---

## Paso 3 — Preparar la laptop

Abre PowerShell **como administrador** y corre:

```powershell
Get-ChildItem C:\BAMX-DEMO -Recurse -Filter *.ps1 | Unblock-File
powershell -ExecutionPolicy Bypass -File C:\BAMX-DEMO\repo\deploy\scripts\11-preparar-laptop.ps1
```

> **Las dos líneas importan, y por razones distintas.**
>
> Windows trae la ejecución de scripts desactivada de fábrica: llamar al `.ps1`
> directo falla con *"running scripts is disabled on this system"*. Por eso el
> `-ExecutionPolicy Bypass -File`, que aplica solo a esa corrida y no cambia
> nada del sistema.
>
> Y todo archivo que llega en USB o descarga trae una marca de "viene de otra
> máquina" que lo bloquea aunque la política lo permita. `Unblock-File` se la
> quita.
>
> Lo de administrador: en el camino normal no hace falta, pero si Firebird no
> autentica (ver la sección de fallas) el script puede arreglarlo solo, y para
> eso sí necesita permisos. Ir con admin desde el principio ahorra repetir.

Levanta Firebird portable, restaura las dos bases y verifica con consultas
reales que traen datos.

Al final debe imprimir algo como:

```
  [ok]   Productos en catalogo: 37199
  [ok]   Productos con existencia: 39
  [ok]   Lotes activos (esto alimenta el Semaforo): 36
  [ok]   Almacenes: 11
  [ok]   Usuarios para login: 3
```

Si "Lotes activos" sale 0, el Semáforo se verá vacío — mira la sección de lotes
sembrados más abajo.

**Deja abierta la ventana de Firebird** que se abre. Es la base de datos.

---

## Paso 4 — Dependencias del frontend

```powershell
cd C:\BAMX-DEMO\repo\frontend
npm install
```

Verifica que `.env` quedó bien (lo escribe el script del paso 3):

```powershell
type C:\BAMX-DEMO\repo\frontend\.env
```

Tiene que decir `EXPO_PUBLIC_API_URL=http://10.0.2.2:8080`.

---

## Paso 5 — El emulador

1. Abre Android Studio → **More Actions** → **Virtual Device Manager**
2. **Create Device** → categoría **Tablet** → **Medium Tablet** → Next
3. Imagen de sistema: **API 35** (o 34) con **Google APIs**, arquitectura
   **x86_64**. Descárgala ahí mismo (~1.5 GB).
4. Nombre: `BAMX-Tablet`. Finish.
5. Arráncalo con ▶ y déjalo llegar al escritorio de Android.

La app está fijada en **horizontal** (`orientation: landscape` en `app.json`),
así que se va a ver bien en tablet. Si el emulador queda vertical, rótalo con
`Ctrl + →` y activa la auto-rotación en el emulador.

### Que Expo encuentre el emulador

Expo busca `adb` a través de `ANDROID_HOME`. Android Studio no siempre la deja
puesta:

```powershell
$sdk = "$env:LOCALAPPDATA\Android\Sdk"
[Environment]::SetEnvironmentVariable('ANDROID_HOME', $sdk, 'User')
$rutaUsuario = [Environment]::GetEnvironmentVariable('Path', 'User')
[Environment]::SetEnvironmentVariable('Path', "$rutaUsuario;$sdk\platform-tools", 'User')
```

> No uses `setx PATH "$env:PATH;..."` para esto. `setx` corta a 1024 caracteres
> y `$env:PATH` trae mezclado el PATH del sistema, así que te copia el del
> sistema al del usuario y encima lo trunca. Es una forma clásica de romperle
> el PATH a una máquina.

Cierra y vuelve a abrir la terminal. Comprueba:

```powershell
adb devices
```

Debe listar un `emulator-5554  device`.

---

## Paso 6 — Arrancar y probar

Backend (abre dos ventanas que hay que dejar abiertas):

```powershell
powershell -ExecutionPolicy Bypass -File C:\BAMX-DEMO\repo\deploy\scripts\12-arrancar-demo.ps1 -Usuario Alexito
```

Te va a pedir tu contraseña (la misma de Aspel) y con ella hace la prueba de
verdad: login real y consulta real al inventario. Si imprime nombres como
`FRUTA A GRANEL`, la cadena completa funciona.

Frontend:

```powershell
cd C:\BAMX-DEMO\repo\frontend
npx expo start
```

Con el emulador ya abierto, teclea **`a`**. La primera vez descarga e instala
Expo Go en el emulador y compila el bundle: 1-3 minutos. Después es instantáneo.

> Esta app **sí corre en Expo Go**, ya verificado: todos sus módulos nativos
> —Skia, Reanimated 4, worklets, gesture-handler, svg, secure-store— están en
> `expo/bundledNativeModules.json` del SDK 54, que es la lista de lo que trae
> Expo Go. `victory-native` y `mqtt` no aparecen ahí porque son JavaScript puro
> (victory se dibuja sobre Skia), así que tampoco necesitan build nativo.
> **No hace falta development build ni compilar con Gradle.**

Entra con tu usuario (`Alexito` o el que uses en Aspel) y recorre las pantallas.

---

## Cómo saber si estás viendo datos reales

Esto es importante y no es obvio. El frontend tiene un respaldo silencioso: si
la llamada al API falla, `useFetchLotes` cae a datos inventados en vez de
mostrar un error.

```
frontend/hooks/useFetchLotes.ts:19
   setLotes(data?.content || productosDummy.items);
```

Así que la app puede verse perfecta **estando el backend caído**.

| Lo que ves | Qué significa |
|---|---|
| "Manzanas", "Plátano", claves `PROD001` | Datos **falsos**. El backend no responde. |
| "FRUTA A GRANEL", "VERDURA A GRANEL", "JAMON A GRANEL KG", claves `FRUT000GR` | Datos **reales** de Aspel. |

Revísalo antes de que entre la directora.

---

## Los lotes del Semáforo son sembrados — dilo

De los 37,199 productos del catálogo, la tabla de lotes (`LTPD`) de BAMX tiene
**6 filas en total**, y de esas una sola trae fecha de caducidad capturada de
verdad — de 2023, ya vencida. El Semáforo depende 100% de esa tabla, así que con
los datos crudos se vería prácticamente vacío.

Por eso la base de la demo trae **30 lotes sembrados** (`scripts/seed-demo-lotes.sql`,
rango `REG_LTPD` 1001-1099) repartidos en los tres estados.

Preséntalo como lo que es: **"así se va a ver cuando capturen lote y caducidad
en Aspel"**, no como "así está su inventario hoy". Es una diferencia que la
directora va a preguntar tarde o temprano, y es mejor que salga de ti.

Es más: el hueco es un buen argumento de la demo. El Semáforo vacío en producción
no es una falla de la app, es la señal de que el proceso de captura se está
saltando la ventana de lote en Aspel. La app lo vuelve visible.

### Recolocar los lotes el día de la demo

El seed usa fechas relativas a `CURRENT_DATE` y es idempotente. Correrlo de
nuevo reacomoda los 30 lotes en su estado correcto:

```powershell
$env:FIREBIRD = "C:\BAMX-DEMO\firebird"
& "C:\BAMX-DEMO\firebird\bin\isql.exe" -user sysdba -password masterkey `
  -i "C:\BAMX-DEMO\repo\scripts\seed-demo-lotes.sql" `
  "localhost:C:\BAMX-DEMO\db\SAE80EMPRE03.FDB"
```

Está diseñado con holgura para aguantar 1-2 días sin recolocarse, así que es
opcional. Si lo corres, reinicia el backend para que no sirva caché.

---

## Checklist de la mañana

10 minutos, en este orden:

1. `12-arrancar-demo.ps1 -Usuario <tu usuario>` → espera el `[ok] Healthcheck 404`
   y los nombres de producto reales.
2. Abre el AVD `BAMX-Tablet` en Android Studio.
3. `cd C:\BAMX-DEMO\repo\frontend` → `npx expo start` → tecla `a`.
4. Entra a la app y confirma que dice **FRUTA A GRANEL**, no "Manzanas".
5. Pon la laptop en **no suspender** (Configuración → Energía) y silencia
   notificaciones.
6. Deja las tres ventanas abiertas: Firebird, backend, Metro.

---

## Qué enseñar

Orden sugerido, de lo más sólido a lo más frágil:

| Pantalla | Qué decir | Estado |
|---|---|---|
| **Inventario** | 37 mil productos del catálogo real, búsqueda y orden. Sale directo de Aspel. | Sólido, datos 100% reales |
| **Semáforo (Home)** | Prioridad por caducidad: crítico / prioritario / estable. | Datos sembrados — acláralo |
| **Entregables / No aptos** | La misma información en forma de decisión: qué sí se puede entregar hoy. | Datos sembrados |
| **Almacenes** | Distribución por bodega. | Real |
| **Detalle de producto** | Fechas, clave, línea, foto. | Real |
| **Refrigeradores** | **Sáltala.** Sin sensores instalados no hay lecturas y se ve vacía. Menciónala como lo que sigue, no la abras. | Sin hardware |

Dos frases que conviene tener listas porque van a preguntar:

- *"¿Puede capturar entradas desde la tablet?"* → No por diseño. La app **solo
  lee** de Aspel; quien captura sigue capturando en Aspel. Así ninguna operación
  desde la tablet puede afectar su contabilidad. Escribir desde la app sería una
  segunda etapa y una decisión aparte.
- *"¿Por qué el Semáforo trae pocos productos?"* → Porque solo aparece lo que
  tiene lote y caducidad capturados en Aspel. Hoy casi nadie los captura. La app
  no puede inventar esa fecha; lo que sí hace es dejar ver el hueco.

---

## Planes B

**Si el emulador no arranca** (virtualización bloqueada, laptop sin recursos):

1. **Tablet o celular Android físico.** Instala Expo Go de la Play Store, conecta
   ambos a la misma WiFi, saca la IP de la laptop con `ipconfig` (la IPv4), y en
   `frontend\.env` cambia:
   ```
   EXPO_PUBLIC_API_URL=http://<IP-de-la-laptop>:8080
   ```
   Reinicia con `npx expo start -c` (el `-c` importa: la variable se inlinea en
   el bundle) y escanea el QR. Requiere abrir el 8080 en el firewall de Windows.

2. **Navegador de la laptop.** La opción que menos se rompe:
   ```powershell
   # en frontend\.env
   EXPO_PUBLIC_API_URL=http://localhost:8080
   ```
   ```powershell
   npx expo start -c --web
   ```
   Se ve la app completa en el navegador. Pierdes el efecto "tablet" pero no
   depende de emulador, WiFi ni IPs. **Ten esto probado como respaldo aunque uses
   el emulador.**

---

## Cuando algo falla

### El backend arranca y se muere de inmediato

Mira la ventana negra. Si dice `Could not resolve placeholder 'JWT_SECRET'`, el
problema **no es el JWT**: es que no encontró `app\.env`.

El archivo se busca **relativo al directorio de trabajo del proceso**, y el
import está marcado `optional:`, así que cuando no lo encuentra no falla ahí
sino después, con un error que no menciona el `.env` por ningún lado. Arranca el
jar parado en `C:\BAMX-DEMO\app` (es lo que hace `12-arrancar-demo.ps1`).

### Healthcheck responde 500 en vez de 404

El 404 es el éxito esperado: prueba HTTP + pool + Jaybird + Firebird + esquema.
Un 500 significa que el backend vive pero no puede con la base:

- Revisa `DATABASE_PATH_EMPRESA` y `DATABASE_PATH_AUTH` en `app\.env`.
- Van con diagonal normal `/`, nunca `\` (Spring lee ese archivo como
  `.properties` y `\` es carácter de escape).
- Verifica que Firebird siga arriba: `Test-NetConnection 127.0.0.1 -Port 3050`.

### La app abre pero todas las pantallas salen vacías

Es la firma de que no alcanza el backend. `apiService.retrieveData` se traga los
errores de red que no traen `response`, así que no verás ningún mensaje.

1. Desde la laptop:
   ```powershell
   curl.exe -i http://localhost:8080/api/public/fotos-inventarios/x
   ```
   Debe dar `404`, no "connection refused". Usa `curl.exe` con extensión: en
   PowerShell `curl` a secas es un alias de `Invoke-WebRequest`, que se
   comporta distinto y lanza excepción con un 404.
2. Desde el emulador, `10.0.2.2` es la laptop. Si cambiaste el `.env`, reinicia
   con `npx expo start -c`.
3. Alternativa a `10.0.2.2`: `adb reverse tcp:8080 tcp:8080` y usa
   `http://localhost:8080` en el `.env`.

### El inventario responde vacío pero el login funciona

Sufijo de empresa mal. `APP_EMPRESA_SUFFIX` debe ser `03` — la empresa `01` de
Aspel está vacía. Cámbialo en `app\.env` y reinicia el backend.

### Firebird escucha en el 3050 pero rechaza el login

Síntoma: `gbak` muere de inmediato con `SQLSTATE = 28000 — Your user name and
password are not defined`, aunque la contraseña sea la correcta.

Causa, verificada en pruebas: **Firebird 2.5 en Windows decide su carpeta raíz
mirando primero el registro**, no la variable `FIREBIRD`. En una máquina que ya
tenía Firebird instalado, el `fbserver.exe` portable termina usando el
`security2.fdb` de esa otra instalación —que el servicio existente tiene abierto
en exclusiva— y entonces ningún usuario existe para él.

En una laptop limpia no hay registro y esto no pasa. Si pasa,
`11-preparar-laptop.ps1` lo detecta y lo arregla solo: registra **esta** copia de
Firebird como servicio con sus propios `instreg.exe` / `instsvc.exe`, que es lo
mismo que hace el instalador oficial. Necesita PowerShell **como
administrador**; si no lo eres, te lo dice y no hace nada a medias.

Si aun así falla, casi siempre es que hay otro Firebird corriendo:

```powershell
Get-Service *Firebird*
```

Plan B: instala Firebird **2.5.9** de <https://firebirdsql.org/en/firebird-2-5/>
(tiene que ser 2.5; las versiones nuevas no abren estos archivos) y vuelve a
correr `11-preparar-laptop.ps1`.

### Firebird no abre el 3050 en absoluto

Windows pudo haber mostrado una alerta de firewall al arrancar `fbserver.exe`.
La demo es local, así que puedes cancelarla sin problema — lo que no puede es
morirse el proceso. Si la ventana de Firebird se cerró, vuelve a correr el
script.

### `npx expo start` no encuentra el emulador

`adb devices` vacío → falta `ANDROID_HOME` (ver Paso 5) o el AVD no está
corriendo. Ábrelo desde Android Studio antes de teclear `a`.

---

## Si además quieres desarrollar en la laptop, no solo demostrar

Esto no es exactamente lo mismo. Lo que el kit deja listo, tal cual:

| Pieza | Qué queda | ¿Puedes desarrollar? |
|---|---|---|
| **Frontend** | Código + `.git` + Expo/Metro | **Sí, completo.** Editas y ves el cambio en caliente en el emulador. `npm test` corre. |
| **Base de datos** | Las dos bases reales servidas por Firebird | **Sí.** Consultas con `isql`, mismo esquema que BAMX. |
| **Backend** | El `.jar` ya compilado corriendo | **Runtime, no build.** El código fuente sí va, pero compilar pide dos pasos más (abajo). |
| **Repo** | Clon real, con historia y la rama | **Sí.** Puedes hacer commits, ramas y `git pull`. |

Lo que **no** va en el kit: Aspel SAE (el ERP en sí, no hace falta), broker MQTT
para los refrigeradores, `node_modules` (se instala con `npm install`), y la
toolchain nativa de Android — para desarrollar basta Expo Go, solo necesitarías
Gradle si algún día agregas un módulo nativo que Expo Go no traiga.

### Para compilar el backend desde el código en la laptop

```powershell
$env:JAVA_HOME = "C:\BAMX-DEMO\runtime"
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
cd C:\BAMX-DEMO\repo\backend
.\mvnw.cmd spring-boot:run
```

Dos cosas: el wrapper de Maven **descarga Maven la primera vez**, así que ese
primer arranque necesita internet; y `backend\.env` ya viene apuntado a las
rutas de `C:\BAMX-DEMO`, así que levanta contra la misma base restaurada sin
tocar nada. Apaga antes el jar del paso 6 o se pelean por el 8080.

Para los tests del backend, `.\mvnw.cmd test` corre contra H2, sin Firebird.

---

## Cómo desmontar todo

Cierra las ventanas de Firebird, backend y Metro, y borra `C:\BAMX-DEMO`.

Eso basta en el camino normal: Firebird corre en modo aplicación, Java y Node
salen de carpetas, y no se toca el registro ni el PATH.

**Solo si el script tuvo que registrar Firebird como servicio** (te lo habría
dicho en pantalla), agrega antes, como administrador:

```powershell
& 'C:\BAMX-DEMO\firebird\bin\instsvc.exe' remove
& 'C:\BAMX-DEMO\firebird\bin\instreg.exe' remove
```

Android Studio y Node sí quedan instalados, porque son instaladores normales.
Se quitan desde Aplicaciones de Windows si no los quieres.

---

## Para la sesión de Claude en la laptop

Pégale esto:

```
Estoy preparando una demo de la app de BAMX para mañana. La laptop no tiene
nada instalado salvo lo que yo ya haya alcanzado a instalar.

Lee C:\BAMX-DEMO\repo\deploy\DEMO-LAPTOP.md completo y ejecútalo desde el
paso 2. Antes de cada paso dime qué vas a hacer. Si algo falla, usa la sección
"Cuando algo falla" antes de improvisar.

Al terminar quiero ver la app corriendo en el emulador con datos reales de
Aspel (FRUTA A GRANEL, no "Manzanas").
```

---

## Referencia rápida

| Cosa | Dónde |
|---|---|
| Kit completo | `C:\BAMX-DEMO` |
| Bases restauradas | `C:\BAMX-DEMO\db\*.FDB` |
| Config del backend | `C:\BAMX-DEMO\app\.env` |
| Config de Expo | `C:\BAMX-DEMO\repo\frontend\.env` |
| Backend | `http://localhost:8080` |
| Backend visto por el emulador | `http://10.0.2.2:8080` |
| Metro | `http://localhost:8081` |
| Firebird | `127.0.0.1:3050`, sysdba / masterkey |
| Healthcheck | `GET /api/public/fotos-inventarios/__healthcheck__` → 404 = bien |

Para el despliegue de verdad en la computadora de BAMX (servicio de Windows,
IP fija, APK), ese es otro documento: [`deploy/README.md`](README.md).
