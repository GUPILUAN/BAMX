# Despliegue del backend BAMX en Windows

Manual para instalar el backend como **servicio de Windows** en la computadora de BAMX, conectado a la base Firebird de Aspel SAE, arrancando solo al encender el equipo.

> **La app es de solo lectura contra Aspel.** No escribe una sola fila en `INVE`, `LTPD`, `MINVE` ni ninguna tabla del ERP. Instalarla no puede afectar la contabilidad ni el inventario, y desinstalarla deja la máquina exactamente como estaba.

> **¿Buscas correr la app en una laptop para enseñarla, no para dejarla instalada?**
> Ese es otro documento: [`DEMO-LAPTOP.md`](DEMO-LAPTOP.md). Levanta todo —bases
> incluidas— en una máquina sin Aspel ni Firebird, dentro de un emulador de
> tablet Android, sin instalar nada permanente.

---

## Cómo queda instalado

```
Computadora de BAMX (Windows Server 2016 o posterior, 64 bits)
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
| **Windows Server 2016 o posterior** | Oracle certifica el JDK 25 en Server 2016, 2019, 2022, 2025 y Windows 11. Server 2012 R2 no está en la lista y ya no recibe parches de Microsoft | paso 1 |
| Firebird corriendo en 3050 | Es de donde salen los datos | pasos 4-5 |
| Permisos de Administrador | Para registrar un servicio y abrir el firewall | — |
| **IP fija** | La URL se quema dentro del APK — ver abajo | paso 13 |
| **Red clasificada como Privada** | Si Windows la tiene como Pública, la regla de firewall no aplica | paso 13 |
| ~500 MB libres | jar + JDK portable + logs | — |

**No hace falta .NET Framework.** `WinSW-x64.exe` es el build *self-contained* de WinSW: trae su propio runtime de .NET Core adentro (por eso pesa 18 MB). Solo `WinSW.NET461.exe` dependería del .NET Framework de la máquina. El paso 2 del preflight es informativo. (Corrección: una versión anterior de este manual lo listaba como requisito.)

### La IP fija no es opcional

`EXPO_PUBLIC_API_URL` se **inlinea en tiempo de compilación** del APK: la dirección del servidor queda escrita dentro del archivo instalado en cada tablet. Si la computadora cambia de IP porque el router le dio otra, **todas las tablets dejan de funcionar al mismo tiempo** y la única salida es recompilar el APK y reinstalarlo en cada una.

Antes de generar el APK hay que fijar la IP. Lo más limpio es una **reserva DHCP en el router** (asocia la MAC de la PC a una IP fija sin riesgo de conflictos). La alternativa es IP estática en la tarjeta de red.

---

## Qué llevar en la USB

En el repo viajan solo los archivos de texto. El material pesado va en `deploy\dist\` (carpeta ignorada por git). Se copia a la USB **toda la carpeta `deploy\`**:

```
deploy\
├── README.md                      ← este archivo (del repo)
├── winsw\bamx-backend.xml         ← del repo
├── env\.env.produccion.example    ← del repo
├── scripts\*.ps1                  ← del repo
└── dist\                          ← NO está en git: se arma en la máquina de desarrollo
    ├── bamx-backend.jar               (1) 01-build.ps1
    ├── WinSW-x64.exe                  (2) descargado, v2.12.0
    ├── runtime\bin\java.exe           (3) JDK 25 portable
    ├── .env                           (4) pre-armado; se CONFIRMA en sitio
    └── apk\BAMX-<ip>-<puerto>-*.apk   (5) 05-build-apk.ps1, con la IP del servidor
