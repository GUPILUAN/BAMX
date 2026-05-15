# BAMX / Banco de Alimentos México

App interna para que BAMX consulte inventario, lotes, almacenes y refrigeradores conectándose a su ERP **Aspel SAE 8.00.36** (Firebird `.FDB`). El backend traduce las particularidades de Aspel a una API REST y el frontend (Expo / React Native) lo consume desde móvil y web.

Repo local: `C:\Users\alexi\Desktop\Folders\Work\BAMX`
Branch típica de trabajo: `feature/code-review`

---

## Stack

### Backend (`backend/`)
- Spring Boot **3.5.7** sobre **Java 25** (no LTS — pendiente bajar a 21 LTS).
- Maven, Lombok, MapStruct 1.5.5.
- **Jaybird 5.0.10** + Hibernate community dialects (`FirebirdDialect`).
- Spring Security + JWT (JJWT 0.11.5).
- Tests: JUnit 5, Testcontainers + Firebird testcontainer disponibles pero hoy los pocos tests existentes corren contra H2.

### Frontend (`frontend/`)
- **Expo SDK ~54** + **React Native 0.81.5** + React 19.
- **Expo Router 6** (routing basado en filesystem dentro de `app/`).
- NativeWind / Tailwind, Redux Toolkit + react-redux, axios, expo-secure-store.
- Skia + victory-native para gráficas; MQTT para sensores de temperatura.
- Tests: Jest + `@testing-library/react-native`.

### ERP / DB
- Aspel SAE 8.00.36 con bases Firebird `.FDB`.
- Aspel sufija sus tablas por empresa: `INVE01`/`INVE03`, `CLIE01`/`CLIE03`, `MULT01`/`MULT03`, etc.
- BAMX usa la **empresa 03**; la 01 está vacía.

---

## Decisiones de arquitectura

### La app es READ-ONLY contra Aspel

**Regla**: la app **no escribe nada** a las tablas de Aspel (`INVE`, `LTPD`, `MINVE`, `ALMACENES`, `CLIE`, etc.). Solo consulta (GETs).

**Razones**:
1. Aspel es el ERP autoritativo. Las mutaciones tienen implicaciones contables, fiscales y de auditoría que ya están blindadas en Aspel (asientos automáticos, validaciones, historial en MINVE). Replicar eso desde la app es trabajo enorme y fácil de hacer mal.
2. Confianza/adopción: BAMX suelta la app sin miedo a corromper su contabilidad. Quien lleva Aspel firma sin fricción.
3. Alcance acotado: la app es **tablero/visor + IoT (refrigeradores)**. Eso ya tiene valor de sobra para un voluntario en campo o un coordinador que no quiere abrir Aspel en una laptop.
4. Hay capturista dedicado en Aspel — la app no compite, complementa.

**Implicaciones para diseño**:
- Botones tipo "Entregar", "Despachar", "Marcar como desechado", "Registrar lote" **no se construyen**. Si el usuario necesita ese flujo, lo hace en Aspel.
- Si en algún momento BAMX decide capturar desde celular en bodega, eso es V2 (cambio de filosofía, no feature menor) — requiere reescribir asientos contables, validar contra reglas de Aspel, etc.
- Las tablas propias de la app (`TOKEN_BLOCK_LIST` en la DB de perfiles, sensores MQTT) sí son writeables — son de la app, no de Aspel.

### Estado real de los datos en BAMX (verificado contra DB en sesión 2026-05-15)

Antes de planear cualquier cosa que dependa de lotes/caducidad, hay que entender el desfase entre **cómo está modelado el sistema** y **cómo se está usando**.

**Lo que dicen los datos** (consultas SQL directas a `SAE80EMPRE03.FDB`):

