# BAMX / Banco de Alimentos México

App interna para que BAMX consulte inventario, lotes, almacenes y refrigeradores conectándose a su ERP **Aspel SAE 8.00.36** (Firebird `.FDB`). El backend traduce las particularidades de Aspel a una API REST y el frontend (Expo / React Native) lo consume desde móvil y web.

Repo local: `C:\Users\alexi\Desktop\Folders\Work\BAMX`
Branch base: `main` (protegida). Flujo real: `feature/<algo>` o `chore/<algo>` → PR → `main`.

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
| `/api/lotes/` | GET | `LtpdService.findAll` | Page<LoteConImagenDto>. `fitForDelivery` opcional: `true`=entregables (verde+amarillo), `false`=no aptos (rojo), ausente=todos (Semaforo) |
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
    ├── productosEntregables.tsx # → ProductosEntregablesScreen (semáforo verde+amarillo)
    ├── productosNoAptos.tsx     # → ProductosNoAptosScreen (semáforo rojo)
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
| `/(drawer)/productosEntregables` | `ProductosEntregablesScreen` | Grid de tarjetas (hero + buscador + chips de categoría + frescura) de productos **entregables** (semáforo verde+amarillo). Comparte `DeliverablesScreen` con la de no aptos |
| `/(drawer)/productosNoAptos` | `ProductosNoAptosScreen` | Mismo grid, bucket **no apto** (semáforo rojo: caducados, por caducar ≤2d o sin caducidad). Acento rojo, frescura tipo "caducó hace Xd" |
| `/(drawer)/usuario` | `UserScreen` | Avatar (o inicial) + nombre + email + empresa + rol + status |
| `/details` (modal) | `DetailsScreen` | Imagen + nombre + tipo + clave + fechas en bottom-sheet. Recibe `item` por params (JSON-stringified) |

> **Entregables / No aptos** comparten `components/DeliverablesScreen` (parametrizado por `variant`). El bucket lo decide la caducidad vía el filtro `fitForDelivery` de `/api/lotes/`: entregable = `fchCaduc > hoy+2` (frontera exacta `>= medianoche de hoy+3`, alineada con `days>2` de `LtpdService`), no apto = `fchCaduc <= hoy+2` o `NULL`. `useFetchDeliverables` agrega los lotes por producto (una tarjeta = un producto) y `getFreshness` traduce la caducidad a puntos+color+label. **Misma dependencia que el Semaforo**: si `LTPD` está vacío, estas pantallas también (por diseño — la caducidad manda). El empty state lo explica.

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

**⚠️ Bug latente en `main`**: `application.properties` usa placeholders `${DATABASE_HOST_AUTH}`, `${JWT_SECRET}`, etc., **pero NO tiene `spring.config.import=optional:file:.env[.properties]`** — entonces Spring Boot no carga el `.env` automáticamente. En bash funcionaba porque `source loadenv.sh` exportaba al entorno antes de Maven; en PowerShell/CMD no corre ese script, las variables no llegan, Spring deja los `${...}` literales y Firebird estalla con `Bad port: '${DATABASE_PORT_AUTH}' is not a number`. Fix de una línea: agregar `spring.config.import=optional:file:.env[.properties]` a `application.properties`. Pendiente en una branch nueva (`fix/backend-env-loading`).

### Datos confirmados en `SAE80EMPRE03.FDB` (sesión 2026-05-15)
- `INVE03`: 37,199 productos (todos con `CON_LOTE='S'`).
- De esos, **solo 39 tienen `EXIST > 0`** — el resto del catálogo es histórico sin stock real.
- `CLIE03`: 1,454 clientes.
- `ALMACENES03`: 11 almacenes.
- `MULT03`: 164,852 documentos.
- `LTPD03`: **6 filas** distribuidas en **3 productos**.
- `MINVE03`: 872,588 movimientos.
- `INVE01` / `CLIE01`: 0 (la empresa 01 está vacía, no usar).

**Productos de sanity-check** (los únicos con existencia real positiva relevante):
| `CVE_ART` | Descripción | `EXIST` | `LIN_PROD` |
|---|---|---|---|
| `VEDU000GR` | VERDURA A GRANEL | 267.02 kg | `V1N` (VERDURA PERECEDERA) |
| `FRUT000GR` | FRUTA A GRANEL | 57.70 kg | `F1P` (FRUTA PERECEDERA) |
| `JAMO000GR` | JAMON A GRANEL KG | 13.84 kg | `AOA` (ALIM ORIGEN ANIMAL) |

Cliente típico: `44` (PUBLICO EN GENERAL).