```

Para revisar sin instalar nada que el material y el `.env` están completos (no pide Administrador):

```bash
powershell -ExecutionPolicy Bypass -File deploy/scripts/02-install.ps1 -SoloValidar
```

Cómo se regenera cada pieza:

**(1) El jar** — en la máquina de desarrollo:

```bash
powershell -ExecutionPolicy Bypass -File deploy/scripts/01-build.ps1
```

Compila una **copia limpia del último commit** (no la carpeta `backend\`): lo que se instala corresponde exactamente a un commit, y el IDE o el backend de desarrollo, que comparten `backend\target`, no pueden romper el build a medio camino. Si hay cambios del backend sin commitear, avisa que no van a entrar. Con `-DesdeCarpeta` compila `backend\` tal cual.

**(2) WinSW** — `WinSW-x64.exe` de la release **v2.12.0**:
<https://github.com/winsw/winsw/releases/tag/v2.12.0>
Se guarda en `deploy\dist\` tal cual, sin renombrar (el instalador lo renombra solo). Tamaño esperado: 18,243,033 bytes. SHA256:

```
05b82d46ad331cc16bdc00de5c6332c1ef818df8ceefcd49c726553209b3a0da
```

Para comprobarlo en cualquier máquina: `Get-FileHash dist\WinSW-x64.exe`.

**(3) JDK 25 portable** — cualquiera de estos dos sirve:

- Copiar un JDK 25 ya instalado (así se armó el `dist` actual, con el Oracle JDK 25.0.2 bajo su licencia gratuita NFTC), sin `jmods` ni `lib\src.zip`, que solo sirven para desarrollar:

  ```powershell
  robocopy "C:\Program Files\Java\jdk-25.0.2" deploy\dist\runtime /E /XD jmods include /XF src.zip
  ```

- O bajar el **.zip** de Temurin JDK 25 (LTS), Windows x64: <https://adoptium.net/temurin/releases/?version=25&os=windows&arch=x64&package=jdk>

Se usa una carpeta portable y no un instalador `.msi` a propósito: no toca el PATH ni el registro, no choca con nada que Aspel necesite, y evita el problema clásico de que el servicio corre como `LocalSystem` y `LocalSystem` no ve el `JAVA_HOME` del usuario.

⚠️ **Sin carpeta contenedora.** El resultado correcto es:

```
dist\runtime\bin\java.exe        ✅
dist\runtime\jdk-25.0.2\bin\...  ❌  (sobra un nivel)
```

**(4) El `.env`** — viene **pre-armado** desde `env\.env.produccion.example`: con un `JWT_SECRET` nuevo (48 bytes de un generador criptográfico) y las rutas de una instalación estándar de Aspel con la empresa 03. **En sitio no se escribe desde cero: se compara contra lo que imprime el preflight** y se corrige lo que difiera (paso 2). Si se necesita uno nuevo, ver el paso 2.

**(5) El APK** — ver [El APK para las tablets](#el-apk-para-las-tablets). Necesita la IP fija del servidor: si ya se conoce, conviene compilarlo antes de ir.

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

En un servidor es común que los datos de Aspel no estén en `C:\Program Files (x86)\Common Files\Aspel` sino en otra unidad. Si el preflight no encuentra los `.FDB`, se buscan a mano (`Get-ChildItem D:\ -Recurse -Filter *.FDB`) y se le pasan, para que corran las consultas de sufijo, usuarios y fotos:

```bash
powershell -ExecutionPolicy Bypass -File .\00-preflight.ps1 -RutaEmpresa "D:\...\SAE80EMPRE03.FDB" -RutaPerfiles "D:\...\PERFILES.FDB"
```

**No continuar si hay BLOQUEANTES.** Los tres más probables:

| Bloqueante | Qué significa | Qué hacer |
|---|---|---|
| No se encontró la base de perfiles | Sin ella nadie puede iniciar sesión | Localizar el `.FDB` de perfiles y pasarlo con `-RutaPerfiles` |
| `isql` no pudo conectarse | La contraseña de SYSDBA no es la esperada | Pedirla a quien administra Aspel |
| La tabla `USUARIOS` está vacía | No hay a quién dejar entrar | Dar de alta usuarios antes del go-live |

Al final imprime un bloque con los valores detectados. **Ese bloque es el insumo del paso 2.**

## Paso 2 — Confirmar el `.env`

`dist\.env` ya viene pre-armado (ver "Qué llevar en la USB"). Se abre y se compara, línea por línea, contra el bloque que imprimió el preflight:

```bash
notepad ..\dist\.env
```

Lo que más probablemente cambie en sitio: las rutas (`DATABASE_PATH_*`, `APP_IMAGES_PATH`) si Aspel está en otra unidad, `DATABASE_PASSWORD_*` si SYSDBA no usa la clave por defecto, y `APP_HOST_URL` con la IP fija del servidor.

Si hiciera falta uno desde cero, se copia la plantilla y se genera un secreto nuevo:

```bash
copy ..\env\.env.produccion.example ..\dist\.env
```

```powershell
$b = New-Object byte[] 48; [Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($b); [Convert]::ToBase64String($b)
```

### Cuatro reglas que rompen el arranque

1. **Rutas con `/`, nunca con `\`.** El archivo se lee como `.properties`, donde `\` es carácter de escape.
   `C:/Program Files (x86)/...` ✅  ·  `C:\Program Files (x86)\...` ❌
2. **`APP_IMAGES_PATH` termina en `/`.** El código concatena la ruta literalmente.
3. **Ninguna variable obligatoria puede faltar**, ni siquiera `APP_HOST_URL` (hoy no la lee nadie, pero sin ella Spring no arranca).
4. **Para cambiar el puerto, la clave es `server.port`** — con punto y en minúsculas, no `SERVER_PORT`.

El instalador valida las cuatro y se niega a continuar si algo está mal, así que no hay forma de equivocarse en silencio.

### Por qué unas variables van en MAYÚSCULAS y otras con punto

Parece inconsistente y no lo es: son **dos mecanismos distintos**.

- `DATABASE_PATH_EMPRESA`, `JWT_SECRET`, `APP_IMAGES_PATH` y compañía **no se enlazan a ninguna propiedad de Spring**. `application.properties` las lee como `${PLACEHOLDER}`, y eso busca la clave **tal como está escrita**. Por eso funcionan en mayúsculas.
- `server.port` sí es una propiedad de Spring. La traducción de `MAYUSCULAS_CON_GUION` a propiedad punteada la hace **solo la fuente de variables de entorno del sistema operativo**. Este archivo entra como un `.properties` normal, donde la clave se toma literal.

Consecuencia práctica, y verificada en pruebas: con `SERVER_PORT=8081` la aplicación **arranca igual en 8080**, sin ninguna advertencia. Con `server.port=8081` sí obedece. El instalador rechaza la forma en mayúsculas para que nadie pierda una tarde con esto.

## Paso 3 — Instalar

Antes de elevar a Administrador conviene revisar que el material y el `.env` estén bien. Esto no instala nada y no pide permisos:

```bash
powershell -ExecutionPolicy Bypass -File .\02-install.ps1 -SoloValidar
```

Y la instalación de verdad:

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

Prueba nueve cosas, cada una más profunda que la anterior. Sin credenciales solo corre la mitad, y **no queda comprobado que el sufijo de empresa sea el correcto**, que es justo el error más caro de detectar tarde. Las credenciales son las de un usuario de Aspel: la app entra con los mismos usuarios.

El paso 6 además detecta un **jar viejo**: si `/api/inventarios/{clave}/almacenes` responde el 404 genérico de Spring en vez del de la app, lo instalado es anterior a ese endpoint.

## Paso 5 — La prueba de verdad: reiniciar

⚠️ **Es un servidor compartido.** Reiniciarlo saca de Aspel a todos los que estén capturando, y apaga lo que más corra ahí (carpetas compartidas, otros servicios). Se hace en una ventana acordada con BAMX, fuera de horario.

```bash
shutdown /r /t 0
```

Al volver, **sin iniciar sesión en Windows**, correr `03-verify.ps1` otra vez desde otra máquina de la red:

```bash
powershell -ExecutionPolicy Bypass -File .\03-verify.ps1 -BaseUrl "http://192.168.1.100:8080"
```

Esto prueba de una sola vez las tres cosas que ningún paso anterior prueba: que arranca solo, que no necesita sesión de usuario, y que el firewall y la red dejan pasar a los clientes.

Prueba final, opcional pero recomendada — matar el proceso y ver que revive. **No usar `Stop-Process -Name java`**: en un servidor puede haber otros programas en Java y los mataría a todos. Este filtra por la ruta de `C:\BAMX`:

```powershell
Get-CimInstance Win32_Process -Filter "Name='java.exe'" | Where-Object { $_.ExecutablePath -like 'C:\BAMX\*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }
```

En 15 segundos WinSW debe haberlo relanzado.

---

# El APK para las tablets

La URL del servidor **se quema dentro del APK al compilarlo**. Por eso se compila cuando ya se conoce la **IP fija** del servidor: si ya la pasaron, antes de ir; si no, en cuanto se conozca.

### 1. Compilar (en la máquina de desarrollo)

```bash
powershell -ExecutionPolicy Bypass -File deploy/scripts/05-build-apk.ps1 -ApiUrl http://192.168.1.100:8080
```

Necesita Node y Android Studio (trae el SDK y el JDK 17 que usa Gradle). No necesita cuenta de Expo. Lo que hace:

1. Valida la URL: `http`, con puerto, sin diagonal final, y nada de `localhost` (desde la tablet, `localhost` es la propia tablet).
2. Compila en modo **hermético**: `EXPO_NO_DOTENV=1` hace que Expo ignore `frontend\.env` (que trae la IP de desarrollo) y las `EXPO_PUBLIC_*` se pasan explícitas. Además borra la caché de Metro, que no se invalida cuando cambian esas variables.
3. `expo prebuild` + `gradlew assembleRelease`. Restaura el `package.json`, que `prebuild` reescribe.
4. **Abre el APK y verifica que la URL quedó adentro** (y que no se coló la de desarrollo). Si no, falla en vez de entregar un APK que apunta a otro lado.
5. Lo deja en `deploy\dist\apk\BAMX-<ip>-<puerto>-<fecha>.apk`.

La primera vez tarda ~10-30 min (baja el NDK y compila código nativo para cada arquitectura). Las siguientes reutilizan la caché de Gradle. El default compila `armeabi-v7a` y `arm64-v8a`, que cubre las tablets reales. Para probarlo en el emulador de Android Studio se agrega `x86_64` con `-Abis "armeabi-v7a,arm64-v8a,x86_64"`.

**Verificado el 2026-09-23** con un APK apuntando a una laptop de desarrollo, instalado en el emulador de tablet (Android 14). Con el backend arriba, un usuario inventado da "Las credenciales son incorrectas": el APK llegó al servidor por HTTP en claro. Con el backend apagado, da "No se pudo conectar con el servidor http://…".

#### Por qué no EAS en la nube (como decía una versión anterior de este manual)

`frontend\.env` está en `.gitignore`, y **EAS no sube archivos ignorados**. En la nube las `EXPO_PUBLIC_*` llegan vacías y la app cae a sus defaults: la API a `http://localhost:8080` y los refrigeradores a `broker.hivemq.com`, un broker público. El APK se instala sin error y no conecta a nada. Además `npx eas ...` resuelve al paquete npm `eas`, que no tiene nada que ver con Expo; el correcto es `npx eas-cli`.

Si algún día se necesita EAS: las variables van en `eas.json` → `build.preview.env` (o como variables de entorno de EAS), y se compila con `npx eas-cli build -p android --profile preview` desde una cuenta con acceso al `projectId` de `app.json`. Un APK de EAS se firma con otra llave que uno local: para cambiar de uno a otro hay que desinstalar la app de cada tablet primero.

### 2. Instalar en cada tablet

Copiar el `.apk`, abrirlo, y aceptar "Instalar apps de fuentes desconocidas" cuando Android lo pida. Con cable USB y depuración activada: `adb install -r <archivo.apk>`.

Para actualizar, se instala el nuevo encima (sin desinstalar). Funciona porque los builds de `05-build-apk.ps1` se firman siempre con la misma llave: la *debug* estándar de la plantilla de React Native, suficiente para distribuir a mano dentro de BAMX (si algún día va a Play Store, hará falta una llave propia).

### Tres cosas que ya quedaron configuradas en el repo

- **`usesCleartextTraffic: true`** (`app.json`). Android bloquea HTTP sin TLS en builds de release desde Android 9. El backend habla HTTP plano, así que sin esto el APK no conecta con nada.
- **`buildType: apk`** (`eas.json`, perfil `preview`). Sin esto EAS genera un `.aab`, que no se puede instalar a mano. Solo aplica si se usa EAS.
- **El login distingue "no hay servidor" de "credenciales incorrectas"**, y con timeout de 30 s. Antes una IP equivocada dejaba el botón girando un par de minutos y terminaba en "Las credenciales son incorrectas", que mandaba a buscar el problema donde no estaba. Ahora dice **"No se pudo conectar con el servidor http://…"** con la URL que quedó quemada en el APK, que es justo el dato que hace falta en sitio.

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
| `Port 8080 was already in use` | Otro programa tomó el puerto | Agregar `server.port=8081` al `.env` y reinstalar la regla de firewall — ver la nota de abajo |

**El caso del `.env` invisible merece explicación**, porque es el más confuso de todos. La aplicación busca su configuración con `spring.config.import=optional:file:.env[.properties]`, que resuelve la ruta **relativa al directorio de trabajo del proceso**. Un servicio de Windows arranca por defecto en `C:\Windows\System32`. Al ser un import `optional:`, no falla al no encontrarlo: sigue arrancando y revienta más adelante con un error de placeholder que no menciona el `.env` por ningún lado. Por eso el XML fija `<workingdirectory>%BASE%</workingdirectory>`.

### Las tablets no conectan pero desde la PC sí funciona

Primero, **leer el mensaje del login en la tablet**:

- **"No se pudo conectar con el servidor http://…"**: el problema es de red, no de contraseña. Revisar que la URL del mensaje sea la IP fija actual del servidor. Si no lo es, el APK se compiló con otra: recompilarlo con `05-build-apk.ps1` y reinstalarlo. Si la URL es correcta, seguir con la lista de abajo.
- **"Las credenciales son incorrectas"**: la tablet **sí** llegó al servidor. Es el usuario o la contraseña de Aspel.
- **"El servidor respondió con un error"**: llegó, pero el backend falló. Revisar los logs de `C:\BAMX\logs`.

Luego, en orden de probabilidad:

1. **La red está clasificada como Pública.** Es la causa más traicionera, porque *todo se ve bien*: la regla de firewall existe, aparece en la consola, y aun así no pasa nada. Una regla solo aplica en los perfiles que se le indicaron, y Windows bloquea casi todo lo entrante en el perfil Público. Verificar y corregir:

   ```powershell
   Get-NetConnectionProfile
   Set-NetConnectionProfile -InterfaceAlias "Ethernet" -NetworkCategory Private
   ```

   La red interna de BAMX debe ser **Privada**. El pre-flight avisa de esto, y el instalador se niega a abrir el puerto en una red Pública salvo que se le pase `-PermitirEnRedPublica`.
2. **Firewall** — `Get-NetFirewallRule -DisplayName "BAMX Backend API*"`. Si el servidor está en un dominio y su área de TI administra el firewall por GPO, las reglas locales pueden no aplicar aunque existan: hay que pedirles que abran el TCP 8080 hacia el servidor.
3. **Aislamiento de clientes en el WiFi** — muchos access points, sobre todo en redes de invitados, bloquean el tráfico entre dispositivos aunque el firewall esté abierto. Se detecta probando desde la tablet, nunca desde la PC. La prueba rápida es abrir `http://<ip>:8080/api/public/fotos-inventarios/x` en el navegador de la tablet: si da 404, la red deja pasar.
4. **Subredes distintas** — que la tablet y la PC estén en el mismo rango de IP.
5. **`usesCleartextTraffic`** — si el APK se compiló sin ese ajuste, Android bloquea el HTTP en silencio.

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

El despliegue no modificó el backend. Lo siguiente queda documentado a propósito, no arreglado.

| # | Punto | Riesgo real hoy |
|---|---|---|
| 1 | `SecurityConfig` con `permitAll("/**")` y CORS `*` | La autorización real la aplica `JwtAuthenticationFilter`. Mitigado porque la API solo vive en la LAN. **Nunca abrir este puerto a internet ni hacerle port forwarding.** |
| 2 | Sin endpoint de health ni Actuator | Se usa el truco del 404. Un `/api/public/health` de cinco líneas lo haría explícito. |
| 3 | Sin logging a archivo desde la app | Se depende de que WinSW capture stdout. No hay control de niveles. |
| 4 | HikariCP sin configurar: hasta 20 conexiones a Firebird | 10 por datasource. Debería aguantar, pero vale la pena vigilarlo la primera semana. |
| 5 | `TOKEN_BLOCK_LIST` no existe | El logout responde 200 pero no invalida el token; sigue vivo hasta 10 minutos. |
| 6 | ~~Axios sin timeout~~ | **Resuelto** (`fix/apk-produccion`): 30 s, y el login distingue la falta de conexión. |
| 7 | `criticalDate`/`warningDate` invertidos en `InveService` | Latente; no se manifiesta con los datos actuales. |
| 8 | Si el servidor no responde, el Semáforo muestra ceros sin avisar | Ya no muestra productos inventados (antes caía a `productosDummy`), pero tampoco dice "sin conexión". Un aviso en el Home lo haría explícito. |
| 9 | APK firmado con la llave *debug* de la plantilla | Suficiente para instalar a mano en la LAN de BAMX. Para Play Store haría falta una llave propia. |

---

## Referencia rápida de los scripts

| Script | Dónde | Admin | Qué hace |
|---|---|---|---|
| `00-preflight.ps1` | BAMX | no | Diagnostica. No modifica nada. `-RutaEmpresa`/`-RutaPerfiles` si Aspel está en otra unidad. |
| `01-build.ps1` | desarrollo | no | Compila el jar desde una copia limpia del último commit. |
| `02-install.ps1` | BAMX | **sí** | Instala el servicio. Con `-SoloValidar` revisa material y `.env` sin admin y sin instalar. |
| `03-verify.ps1` | ambas | no | Prueba de humo end-to-end (9 pasos, detecta un jar viejo). |
| `04-update.ps1` | BAMX | **sí** | Actualiza el jar, revierte solo si falla. |
| `05-build-apk.ps1` | desarrollo | no | Compila el APK con la URL del servidor adentro y verifica que quedó. |
| `99-uninstall.ps1` | BAMX | **sí** | Desinstala. No toca Aspel. |

Todos invocan sus ejecutables (`mvnw.cmd`, `gradlew.bat`, `isql.exe`, WinSW) con **ruta absoluta**. No es manía: si el sistema tiene definida `NoDefaultCurrentDirectoryInExePath`, `cmd` se niega a ejecutar nada del directorio actual aunque se haya hecho `cd`, y responde "no se reconoce como comando".

Los `.ps1` están escritos **sin acentos** a propósito: PowerShell 5.1 lee los scripts como ANSI cuando no traen BOM, y los acentos se verían rotos en máquinas con otra configuración regional.