| Métrica | Valor | Significado |
|---|---|---|
| Productos en `INVE03` | 37,199 | Catálogo completo |
| Productos con `CON_LOTE='S'` | **37,199 (100%)** | Flag prendido en todo el catálogo |
| Filas en `LTPD03` (lotes capturados) | **6** | Casi nadie capturó lote+caducidad |
| Filas en `MINVE03` (movimientos) | 872,588 | Hubo muchísima actividad de entrada/salida |
| Productos con lote completo (caducidad + producción) | 4 de 6, y 3 los inserté en testing manual |
| Único lote "real" con caducidad capturada | `YOGH450GR / OXXO01` capturado en 2023 (caducó hace ~2 años) |
| Lotes con caducidad NULL | `A006123` (Atún) — capturado en 2010 sin caducidad |

**Lectura**: el catálogo está bien configurado (`CON_LOTE='S'` está en todos), **pero el flujo de captura no aprovecha esa configuración**. El capturista parece estar haciendo entradas en Aspel sin pasar por la ventana de captura de lote+caducidad. Por eso `INVE.EXIST` y `MINVE` están bien poblados pero `LTPD` está casi vacío.

**Hipótesis a confirmar con la operación de BAMX** (NO confirmadas):
1. El capturista se salta la ventana de lote (rapidez / desconocimiento / configuración permisiva en `TBLCONTROL`).
2. Manejan caducidades operativamente por fuera (rotulación física, Excel, "FIFO a ojo").
3. Datos legacy migrados de versión anterior de Aspel sin caducidad.

### Implicación para la app

El Semaforo (pantalla Home) depende 100% de `LTPD`. Si `LTPD` está vacío, el Semaforo está vacío. **No hay solución técnica desde la app** — la caducidad no existe en ningún campo alternativo de la DB, así que un "adaptador" no puede inventarla.

Las features de la app que **sí funcionan hoy sin tocar nada** en BAMX:
- **Inventario**: lee `INVE.EXIST` que está bien poblado → la pantalla sirve completa con sus 37k productos.
- **Almacenes** (vista por bodega): lee `MINVE` + `ALMACENES` → funciona.
- **Refrigeradores / sensores MQTT**: independiente de Aspel → funciona.
- **Detalles de producto, búsqueda, ordenamiento**: funcionan.

Las features que **dependen de captura de lote en Aspel para tener valor real**:
- **Semaforo**: hoy solo muestra 3 productos (los de prueba).
- **Almacén dashboard con prioridad**: hoy clasifica solo esos 3.

### Plan de arranque (go-live en BAMX)

**Pre-requisito antes de cualquier discusión técnica**: una junta con la operación de BAMX para resolver las hipótesis de arriba. Preguntas clave para el capturista:
1. ¿Cómo manejan hoy las caducidades operativamente? (papel/Excel/memoria/etiquetas físicas/FIFO)
2. ¿Conocen y usan la ventana de captura de lote+caducidad cuando hacen entradas en Aspel?
3. ¿Estarían dispuestos a empezar a capturarla en cada entrada, o lo ven como overhead?
4. ¿Cuál sería para BAMX el valor más alto de la app? (puede ser Inventario móvil + IoT, no necesariamente Semaforo)

Según las respuestas, hay 2 caminos:

**Camino A — BAMX captura caducidad en Aspel a partir de go-live**

1. Mini-instructivo de 1 página al capturista: "Cuando registres una entrada al inventario en Aspel, asegúrate de capturar lote y fecha de caducidad en la ventana que aparece. Si te la saltas, la app no podrá alertarte cuando se caduque."
2. Existencia histórica: **cutoff + atrición** — no se migra nada. La existencia vieja queda visible en Inventario pero no en Semaforo. Conforme se consume con salidas naturales (1-3 meses para perecederos), se vacía sola. Las entradas nuevas sí van con lote → Semaforo se va poblando solo.
3. La app no requiere cambios.

**Camino B — BAMX no va a capturar caducidad en Aspel**

1. Replantear la propuesta de valor de la app: el Semaforo deja de ser feature core y baja a "nice-to-have para los pocos productos que sí estén capturados".
2. Reposicionar como features principales: Inventario móvil + Almacenes + IoT de refrigeradores. Eso ya tiene valor sin lotes.
3. Discutir V2: pantalla de captura desde la app que escribe a `LTPD` (rompe el read-only, decisión grande).

