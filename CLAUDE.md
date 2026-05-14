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

### Convención de "prioridades" (atención: hay inconsistencia)
- `AlmacenService.getDashboard`: `criticalDate = today + 2 días`, `warningDate = today + 5 días` ← **correcto** (lo que caduca antes es crítico).
- `InveService.getAllInve`: `warningDate = today + 2 días`, `criticalDate = today + 5 días` ← **invertido**. Ver BLOCKERS abajo.

### Queries de almacén por urgencia (`LtpdRepository`)
- `findWarehouseNameInCritical(cveArt, criticalDate)`: `l.fchCaduc <= :criticalDate OR fchCaduc IS NULL`.
- `findWarehouseNameInWarning(cveArt, warningDate)`: `l.fchCaduc <= :warningDate` ← se traslapa con critical, debería excluirlo (`AND fchCaduc > :criticalDate`).
- `findWarehouseNameInGood(cveArt, warningDate)`: `l.fchCaduc > :warningDate`.

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

---

## Cambios importantes ya hechos en el backend

- Arreglado `mvnw.cmd` (wrapper Windows).
- `LtpdRepository`: ID de `Ltpd` corregido a `Integer` (era `String`).
- Configurado para leer `.env` vía `spring.config.import`.
- Lógica multi-empresa: `EmpresaPhysicalNamingStrategy` + `EmpresaSqlStatementInspector` + ThreadLocal seteado por `JwtAuthenticationFilter`.
- Auth/JWT incluye claim `empresa`.
- Fallback en `TokenBlockListService` cuando `TOKEN_BLOCK_LIST` no existe.
- Tests pasan con `cmd /c mvnw.cmd test` (sobre H2, no Firebird).

---

## Issues conocidos (resumen, ver review en sesión para detalle)

**BLOCKERS para producción**
- `SecurityConfig` con `requestMatchers("/**").permitAll()`: la protección efectiva vive en el filter, frágil.
- `criticalDate`/`warningDate` invertidos entre `InveService` y `AlmacenService`: el semáforo del inventario está al revés del dashboard.
- `useSemaforoStats` filtra por `producto.status === "critical"|"warning"|"good"` pero el backend nunca pone esos valores → Semaforo siempre muestra 0.
- `StackedBarChart` truena con `data: []` (`Object.keys(mappedData[0])` → crash).
- CORS abierto a `*` con `permitAll`.

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

## Tips operativos

- Para validar que el backend está leyendo empresa 03: pegar `cveArt='VEDU000GR'` en una query a `/api/inventarios/?search=VEDU000GR`. Si responde con datos, el sufijo está bien.
- Si Aspel SAE GUI no muestra datos pero el backend sí, **no es un problema del backend**; revisar configuración GUI de Aspel.
- Cuando un endpoint nuevo del backend devuelva 401 inesperado, revisar `shouldNotFilter` en `JwtAuthenticationFilter` antes de tocar `SecurityConfig`.
- Frontend: si `useFetchLotes` cae a `productosDummy.items`, el API falló silenciosamente — revisar `EXPO_PUBLIC_API_URL` y network del device.