### Schema importante de `INVE03` (catálogo de productos)

Columnas relevantes para el backend / queries de la app:

| Campo | Tipo | Valores típicos | Para qué |
|---|---|---|---|
| `CVE_ART` | string PK | "FRUT000GR" | Clave única |
| `DESCR` | string | "FRUTA A GRANEL" | Nombre humano |
| `EXIST` | numeric | 57.70 | Existencia maestra **materializada** (ver abajo) |
| `LIN_PROD` | string FK → `CLIN.CVE_LIN` | "F1P" | Línea/categoría |
| `CON_LOTE` | char(1) | `'S'` / `'N'` | ¿Maneja lote? |
| `TIPO_ELE` | char(1) | `'P'` / `'S'` | Producto vs Servicio |
| `STATUS` | char(1) | `'A'` / `'I'` | Activo / Inactivo |
| `UNI_MED` | string | "KG", "PZA" | Unidad de medida |
| `CVE_IMAGEN` | string | path | Apunta a `FOTO_INVE03` |

**`INVE.EXIST` es materializado**, no calculado on-the-fly. Aspel actualiza el valor en la **misma transacción** que cada movimiento de `MINVE`. Por eso el campo arrastra **ruido de punto flotante** (residuos tipo `-8.5e-14` después de cientos de operaciones); el frontend ya los clampea a `0` en `ProductRow` con el helper `formatQuantity`.

### Query del Inventario (`InveRepository.findAllInve`)

Filtros aplicados (importante saberlo para entender por qué un producto sí/no aparece):
```sql
WHERE CON_LOTE = 'S' AND TIPO_ELE = 'P' AND STATUS = 'A' AND LIKE %search%
```
- 37,173 productos pasan estos 3 filtros (de 37,199 totales).
- **No filtra por existencia** → la pantalla Inventario muestra todo el catálogo activo, no solo lo que tiene stock. Pendiente: `feat/inventory-stock-filter` para agregar toggle "Solo con existencia" (default) + `ORDER BY CASE WHEN EXIST>0 THEN 0 ELSE 1 END`.

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

### Productos con lotes activos (estado actual, 2026-05-15)

Solo **3 CVE_ART** tienen lotes en `LTPD03` (6 filas en total), de 37,199 productos:

| `CVE_ART` | Lote | Cantidad | `FCHCADUC` | Origen |
|---|---|---|---|---|
| `A006123` (Atún Herdez) | "10" | 7 | **NULL** | Capturado 2010 sin caducidad — datos legacy |
| `A006123` (Atún Herdez) | "228" | 3 | **NULL** | Idem |
| `YOGH450GR` (Yoghurt) | "OXXO01" | 2,680 | 2023-08-11 (caducó hace ~2 años) | Único lote "real" capturado correctamente |
| `FRUT000GR` (Fruta) | "TEST-CRIT" | 50 | hoy | **Insertado manualmente con isql** en sesión anterior para testing |
| `FRUT000GR` (Fruta) | "TEST-WARN" | 100 | hoy + 3d | Idem testing |
| `FRUT000GR` (Fruta) | "TEST-GOOD" | 200 | hoy + 29d | Idem testing |

**El 99.99% del catálogo está "ciego" para el Semaforo**, pero **NO porque falte el flag** (todos tienen `CON_LOTE='S'`). El problema real es **proceso de captura**: el capturista hace entradas en Aspel sin pasar por la ventana de lote+caducidad. Ver "Estado real de los datos en BAMX" arriba.

**Para insertar lotes de prueba** en `LTPD03`:
- PK = `REG_LTPD INTEGER NOT NULL`, **no autoincremental**. Generar con `SELECT MAX(REG_LTPD)+1 FROM LTPD03;` antes del INSERT.
- Campos mínimos requeridos: `CVE_ART`, `LOTE`, `CANTIDAD`, `STATUS='A'`, `CVE_ALM`. Recomendado también: `FCHCADUC`, `FEC_PROD_LT`, `FCHULTMOV`.
- Probable que esto aplique a otras tablas de Aspel — verificar caso por caso con `SHOW TABLE` y buscar el campo PK.

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

### Flujo correcto de captura de inventario en Aspel SAE

Para que un producto aparezca en el Semaforo de la app, necesita una fila en `LTPD03` con `FCHCADUC` capturada. El flujo correcto en Aspel para que eso suceda:

1. **Abrir** Aspel SAE → ribbon "Inventarios" → **"Movimientos al inventario"** (NO "Lotes y pedimentos" — esa es vista de consulta).
2. Click en **"Nuevo documento"** (📄+) arriba a la izquierda.
3. Seleccionar **tipo de movimiento** (Entrada / Donación / Ajuste positivo / etc., depende de la configuración).
4. Por cada renglón:
   - Elegir `CVE_ART` del producto (existe en `INVE03`).
   - Elegir almacén (`CVE_ALM`).
   - Capturar cantidad.
   - **Si el producto tiene `CON_LOTE='S'`** (que en BAMX es siempre), Aspel **debería** abrir automáticamente una ventana de "Lote y pedimento" pidiendo:
     - Número de lote (texto libre)
     - **Fecha de caducidad** ← este es el dato clave
     - Fecha de producción (opcional)
     - Pedimento (solo para importados)
5. Guardar → Aspel hace 4 escrituras atómicamente:
   - `MULT03` ← nuevo documento.
   - `MINVE03` ← una fila por renglón.
   - `INVE03.EXIST` ← incrementa la existencia maestra.
   - `LTPD03` ← **nueva fila con lote y caducidad** ✓ (solo si capturó el paso 4 del lote).

**El punto débil en BAMX**: el paso 4 (la ventana de lote) **se está saltando** en la práctica — por eso `INVE.EXIST` y `MINVE` están bien poblados pero `LTPD` está casi vacío. Hipótesis a investigar con la operación de BAMX: rapidez del capturista, configuración permisiva en `TBLCONTROL`, o el capturista no sabe que la ventana es obligatoria.

### El flag `CON_LOTE` por sí solo NO es suficiente

Un error común al diagnosticar el "Semaforo vacío" es asumir que falta prender el flag `CON_LOTE`. **No es el caso en BAMX**: los 37,199 productos ya tienen `CON_LOTE='S'`. La configuración del catálogo es correcta; la fuga está en el proceso de captura humano.

### Las 4 tablas que mover juntas para entender el inventario

- **`INVE03`** (catálogo): qué productos existen + cuánto hay en total (`EXIST`).
- **`CLIN03`** (líneas): clasificación/categoría del producto (`CVE_LIN`, `DESC_LIN`).
- **`ALMACENES03`** (bodegas): dónde está físicamente el inventario.
- **`MINVE03`** (movimientos): cada entrada/salida histórica.
- **`MULT03`** (documentos): facturas/remisiones/entradas que agrupan renglones de MINVE.
- **`LTPD03`** (lotes): detalle por lote con caducidad. **Aquí vive el dato que alimenta el Semaforo.**

---

## Cambios importantes ya hechos

### Backend
- Arreglado `mvnw.cmd` (wrapper Windows).
- `LtpdRepository`: ID de `Ltpd` corregido a `Integer` (era `String`).
- Lógica multi-empresa: `EmpresaPhysicalNamingStrategy` + `EmpresaSqlStatementInspector` + ThreadLocal seteado por `JwtAuthenticationFilter`.
- Auth/JWT incluye claim `empresa`.
- Fallback en `TokenBlockListService` cuando `TOKEN_BLOCK_LIST` no existe.
- Tests pasan con `cmd /c mvnw.cmd test` (sobre H2, no Firebird).
- **Pendiente**: `application.properties` no tiene `spring.config.import` para el `.env` → la app no arranca desde CMD/PowerShell sin truco. Ver sección "Configuración" arriba.

### Frontend
- `StackedBarChart` hace early-return si `mappedData` está vacío (antes crasheaba con `Object.keys(undefined)`).
- `app/_layout.tsx` silencia (solo en web) el error `Cannot read properties of undefined (reading 'Typeface')` de `@shopify/react-native-skia` mientras CanvasKit termina de cargar. Filtro estricto (`/Typeface|MakeFreeTypeFaceFromData|JsiSkTypefaceFactory/`) que silencia 6 canales: `LogBox.ignoreLogs`, `console.error`, `console.warn`, `ErrorUtils.setGlobalHandler`, `window.error` y `window.unhandledrejection` (en capture phase con `stopImmediatePropagation`). **Cualquier otro error pasa normal** — revisar DevTools del navegador si algo se ve raro.
- **Branch `chore/ui-cleanup`** (en PR a 2026-05-15): quité botones muertos "Entregar/Desechar" (ProductCard), botón "Registro" (SideBar), botones "Añadir/Agregar entrega/deshecho" (SearchHeader). Rediseñé SearchHeader limpio. Agregué `DefaultProductImage` por línea de producto (mapeo CVE_LIN → icon + color con `@expo/vector-icons/MaterialCommunityIcons`). Helper `isUsableImage` que filtra URLs de placeholder (pngtree) + `onError` fallback. Helper `formatQuantity` que clampea ruido de flotante a 0 y formatea con locale es-MX.