### Lo que NO se hace (descartado conscientemente)

- ❌ **Migrar la existencia histórica creando lotes con `FCHCADUC = NULL`**: el código actual trata NULL como crítico → todo en rojo = nada en rojo. Pierde la señal del semáforo.
- ❌ **Inferir caducidad por línea de producto** (ej. "fruta = 5 días desde entrada"): mentira, pierde precisión, vuelve la señal ruido.
- ❌ **Script de migración que escribe a `LTPD`**: viola la regla read-only.
- ❌ **Modificar el flag `CON_LOTE` masivamente**: ya está prendido en todo el catálogo. (En una sesión anterior se documentó mal esto con un campo inventado `CTR_LOTE` — corregido: el campo real es `CON_LOTE` y está en `'S'` para los 37,199 productos.)

### Visibilidad en la app durante la transición (opcional, no construido)

- **Badge "Sin lote" en filas de Inventario** cuando `EXIST > 0` y el producto no tiene lotes en `LTPD`. Convierte la pregunta "¿por qué está vacío el Semaforo?" en accionable: "estos productos necesitan que se capture lote en Aspel".
- **Contador/banner en Home**: "Semaforo muestra X de Y productos en almacén (los que tienen caducidad capturada en Aspel)". Da contexto sin mentir.

Ambas son features de display, no modifican datos.

---

## Arquitectura del backend

### Doble DataSource
- `EmpresaDbConfig` → `spring.datasource.empresa` → DB de Aspel (`SAE80EMPRE03.FDB`). Scanea `com.bamx.backend.models` y `com.bamx.backend.repositories`.
- `AuthDbConfig` → `spring.datasource.auth` → DB de perfiles (`BAMX_PERFILES.FDB`). Scanea `com.bamx.backend.auth.models` y `com.bamx.backend.auth.repositories`.
- Cada uno con su `EntityManager` y `TransactionManager` propios. Ambos `@Profile("!test")`.

### Multi-empresa por sufijo (truco clave)
Funciona en dos pasos en el datasource `empresa`:

1. **`EmpresaPhysicalNamingStrategy.toPhysicalTableName`** siempre agrega `"01"` al nombre lógico de las entidades JPA. `INVE` → `INVE01`.
2. **`EmpresaSqlStatementInspector.inspect`** intercepta cada SQL y, si el sufijo activo en el `ThreadLocal` no es `"01"`, hace `replaceAll("INVE01", "INVE03")` (y para las 14 tablas de empresa: `ALMACENES, CLIN, CONM, CVES_ALTER, ENLACE_LTPD, FOTO_INVE, INVE, LTPD, MINVE, MULT, NUMSER, PAIS, PROV, TBLCONTROL`).

El sufijo en el ThreadLocal se setea por request en `JwtAuthenticationFilter` desde el claim `empresa` del JWT, y se limpia en el `finally`. En login, `UsuarioService.resolveEmpresa()` puede forzar el valor de `APP_EMPRESA_SUFFIX` para los JWT recién firmados.

### Auth flow
- `UsuarioController` expone `/api/usuarios/login`, `/refresh-token`, `/logout`, `/me`.
- `UsuarioService.login` verifica contra `Usuario` (en DB auth) usando `AspelHash` (hash propio de Aspel).
- Emite **access** (10 min por defecto) y **refresh** (30 días). El refresh sólo se rota si está a <1 día de expirar.
- `JwtAuthenticationFilter.shouldNotFilter` excluye: `/api/usuarios/register`, `/login`, `/refresh-token`, `/api/public/*`, swagger. Todo lo demás exige `Bearer ...`.
- `TokenBlockListService` consulta primero `RDB$RELATIONS` para ver si existe `TOKEN_BLOCK_LIST`. Si no existe, **el logout responde 200 sin persistir nada** (el JWT sigue válido hasta su expiración natural).

### Endpoints REST principales

