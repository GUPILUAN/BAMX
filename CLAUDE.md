Proyecto: BAMX / Banco de Alimentos México

Repo local:
C:\Users\alexi\Desktop\Folders\Work\BAMX

Branch:
feature/code-review

Stack:
- Backend: Spring Boot 3.5.7, Java, Maven, Firebird/Jaybird, JPA/Hibernate.
- Frontend: app JS/React/Next-ish en carpeta frontend.
- ERP externo: Aspel SAE 8.00.36 con bases Firebird .FDB.

Cambios importantes hechos en backend:
- Se arregló el Maven wrapper de Windows.
- Se corrigió LtpdRepository: el ID de Ltpd debe ser Integer, no String.
- Se configuró el backend para leer `.env`.
- Se agregó `APP_EMPRESA_SUFFIX=03` para forzar que el backend use empresa 03.
- Se agregó lógica de multiempresa para tablas SAE con sufijo:
  - Ejemplo: INVE01 vs INVE03, CLIE01 vs CLIE03, MULT01 vs MULT03.
- Se agregó/ajustó `EmpresaPhysicalNamingStrategy` y `EmpresaSqlStatementInspector`.
- Se ajustó auth/JWT para incluir/usar empresa.
- Se agregó fallback para cuando no exista `TOKEN_BLOCK_LIST` en la base de perfiles.
- Se quitó dependencia práctica de Docker/Testcontainers para los tests actuales.
- Tests backend pasaron con `cmd /c mvnw.cmd test`.
- Compile backend pasó con `cmd /c mvnw.cmd -DskipTests compile`.

Archivos backend tocados:
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\mvnw.cmd
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\resources\application.properties
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\auth\services\UsuarioService.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\auth\utils\TokenDecoder.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\auth\services\TokenBlockListService.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\config\EmpresaDbConfig.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\config\EmpresaPhysicalNamingStrategy.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\config\EmpresaSqlStatementInspector.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\config\SecurityConfig.java
C:\Users\alexi\Desktop\Folders\Work\BAMX\backend\src\main\java\com\bamx\backend\repositories\LtpdRepository.java

Config actual de DB:
- Base empresa real BAMX:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Datos\SAE80EMPRE03.FDB

- Base perfiles auth BAMX:
C:\Program Files (x86)\Common Files\Aspel\Perfiles\BAMX_PERFILES.FDB

- Imágenes:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Imagenes

Lo aprendido de Aspel SAE:
- Aspel SAE usa Firebird `.FDB`.
- Las tablas están sufijadas por empresa:
  - Empresa 01: INVE01, CLIE01, MULT01, etc.
  - Empresa 03: INVE03, CLIE03, MULT03, etc.
- La base grande de BAMX tiene la información real en sufijo 03.
- La app backend funciona porque fue configurada para usar empresa 03.
- Aspel visualmente parece vacío porque probablemente está abriendo contexto empresa 01 o una empresa inválida, no porque la base esté vacía.

Datos confirmados en la base grande:
- INVE03: 37199 productos
- CLIE03: 1454 clientes
- ALMACENES03: 11 almacenes
- MULT03: 164852 registros
- LTPD03: 3 lotes
- MINVE03: 872588 movimientos
- INVE01: 0 productos
- CLIE01: 0 clientes

Ejemplos confirmados que existen en Empresa03:
- Producto: VEDU000GR, VERDURA A GRANEL
- Producto: FRUT000GR, FRUTA A GRANEL
- Cliente clave 44: PUBLICO EN GENERAL

Aspel instalado:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00

Archivo de conexiones Aspel:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Conexiones.ini

Alias relevantes:
- [EJEMPLOS] apunta a:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Ejemplos\Ejemplos.fdb

- [Ejemplos03] apunta a:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Empresa03\Datos\SAE80EMPRE03.FDB

Acciones hechas sobre archivos Aspel:
- Se copió Empresa03 desde Desktop/info hacia Program Files de Aspel.
- Se copió BAMX_PERFILES.FDB a carpeta de perfiles.
- Se sobrescribió `Ejemplos.fdb` de Aspel con:
C:\Users\alexi\Desktop\info\info\Ejemplos.fdb

- Backup del Ejemplos.fdb anterior:
C:\Program Files (x86)\Common Files\Aspel\Sistemas Aspel\SAE8.00\Ejemplos\Ejemplos.fdb.bak-20260505-173919

Problema actual:
- Aspel SAE abre, pero muestra “EMPRESA INVÁLIDA, S.A. DE C.V.”
- Al abrir clientes/productos no aparecen datos.
- Salió mensaje: “Se reestructurará la base de datos, este proceso puede tardar algunos minutos.”
- La base sí tiene datos; el problema parece ser que Aspel no está abriendo correctamente la empresa 03 o no está interpretando bien el alias/contexto de empresa.

Misión siguiente:
Lograr que Aspel SAE muestre los productos/clientes reales de BAMX dentro de la interfaz de Aspel.

Hipótesis principal:
Aspel está leyendo Empresa01 o una empresa inválida, mientras que la información real está en Empresa03. Hay que hacer que Aspel abra la empresa 03 correctamente, no solo que el backend lea la `.FDB`.

Siguientes cosas a revisar:
1. Cómo Aspel decide qué empresa abrir desde la pantalla inicial.
2. Si la empresa 03 está registrada correctamente en archivos/configuración de Aspel.
3. Si `[Ejemplos03]` en `Conexiones.ini` necesita copiar exactamente todas las propiedades del alias `[EJEMPLOS]`.
4. Si hay algún archivo adicional de Aspel que mapee empresa número 03 a alias/base.
5. Si el mensaje de “reestructurar base” modificó algo o solo intentó actualizar metadata.
6. Verificar en Aspel buscando producto `VEDU000GR` o cliente `44`.