### Helper `DefaultProductImage` (frontend)
Componente que recibe `typeId` (CVE_LIN, preferido) o `type` (DESC_LIN, fallback heurístico) y renderiza un cuadro de color sólido con un icono semántico. Mapeo de líneas reales de BAMX:
- `FYV`/`F1N`/`F1P`/`F2P` → 🍎 fruta (rojo)
- `V1N` → 🥕 verdura (verde)
- `LECHE`/`L1P`/`L2P` → 🍼 lácteo (azul)
- `A2P`/`A2N` → 🥫 abarrotes (café)
- `AYG` → 🍶 aceite (turquesa)
- `E1P`/`E2P` → 🥤 bebida (verde-azul)
- `CER`/`C1N`/`C1P`/`C2P`/`G2N` → 🌾 cereal (amarillo)
- `AOA`/`O1N`/`O1P` → 🍗 carne (rosa)
- `B2P` → 🍪 snack (naranja)
- `AZU` → 🧊 azúcar (rosa pálido)
- `LEG` → 🥜 leguminosas (beige)
- `P`/`P1P` → 🍞 pan (gris claro)
- `T1P` → 🍴 comida preparada (coral)
- `ALL` → 🍃 alimentos libres (verde claro)
- `NP`/`X2` → 📦 no comestible (gris azulado)
- default → 🚫 imagen rota (gris)

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
- `application.properties` no carga el `.env` (falta `spring.config.import`). Bug latente que rompe el arranque en CMD/PowerShell.
- `TOKEN_BLOCK_LIST` no existe; logout responde 200 sin persistir.
- Queries de prioridad en `LtpdRepository` se traslapan (warning incluye critical).
- `i.getUniMed().toLowerCase()` y `alm.getStatus().equalsIgnoreCase("A")` pueden tronar con null.
- `AlmacenService.getDashboard` calcula `last_update` con `rows` global, no por almacén.
- `ProductRow` usa `(product as any)` para tragar `InventoryItem | Lot`.
- `spring.jpa.open-in-view=true` (anti-pattern).
- Tests en H2 ≠ Firebird real.
- ~~2 botones del SideBar sin `onPress` (Productos entregables / Productos no aptos)~~ ✅ **resueltos** en `feat/pages-entregables-no-aptos` (cablean a sus pantallas vía `DeliverablesScreen`). El de "Registro" ya se quitó en `chore/ui-cleanup`.

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

### Branches activas / sugeridas
- ✅ `chore/ui-cleanup` — **en PR, mergeable**. UI cleanup + DefaultProductImage + filtros de imagen + clamp de flotante + CLAUDE.md actualizado.
- 🚧 `feat/inventory-stock-filter` — **encima de chore/ui-cleanup (stacked)**. Toggle "Solo con existencia" en Inventario (default ON), `ORDER BY CASE WHEN EXIST>0 THEN 0 ELSE 1 END`, page size 25-30, badge "Sin stock" para filas con `EXIST=0`.
- `fix/backend-env-loading` — pendiente: agregar `spring.config.import=optional:file:.env[.properties]` a `application.properties`. Una línea, alto impacto (sin esto el backend no arranca en CMD/PowerShell).
- `feat/pages-entregables-no-aptos` — pantallas para los 2 botones grandes del SideBar.
- `infra/dockerize-backend` — Dockerfile + docker-compose para despliegue en BAMX.
- `feat/refrigeradores-iot` — wire MQTT real (esperar a tener hardware).

### Stacked branches workflow

Cuando una branch está en PR y no se puede mergear todavía (revisión nocturna, esperando aprobación, etc.) y se quiere seguir trabajando encima:

```powershell
# Estando en chore/ui-cleanup que está en PR
git checkout -b feat/inventory-stock-filter
# Trabajar, commit, push -u origin feat/inventory-stock-filter
# El PR de esta branch se abre contra chore/ui-cleanup, no contra main
```

Cuando se mergea la base (`chore/ui-cleanup` → `main`):
```powershell
git fetch origin
git checkout feat/inventory-stock-filter
git rebase --onto main chore/ui-cleanup
# Resolver conflictos triviales si los hay, force-push
git push --force-with-lease
```

Funciona limpio si la base usa **merge commit** o **rebase merge**. Con **squash merge** los SHA cambian pero el rebase sigue funcionando — sólo es importante saber que puede haber commits "duplicados" que git puede preguntar si skipear.