| Ruta | Método | Servicio | Notas |
|------|--------|----------|-------|
| `/api/usuarios/login` | POST | `UsuarioService.login` | Devuelve `{access, refresh}` |
| `/api/usuarios/refresh-token` | POST | `UsuarioService.refreshToken` | Header `Authorization: Bearer <refresh>` |
| `/api/usuarios/logout` | POST | `UsuarioService.logout` | Inserta en `TOKEN_BLOCK_LIST` si existe |
| `/api/usuarios/me` | GET | `UsuarioService.findById` | Usa `@CurrentUser` |
| `/api/inventarios/` | GET | `InveService.getAllInve` | Page<InventoryItem>. Soporta `page,size,sort,direction,search` |
| `/api/lotes/` | GET | `LtpdService.findAll` | Page<LoteConImagenDto> |
| `/api/almacenes/all` | GET | `AlmacenService.getAllAlmacenes` | Lista de almacenes |
| `/api/almacenes/dashboard` | GET | `AlmacenService.getDashboard` | Por almacén → por línea → totales critical/warning/good |
| `/api/foto-usuario/` | GET | `FotoUsuarioController` | PNG del usuario actual |
| `/api/foto-inve/...` | GET | `FotoInveController` | Imágenes de producto desde `APP_IMAGES_PATH` |

### Convención de "prioridades" — TRES lugares, DOS convenciones

| Lugar | `criticalDate` | `warningDate` | ¿Correcto? |
|-------|----------------|----------------|-------------|
| `AlmacenService.getDashboard:36-37` | `today + 2d` | `today + 5d` | ✅ |
| `LtpdService.findAll:42-47` | `days <= 2` → critical | `days <= 5` → warning | ✅ |
| `InveService.getAllInve:32-33` | **`today + 5d`** | **`today + 2d`** | ❌ invertido |

Lo correcto es: "lo que caduca antes es crítico". `InveService` lo tiene al revés. Ver BLOCKERS abajo.

### `LtpdService.findAll` reescribe `Lot.status` después del query

Esto es no-obvio y costó una sesión de confusión. La verdad:

- En BD, `LTPD.STATUS` es `"A"` / `"I"` (Activo / Inactivo de Aspel).
- `LtpdRepository.findAllLotes` hace `WHERE l.status = 'A' AND l.cantidad > 0` y devuelve un DTO con `status = null` (literalmente `null` en el SELECT).
- `LtpdService.findAll` itera el page y **sobrescribe** `dto.status` con `"critical"` / `"warning"` / `"good"` según `expiration_date`:
  - `expiration_date == null` → `"critical"`
  - `days <= 2` → `"critical"`
  - `days <= 5` → `"warning"`
  - else → `"good"`
- El frontend (`useSemaforoStats`) consume este status reescrito, no el de Aspel.

Resultado: el campo `status` en la API de `/api/lotes/` **no es el de Aspel**. Si alguien busca por `status="A"` en esa respuesta, no encontrará nada.

### Queries de almacén por urgencia (`LtpdRepository`)
- `findWarehouseNameInCritical(cveArt, criticalDate)`: `l.fchCaduc <= :criticalDate OR fchCaduc IS NULL`.
- `findWarehouseNameInWarning(cveArt, warningDate)`: `l.fchCaduc <= :warningDate` ← se traslapa con critical, debería excluirlo (`AND fchCaduc > :criticalDate`).
- `findWarehouseNameInGood(cveArt, warningDate)`: `l.fchCaduc > :warningDate`.

> **Comportamiento de NULL**: `findWarehouseNameInCritical` matchea `fchCaduc IS NULL` explícitamente. Las otras dos usan `<=` y `>` que con `NULL` devuelven `unknown` (no `true`), así que lotes con caducidad nula **solo aparecen como críticos**. Esto explica que `A006123` (atún sin caducidad en LTPD) solo pinte el círculo rojo.

### Dos fuentes de verdad para "cantidad" — inconsistencia funcional

Hay dos lugares en la app que muestran "cuánto hay" de un producto y **no se sincronizan**:

| Pantalla | Endpoint | Campo | De dónde sale |
|----------|----------|-------|---------------|
| Inventario | `/api/inventarios/` | `available_quantity` | `INVE.EXIST` (existencia maestra del catálogo de Aspel) |
| Semaforo del Home | `/api/lotes/` | suma de `Lot.available_quantity` | `LTPD.CANTIDAD` (sumas por lote activo) |

Un mismo producto puede mostrar `EXIST = 57.7` en Inventario y `2680` sumado en Semaforo del mismo día. No es bug del backend — Aspel modela cantidad maestra (Inve) y por-lote (Ltpd) por separado. Pero al usuario se le presentan ambas como "Productos en estado X" sin contexto. Cuidado al pedir features que asuman que son el mismo número.

Adicionalmente, el Semaforo **suma cantidades de unidades distintas** (kg de fruta + latas de atún + piezas de yoghurt) y las muestra como "Productos". Conceptualmente raro pero así está; cualquier rediseño de esa pantalla debería separarlo por `UNI_MED`.

---

## Arquitectura del frontend

### Routing (Expo Router, file-based)
Estructura en `frontend/app/`:

```
app/
├── _layout.tsx              # Provider Redux + fonts + Stack root
├── index.tsx                # → AuthLoadingScreen (gating de sesión)
├── details.tsx              # → DetailsScreen (modal)
├── (auth)/
│   └── login.tsx            # → AuthScreen
└── (drawer)/
    ├── _layout.tsx          # Drawer + SideBar
    ├── inicio.tsx           # → HomeScreen
    ├── inventario.tsx       # → InventoryScreen
    └── usuario.tsx          # → UserScreen / ProfileScreen
```

Los archivos en `app/` son shims que importan de `screens/`. La lógica real vive en `screens/`, `components/`, `hooks/`, `slices/`, `api/`.

### Pantallas (qué muestra cada una)

| Ruta | Screen | Qué hace |
|------|--------|----------|
| `/` | `AuthLoadingScreen` | `useCheckLoginStatus` lee SecureStore. Si hay `access` → `/(drawer)/inicio`. Si no → `/(auth)/login` |
| `/(auth)/login` | `AuthScreen` | Login username + password con fondo `bg-bamx.jpeg`. Llama `apiService.loginUser` |
| `/(drawer)/inicio` | `HomeScreen` | `AnimatedSwitch` para alternar entre **Semaforo** (totales crítico/prioritario/estable + barra gradiente + lista) y **Refrigeradores** (cards de almacenes con temperatura) |
| `/(drawer)/inventario` | `InventoryScreen` | `SearchHeader` (search + sort + dirección) + `ProductList` paginada con `ProductRow` |
| `/(drawer)/usuario` | `UserScreen` | Avatar (o inicial) + nombre + email + empresa + rol + status |
| `/details` (modal) | `DetailsScreen` | Imagen + nombre + tipo + clave + fechas en bottom-sheet. Recibe `item` por params (JSON-stringified) |

### Cliente HTTP
- `api/axiosInstance.ts` → `instance` con `baseURL = EXPO_PUBLIC_API_URL`. Interceptor que:
  - Para login/refresh/logout, no inyecta auth.
  - Para el resto, lee `access` de SecureStore; si expiró (`atob` del payload), refresh; si falla refresh → `replace("Auth")`.
- `api/apiCalls.ts` → solo `loginUser` separado para que tests lo puedan mockear.
- `api/apiService.ts` → wrapper con `loginUser`, `logOut`, `retrieveData(route)`, `getImage(url)`.

### Estado global
Redux Toolkit con slices: `themeSlice`, `userSlice`, `settingsSlice`. SecureStore para tokens (`access`, `refresh`) vía `functions/userKey.ts`.

### Navegación legacy
`functions/NavigationService.ts` convierte nombres tipo React Navigation (`"Dashboard"`, `"Auth"`, `"Inventario"`, …) a paths de Expo Router. Mantiene compat con código que aún usa `navigate("Inicio")`. **Cuidado**: `"Configuracion"` mapea a `/(drawer)/configuracion` pero ese archivo no existe.