---

## Tips operativos

- Para validar que el backend está leyendo empresa 03: pegar `cveArt='VEDU000GR'` en una query a `/api/inventarios/?search=VEDU000GR`. Si responde con datos, el sufijo está bien.
- Si Aspel SAE GUI no muestra datos pero el backend sí, **no es un problema del backend**; revisar configuración GUI de Aspel.
- Cuando un endpoint nuevo del backend devuelva 401 inesperado, revisar `shouldNotFilter` en `JwtAuthenticationFilter` antes de tocar `SecurityConfig`.
- Frontend: si `useFetchLotes` cae a `productosDummy.items`, el API falló silenciosamente — revisar `EXPO_PUBLIC_API_URL` y network del device.

---

## Aprendizajes para sesiones futuras (lecciones acumuladas)

### Verificar antes de afirmar sobre Aspel

**No asumir nombres de campos ni valores sin consultar la DB primero.** En esta sesión inventé un campo `CTR_LOTE` que no existe (el real es `CON_LOTE`), escribí en CLAUDE.md que el flag estaba apagado cuando en realidad está prendido en los 37,199 productos, y propuse un plan de migración basado en esa premisa falsa. Antes de escribir cualquier cosa que afirme "Aspel tiene campo X" o "BAMX tiene Y configurado así", ejecutar una query directa con `isql` y verificar. El costo del query es <1 min; el costo de propagar info falsa en CLAUDE.md es horas.

Patrón seguro para verificar schema:
```sql
SET NAMES WIN1252;
SELECT TRIM(RDB$FIELD_NAME) FROM RDB$RELATION_FIELDS
WHERE RDB$RELATION_NAME = 'INVE03' AND UPPER(RDB$FIELD_NAME) LIKE '%LOTE%';
```

### Distinguir "el sistema lo soporta" vs "el usuario lo usa"

Aspel soporta lote+caducidad si `CON_LOTE='S'`. Eso **no significa** que BAMX lo esté usando. En esta sesión asumí (mal) que el dato estaba pero invisible; la realidad es que el dato no se está capturando en la práctica. **Regla**: cuando un feature de la app dependa de un dato que viene del ERP, antes de construir, **verificar con queries que ese dato existe en cantidad significativa** — no que la columna existe, sino que está poblada por usuarios reales.

### El frontend defiende contra el backend

El backend manda placeholders externos (URL de pngtree.com) y números con ruido de flotante. El frontend NO debería confiar ciegamente — debe sanitizar:
- URLs externas → filtrar con `isUsableImage` y `onError` fallback.
- Números → clampear ruido con `formatQuantity` (< 0.001 abs → 0).
- Si el backend cambia, estos helpers absorben el cambio sin romper la UI.

### Cuando el usuario reporta un bug, separar regresión vs estado base

Cuando el usuario reportó "el backend no levanta" en chore/ui-cleanup, fue tentador asumir que algo de la branch lo rompió. Verificando: mi branch no toca backend → no es regresión. El bug existe en `main` desde hace 6 meses. **Patrón**: antes de empezar a debuggear, validar si el problema **también ocurre en `main` sin mis cambios**. Ahorra rabbit holes.

### Stacked branches > esperar al merge

Si una PR está bloqueada por revisión humana y el work-in-progress depende de ella, branchear desde la branch en PR es mejor que esperar. El rebase posterior es rutina, no drama.

### Conversaciones largas con el usuario sobre arquitectura

Cuando el usuario pregunta "¿qué opinas?" sobre decisiones (read-only vs read-write, migración vs cutoff, etc.), no es invitación a implementar. Es invitación a opinar y explorar. **Antes de codear cualquier cosa que cambie alcance**, hacer pregunta de cierre tipo "¿procedo con A o prefieres ajustar?". El usuario suele tener contexto operativo que no está en el repo.

### CLAUDE.md es producto, no scratchpad

Cuando algo en CLAUDE.md resulte estar mal, **corregirlo explícitamente y documentar la corrección** (no borrar como si nunca hubiera estado). Ej: "En sesión anterior se documentó campo `CTR_LOTE` — corregido: es `CON_LOTE`." Eso previene que la próxima sesión repita el error.

### El read-only es una restricción simplificadora, no técnica

BAMX podría querer captura desde la app (V2). Hoy no, porque la regla read-only nos obliga a pensar en la app como visor + ayudante de proceso. Eso reduce el alcance dramáticamente y permite que la app sea útil **sin** tocar Aspel. Si una feature requiere romper read-only, hay que tratar como decisión grande, no feature menor.