---

## Estado actual de configuración (local de Alex)

### Bases de datos
- Empresa real BAMX: `C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Datos\SAE80EMPRE03.FDB`
- Perfiles auth BAMX: `C:\Program Files (x86)\Common Files\Aspel\Perfiles\BAMX_PERFILES.FDB`
- Imágenes: `C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Imagenes`

### `.env` del backend (relevante)
- `APP_EMPRESA_SUFFIX=03` (fuerza que login firme JWT con empresa 03).
- `DATABASE_PATH_EMPRESA` → `SAE80EMPRE03.FDB`.
- `DATABASE_PATH_AUTH` → `BAMX_PERFILES.FDB`.

### Comandos típicos
```powershell
# Backend
cd backend
cmd /c mvnw.cmd -DskipTests compile
cmd /c mvnw.cmd test
cmd /c mvnw.cmd spring-boot:run

# Frontend
cd frontend
npm install
npx expo start
npm run test
```

`source loadenv.sh` solo funciona en bash; en PowerShell usar `.env` directo (Spring Boot ya lo lee por `spring.config.import`).

### Datos confirmados en `SAE80EMPRE03.FDB`
- `INVE03`: 37 199 productos
- `CLIE03`: 1 454 clientes
- `ALMACENES03`: 11 almacenes
- `MULT03`: 164 852 registros
- `LTPD03`: 3 lotes (sí, sólo 3)
- `MINVE03`: 872 588 movimientos
- `INVE01` / `CLIE01`: 0 (la empresa 01 está vacía, no usar)

Ejemplos para sanity-check: producto `VEDU000GR` (VERDURA A GRANEL), `FRUT000GR` (FRUTA A GRANEL), cliente `44` (PUBLICO EN GENERAL).

### Operación directa con Firebird (isql)

Para investigar/modificar datos del ERP sin pasar por el backend:

```powershell
& "C:\Program Files (x86)\Firebird\Firebird_2_5\bin\isql.exe" `
  -user sysdba -password masterkey `
  "C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Datos\SAE80EMPRE03.FDB"
```

Adentro del prompt `SQL>`:
- Siempre primero: `SET NAMES WIN1252;` o los acentos salen como `?`.
- Cada statement termina con `;`. `EXIT;` para salir.
- `SHOW TABLE LTPD03;` muestra el schema completo.

Para ejecutar un script desde un archivo: agrega `-i ruta\al\archivo.sql` al comando.

GUI alternativas: **DBeaver Community** o **FlameRobin** (conexión `localhost:3050`, mismo user/pass).

### Schema importante de LTPD03 (lotes)

PK = `REG_LTPD INTEGER NOT NULL` — **NO es autoincremental**. Para INSERT manual hay que generar el ID con `SELECT MAX(REG_LTPD)+1 FROM LTPD03;` antes. Probable que esto aplique a otras tablas de Aspel (verificar caso por caso).

### Productos con lotes activos (estado actual)

Solo **3 CVE_ART** tienen lotes en `LTPD03` (de 37 199 productos en el catálogo):
- `A006123` (Atún en Aceite Herdez 170gr) — 2 lotes con `FCHCADUC = NULL` → siempre críticos.
- `YOGH450GR` (YOGHURT 450GR) — 1 lote caducado en 2023-08-11 → siempre crítico.
- `FRUT000GR` (FRUTA A GRANEL) — sin lotes en `LTPD03` por defecto. **Usado en sesiones de testing** para meter lotes con fechas variadas (critical/warning/good) y reproducir el bug de fechas invertidas. Para reproducir, INSERT con `MAX(REG_LTPD)+1`, varias fechas relativas a `today`, status `'A'`, cantidad > 0.

Esto significa que el 99.99% del catálogo está "ciego" para la app — no aparecen lotes porque nadie los marcó con manejo por lote en Aspel (ver sección Aspel abajo).

---

## Estado de Aspel SAE (instalación local)

Aspel instalado en `C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00`. Archivo de conexiones: `Conexiones.ini`.

Aliases relevantes:
- `[EJEMPLOS]` → `…\Ejemplos\Ejemplos.fdb`
- `[Ejemplos03]` → `…\Empresa03\Datos\SAE80EMPRE03.FDB`

Acciones hechas (histórico, mantener por si se necesita rollback):
- Se copió `Empresa03` desde Desktop/info a `Program Files` de Aspel.
- Se copió `BAMX_PERFILES.FDB` a carpeta de perfiles.
- Se sobrescribió `Ejemplos.fdb` con `C:\Users\alexi\Desktop\info\info\Ejemplos.fdb`.
- Backup del anterior: `Ejemplos.fdb.bak-20260505-173919`.

**Pendiente actual con Aspel UI**: Aspel SAE abre pero muestra "EMPRESA INVÁLIDA, S.A. DE C.V." y al abrir clientes/productos no aparecen datos. El **backend sí funciona** porque apunta directo al `.FDB` y reescribe sufijo a `03`. El problema es que la GUI de Aspel está cargando contexto de empresa 01 o uno inválido. Hay que revisar cómo Aspel decide qué empresa abrir y si la 03 está registrada correctamente en el catálogo de empresas de Aspel (no solo en `Conexiones.ini`).

### Proceso de captura: flag "Maneja Lote"

En Aspel SAE, cada producto del catálogo (`INVE`) tiene un flag tipo "Maneja Lote" que define si los movimientos del producto se rastrean en `LTPD`. Si el flag **NO** está activo:
- Las entradas/salidas siguen registrándose en `MINVE` (movimientos generales).
- **NO se generan filas en `LTPD`** → la app BAMX nunca ve esos productos como "lotes".
- Las pantallas Semaforo / Refrigeradores / Inventario-con-prioridad quedan vacías para esos productos.

Hoy `LTPD03` tiene 3 lotes de la noche a la mañana porque solo 3 productos están marcados con el flag. **Esto es un proceso de captura en Aspel, no es un bug de la app.** Si BAMX quiere ver más productos en la app, alguien tiene que marcar el flag en los productos relevantes antes de hacer entradas. Sospechar de esto cuando alguien diga "metí 100 productos pero la app no los muestra".

---

## Cambios importantes ya hechos en el backend

- Arreglado `mvnw.cmd` (wrapper Windows).
- `LtpdRepository`: ID de `Ltpd` corregido a `Integer` (era `String`).
- Configurado para leer `.env` vía `spring.config.import`.
- Lógica multi-empresa: `EmpresaPhysicalNamingStrategy` + `EmpresaSqlStatementInspector` + ThreadLocal seteado por `JwtAuthenticationFilter`.
- Auth/JWT incluye claim `empresa`.
- Fallback en `TokenBlockListService` cuando `TOKEN_BLOCK_LIST` no existe.
- Tests pasan con `cmd /c mvnw.cmd test` (sobre H2, no Firebird).
- **Frontend** `StackedBarChart` ahora hace early-return si `mappedData` está vacío (antes crasheaba con `Object.keys(undefined)`).
- **Frontend** `app/_layout.tsx` silencia (solo en web) el error `Cannot read properties of undefined (reading 'Typeface')` de `@shopify/react-native-skia` mientras CanvasKit termina de cargar. El filtro es estricto (`/Typeface|MakeFreeTypeFaceFromData|JsiSkTypefaceFactory/`) y silencia 6 canales: `LogBox.ignoreLogs`, `console.error`, `console.warn`, `ErrorUtils.setGlobalHandler`, `window.error` y `window.unhandledrejection` (en capture phase con `stopImmediatePropagation`). **Cualquier otro error pasa normal** — revisar DevTools del navegador si algo se ve raro.

---

## Issues conocidos (resumen, ver review en sesión para detalle)

**BLOCKERS para producción**
- `SecurityConfig` con `requestMatchers("/**").permitAll()`: la protección efectiva vive en el filter, frágil.
- `criticalDate`/`warningDate` invertidos entre `InveService` y `AlmacenService` (latente — no se manifiesta hoy porque casi todos los lotes están caducados). Ver tabla en "Convención de prioridades".
- CORS abierto a `*` con `permitAll`.

**~~BLOCKERS resueltos~~ ✅**
- ~~`StackedBarChart` truena con `data: []`~~ — fixed con early-return (commit `4a6c91d`).
- ~~`useSemaforoStats` muestra 0 siempre~~ — **FALSO POSITIVO** descubierto en sesión. `LtpdService.findAll` sí reescribe `Lot.status` a `"critical"/"warning"/"good"`. El Semaforo funciona.

**WARNINGS**
- `TOKEN_BLOCK_LIST` no existe; logout responde 200 sin persistir.
- Queries de prioridad en `LtpdRepository` se traslapan (warning incluye critical).
- `i.getUniMed().toLowerCase()` y `alm.getStatus().equalsIgnoreCase("A")` pueden tronar con null.
- `AlmacenService.getDashboard` calcula `last_update` con `rows` global, no por almacén.
- `ProductRow` usa `(product as any)` para tragar `InventoryItem | Lot`.
- `spring.jpa.open-in-view=true` (anti-pattern).
- Tests en H2 ≠ Firebird real.
- 3 botones del SideBar sin `onPress` (Registro, Productos entregables/no aptos).

**SUGGESTIONS**
- Bajar a Java 21 LTS.
- Añadir `typecheck` script al frontend.
- Migraciones con Flyway/Liquibase para tablas propias.
- Optimizar N+1 en `InveService.getAllInve` (41 queries por página de 10).
- Quitar `System.out.println` en `AlmacenService`.
- Unificar `InventoryItem` vs `Lot` desde el backend.
- Postman collection completa.

---

## Git workflow del equipo

- Branch default: **`main`**. **Protegida server-side**: requiere PR + 2 status checks (`backend-tests`, `frontend-tests`). No se puede `git push` directo (lo rechaza GitHub aunque hagas `--force`).
- **No hay `develop` viva.** Existen `origin/develop`, `develop-java`, `develop-ponce` pero las tres están abandonadas hace 6-8 meses. **No crear nuevos `develop`** — el flujo real es `feature/<algo>` → PR → `main` directo (ver merges recientes en `git log`).
- `gh` CLI **no está instalado** en el entorno local. Para abrir PRs usar la web: `https://github.com/GUPILUAN/BAMX/compare/main...<branch>`.
- `.claude/settings.json` tiene `attribution.commit = ""` y `attribution.pr = ""`. **No agregar `Co-Authored-By: Claude`** ni footers de Claude en commits/PRs.
- Convention de mensajes (Conventional Commits, ver `git log --oneline`): `feat:`, `fix(scope):`, `chore:`, `docs:`, `refactor:`.

### Branches sugeridas para tareas pendientes
- `chore/ui-cleanup` — quitar acciones muertas (Entregar/Deshechar, Registro, botones de Inventario), default images por línea de producto.
- `feat/pages-entregables-no-aptos` — pantallas para los 2 botones grandes del SideBar.
- `infra/dockerize-backend` — Dockerfile + docker-compose para despliegue en BAMX.
- `feat/refrigeradores-iot` — wire MQTT real (esperar a tener hardware).

---

## Tips operativos

- Para validar que el backend está leyendo empresa 03: pegar `cveArt='VEDU000GR'` en una query a `/api/inventarios/?search=VEDU000GR`. Si responde con datos, el sufijo está bien.
- Si Aspel SAE GUI no muestra datos pero el backend sí, **no es un problema del backend**; revisar configuración GUI de Aspel.
- Cuando un endpoint nuevo del backend devuelva 401 inesperado, revisar `shouldNotFilter` en `JwtAuthenticationFilter` antes de tocar `SecurityConfig`.
- Frontend: si `useFetchLotes` cae a `productosDummy.items`, el API falló silenciosamente — revisar `EXPO_PUBLIC_API_URL` y network del device.
