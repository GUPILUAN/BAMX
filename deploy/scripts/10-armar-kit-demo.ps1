<#
.SYNOPSIS
    Arma el BAMX-DEMO-KIT: todo lo necesario para levantar la demo en una
    laptop Windows que no tiene NADA instalado.

.DESCRIPTION
    Corre en ESTA computadora (la que ya tiene Aspel, Firebird y el repo).
    Produce una carpeta autocontenida que se copia a una USB o a la nube.

    Lo que mete en el kit:

      db\empresa03.fbk    respaldo consistente de SAE80EMPRE03.FDB (gbak)
      db\perfiles.fbk     respaldo de PERFILES.FDB (usuarios de la app)
      app\bamx-backend.jar
      app\.env            config del backend con rutas de C:\BAMX-DEMO
      app\frontend.env    config de Expo apuntando al emulador (10.0.2.2)
      firebird\           Firebird 2.5 PORTABLE (no se instala, se ejecuta)
      runtime\            JDK 25 portable
      node\               Node.js portable
      imagenes\           fotos de producto de Aspel
      repo\               copia del repositorio (sin node_modules)
      DEMO-LAPTOP.md      el instructivo

    Nada de esto exige instalador en la laptop salvo Android Studio.

    Los respaldos se hacen con gbak, que saca una copia consistente SIN parar
    el servicio de Firebird ni tocar la base original. Este script NO escribe
    absolutamente nada en Aspel.

.PARAMETER Destino
    Carpeta donde se arma el kit. Default: Escritorio\BAMX-DEMO-KIT

.PARAMETER SinRepo
    No copia el repositorio (util si la laptop va a clonar de GitHub).

.PARAMETER ConNodeModules
    Copia tambien frontend\node_modules (900 MB, ~50 mil archivos). Solo si
    el internet donde vas a demostrar es malo y no quieres depender de
    "npm install". Tarda MUCHO en copiarse a USB.

.PARAMETER Reusar
    Si ya existen los .fbk en el destino, no los vuelve a generar.

.EXAMPLE
    .\10-armar-kit-demo.ps1
    .\10-armar-kit-demo.ps1 -Destino E:\BAMX-DEMO-KIT
#>

[CmdletBinding()]
param(
    [string] $Destino = (Join-Path ([Environment]::GetFolderPath('Desktop')) 'BAMX-DEMO-KIT'),
    [switch] $SinRepo,
    [switch] $ConNodeModules,
    [switch] $Reusar
)

$ErrorActionPreference = 'Stop'
$inicio = Get-Date

function Titulo($t) {
    Write-Host ""
    Write-Host "=== $t " -ForegroundColor Cyan -NoNewline
    Write-Host ("=" * [Math]::Max(0, 60 - $t.Length)) -ForegroundColor Cyan
}
function Ok($m)    { Write-Host "  [ok]   $m" -ForegroundColor Green }
function Info($m)  { Write-Host "  ....   $m" -ForegroundColor Gray }
function Aviso($m) { Write-Host "  [!]    $m" -ForegroundColor Yellow }
function Fatal($m) { Write-Host "  [ERR]  $m" -ForegroundColor Red; exit 1 }

# Escribe SIN BOM. Set-Content -Encoding UTF8 en PowerShell 5.1 mete un BOM al
# inicio; Spring lee el .env como .properties en ISO-8859-1, el BOM se le pega a
# la primera clave (queda "?JWT_SECRET") y el backend truena al arrancar con
# "Could not resolve placeholder 'JWT_SECRET'". dotenv de Expo se rompe igual.
function EscribirSinBom($ruta, $contenido) {
    $utf8SinBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($ruta, $contenido, $utf8SinBom)
}

function Tam($ruta) {
    if (-not (Test-Path $ruta)) { return "0 MB" }
    $item = Get-Item $ruta
    if ($item.PSIsContainer) {
        $b = (Get-ChildItem $ruta -Recurse -Force -File -ErrorAction SilentlyContinue |
              Measure-Object -Property Length -Sum).Sum
    } else {
        $b = $item.Length
    }
    if (-not $b) { $b = 0 }
    if ($b -lt 1MB) { return ("{0:N0} KB" -f ($b / 1KB)) }
    return ("{0:N0} MB" -f ($b / 1MB))
}

# ---------------------------------------------------------------------------
# 0. Ubicar el repo y leer el .env de desarrollo
# ---------------------------------------------------------------------------
Titulo "Contexto"

$repoRaiz = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
if (-not (Test-Path (Join-Path $repoRaiz 'backend\pom.xml'))) {
    Fatal "No encuentro el repo. Este script vive en deploy\scripts\ del repositorio."
}
Ok "Repo: $repoRaiz"

$envDev = Join-Path $repoRaiz 'backend\.env'
if (-not (Test-Path $envDev)) {
    Fatal "No existe backend\.env. Lo necesito para saber donde viven las bases de Aspel."
}

$cfg = @{}
Get-Content $envDev | ForEach-Object {
    $linea = $_.Trim()
    if ($linea -and -not $linea.StartsWith('#') -and $linea.Contains('=')) {
        $i = $linea.IndexOf('=')
        $cfg[$linea.Substring(0, $i).Trim()] = $linea.Substring($i + 1).Trim()
    }
}

$dbEmpresa  = $cfg['DATABASE_PATH_EMPRESA']
$dbAuth     = $cfg['DATABASE_PATH_AUTH']
$imagenes   = $cfg['APP_IMAGES_PATH']
$sufijo     = $cfg['APP_EMPRESA_SUFFIX']
if (-not $sufijo) { $sufijo = '03' }

foreach ($par in @(@('DATABASE_PATH_EMPRESA', $dbEmpresa), @('DATABASE_PATH_AUTH', $dbAuth))) {
    if (-not $par[1]) { Fatal "Falta $($par[0]) en backend\.env" }
    if (-not (Test-Path $par[1])) { Fatal "$($par[0]) apunta a un archivo que no existe: $($par[1])" }
}
Ok "Base empresa:  $dbEmpresa  ($(Tam $dbEmpresa))"
Ok "Base auth:     $dbAuth  ($(Tam $dbAuth))"
Ok "Sufijo empresa: $sufijo"

# ---------------------------------------------------------------------------
# 1. Localizar Firebird, JDK y Node para copiarlos portables
# ---------------------------------------------------------------------------
Titulo "Herramientas a empacar"

$firebirdDir = @(
    'C:\Program Files (x86)\Firebird\Firebird_2_5',
    'C:\Program Files\Firebird\Firebird_2_5'
) | Where-Object { Test-Path (Join-Path $_ 'bin\gbak.exe') } | Select-Object -First 1
if (-not $firebirdDir) { Fatal "No encuentro Firebird 2.5. Busque en Program Files y Program Files (x86)." }
$gbak = Join-Path $firebirdDir 'bin\gbak.exe'
Ok "Firebird 2.5: $firebirdDir  ($(Tam $firebirdDir))"

# JDK: el mas nuevo que sea >= 25 (el jar se compilo con release 25)
$jdkDir = Get-ChildItem 'C:\Program Files\Java', 'C:\Program Files\Eclipse Adoptium', 'C:\Program Files\Microsoft' -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -match 'jdk-?(\d+)' -and [int]$Matches[1] -ge 25 } |
    Sort-Object Name -Descending | Select-Object -First 1
if (-not $jdkDir -or -not (Test-Path (Join-Path $jdkDir.FullName 'bin\java.exe'))) {
    Fatal "No encuentro un JDK 25 o mayor. El jar necesita Java 25+."
}
Ok "JDK: $($jdkDir.FullName)  ($(Tam $jdkDir.FullName))"

$nodeDir = @('C:\Program Files\nodejs') | Where-Object { Test-Path (Join-Path $_ 'node.exe') } | Select-Object -First 1
if (-not $nodeDir) {
    Aviso "No encuentro Node en C:\Program Files\nodejs. El kit ira sin Node portable."
    Aviso "En la laptop habra que instalarlo:  winget install OpenJS.NodeJS.LTS"
} else {
    Ok "Node: $nodeDir  ($(Tam $nodeDir))"
}

$jar = Join-Path $repoRaiz 'deploy\dist\bamx-backend.jar'
if (-not (Test-Path $jar)) {
    Fatal "No existe deploy\dist\bamx-backend.jar. Corre primero:  .\deploy\scripts\01-build.ps1"
}
Ok "Jar: $jar  ($(Tam $jar))"

# ---------------------------------------------------------------------------
# 2. Estructura del kit
# ---------------------------------------------------------------------------
Titulo "Armando $Destino"

foreach ($sub in @('', 'db', 'app', 'firebird', 'runtime', 'node', 'imagenes', 'repo')) {
    $ruta = if ($sub) { Join-Path $Destino $sub } else { $Destino }
    if (-not (Test-Path $ruta)) { New-Item -ItemType Directory -Path $ruta -Force | Out-Null }
}
Ok "Carpetas listas"

# ---------------------------------------------------------------------------
# 3. Respaldos de las bases (gbak, sin tocar el original)
# ---------------------------------------------------------------------------
Titulo "Respaldos de base de datos"

function Respaldar($origen, $salida, $etiqueta, $usuario, $clave) {
    if ($Reusar -and (Test-Path $salida)) {
        Aviso "$etiqueta ya existe, lo reuso ($(Tam $salida))"
        return
    }
    if (-not $usuario) { $usuario = 'sysdba' }
    if (-not $clave)   { $clave   = 'masterkey' }

    Info "$etiqueta -> gbak (puede tardar unos minutos, no interrumpas)"
    $t = Get-Date

    # $ErrorActionPreference se baja solo mientras corre el .exe: en PowerShell
    # 5.1, "2>&1" sobre un nativo convierte stderr en ErrorRecord y con 'Stop'
    # aborta el script en la llamada, sin llegar al manejo de errores de abajo.
    $previo = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        # -g  : sin garbage collection. Mas rapido y no escribe en la base original.
        # -t  : transportable, sirve aunque la laptop traiga otro build de Firebird 2.5
        $salidaGbak = & $gbak -b -g -t -user $usuario -password $clave "localhost:$origen" $salida 2>&1 |
                      ForEach-Object { $_.ToString() }
        $codigo = $LASTEXITCODE
    } finally {
        $ErrorActionPreference = $previo
    }

    if ($codigo -ne 0 -or -not (Test-Path $salida)) {
        $salidaGbak | Select-Object -Last 8 | ForEach-Object { Write-Host "         $_" -ForegroundColor Red }
        Fatal "gbak fallo con $etiqueta. Revisa que el servicio de Firebird este arriba."
    }
    Ok "$etiqueta listo: $(Tam $salida) en $([int]((Get-Date) - $t).TotalSeconds)s"
}

Respaldar $dbEmpresa (Join-Path $Destino 'db\empresa03.fbk') 'Base de empresa (inventario)' `
          $cfg['DATABASE_USERNAME_EMPRESA'] $cfg['DATABASE_PASSWORD_EMPRESA']
Respaldar $dbAuth    (Join-Path $Destino 'db\perfiles.fbk')  'Base de usuarios (login)' `
          $cfg['DATABASE_USERNAME_AUTH'] $cfg['DATABASE_PASSWORD_AUTH']

# ---------------------------------------------------------------------------
# 4. Copias portables
# ---------------------------------------------------------------------------
Titulo "Copiando herramientas portables"

function CopiarDir($origen, $destino, $etiqueta, $excluirDirs) {
    Info "$etiqueta ..."
    # OJO: no usar $args para esto, es variable automatica de PowerShell.
    $rcArgs = @($origen, $destino, '/E', '/NFL', '/NDL', '/NJH', '/NJS', '/NP', '/R:1', '/W:1')
    if ($excluirDirs) { $rcArgs += '/XD'; $rcArgs += $excluirDirs }
    $null = robocopy @rcArgs
    # robocopy: 0-7 = exito. 8+ = error real.
    if ($LASTEXITCODE -ge 8) { Fatal "robocopy fallo copiando $etiqueta (codigo $LASTEXITCODE)" }
    $global:LASTEXITCODE = 0
    Ok "$etiqueta ($(Tam $destino))"
}

CopiarDir $firebirdDir (Join-Path $Destino 'firebird') 'Firebird 2.5 portable' @('doc', 'examples', 'help', 'misc', 'include')
CopiarDir $jdkDir.FullName (Join-Path $Destino 'runtime') 'JDK portable' @('jmods', 'demo', 'sample')
if ($nodeDir) { CopiarDir $nodeDir (Join-Path $Destino 'node') 'Node portable' $null }

$imagenesOrigen = $imagenes.TrimEnd('/', '\')
if (Test-Path $imagenesOrigen) {
    CopiarDir $imagenesOrigen (Join-Path $Destino 'imagenes') 'Imagenes de producto' $null
} else {
    Aviso "No encuentro la carpeta de imagenes ($imagenesOrigen). La app usara los iconos por linea."
}

Copy-Item $jar (Join-Path $Destino 'app\bamx-backend.jar') -Force
Ok "Jar copiado"

if (-not $SinRepo) {
    $excluir = @('node_modules', 'target', '.expo', 'coverage', 'dist', '.metro-health-check')
    CopiarDir $repoRaiz (Join-Path $Destino 'repo') 'Repositorio (sin node_modules ni target)' $excluir
    if ($ConNodeModules) {
        CopiarDir (Join-Path $repoRaiz 'frontend\node_modules') (Join-Path $Destino 'repo\frontend\node_modules') 'node_modules (esto tarda)' $null
    }
}

# ---------------------------------------------------------------------------
# 5. Archivos de configuracion de la demo
# ---------------------------------------------------------------------------
Titulo "Configuracion de la demo"

# JWT nuevo para la laptop. Es una demo local, pero no se reusa el de desarrollo.
$bytes = New-Object byte[] 48
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$jwt = [Convert]::ToBase64String($bytes)

$envBackend = @"
# =============================================================================
# BAMX backend - DEMO EN LAPTOP
# Generado por 10-armar-kit-demo.ps1 el $(Get-Date -Format 'yyyy-MM-dd HH:mm')
# =============================================================================
# Las rutas van con diagonal normal "/". Spring lee esto como .properties y
# "\" es caracter de escape.
# APP_IMAGES_PATH TIENE que terminar en "/".
# Este archivo se busca en el DIRECTORIO DE TRABAJO del proceso: hay que
# arrancar el jar parado en la carpeta donde vive este .env.
# =============================================================================

JWT_SECRET=$jwt
ACCESS_TOKEN_EXPIRATION=600000
REFRESH_TOKEN_EXPIRATION=2592000000

APP_HOST_URL=http://localhost:8080
APP_IMAGES_PATH=C:/BAMX-DEMO/imagenes/
APP_EMPRESA_SUFFIX=$sufijo

DATABASE_HOST_EMPRESA=localhost
DATABASE_PORT_EMPRESA=3050
DATABASE_PATH_EMPRESA=C:/BAMX-DEMO/db/SAE80EMPRE03.FDB
DATABASE_USERNAME_EMPRESA=sysdba
DATABASE_PASSWORD_EMPRESA=masterkey

DATABASE_HOST_AUTH=localhost
DATABASE_PORT_AUTH=3050
DATABASE_PATH_AUTH=C:/BAMX-DEMO/db/PERFILES.FDB
DATABASE_USERNAME_AUTH=sysdba
DATABASE_PASSWORD_AUTH=masterkey
"@
EscribirSinBom (Join-Path $Destino 'app\.env') $envBackend
Ok "app\.env (JWT nuevo generado)"

# La copia del repo se lleva el backend\.env de desarrollo, que apunta a rutas de
# Aspel que en la laptop no existen. Se pisa con el de la demo para que tambien
# funcione "mvnw spring-boot:run" desde el repo, no solo el jar.
$envRepo = Join-Path $Destino 'repo\backend\.env'
if (Test-Path (Split-Path $envRepo -Parent)) {
    EscribirSinBom $envRepo $envBackend
    Ok "repo\backend\.env (mismas rutas de la laptop)"
}

$envFront = @"
# =============================================================================
# Frontend Expo - DEMO EN EMULADOR DE ANDROID STUDIO
# =============================================================================
# 10.0.2.2 NO es un typo: es la direccion con la que el emulador de Android
# alcanza el localhost de la laptop anfitriona. "localhost" adentro del
# emulador es el emulador mismo, y ahi no hay backend.
#
# Si en vez del emulador usas una tablet fisica, aqui va la IP de LAN de la
# laptop (ipconfig -> IPv4) y ambas tienen que estar en la misma WiFi.
#
# Esta variable se INLINEA cuando Metro empaqueta. Si la cambias, hay que
# reiniciar Expo con cache limpio:  npx expo start -c
# =============================================================================

EXPO_PUBLIC_API_URL=http://10.0.2.2:8080
EXPO_PUBLIC_ENV=development

# Broker inalcanzable A PROPOSITO. Sin sensores instalados, esto deja la
# pestana de Refrigeradores vacia en vez de mostrar lecturas de desconocidos
# del broker publico de HiveMQ (que es a donde cae por default si estas
# variables faltan).
EXPO_PUBLIC_MQTT_BROKER_URL=wss://localhost:1883/mqtt
EXPO_PUBLIC_MQTT_USERNAME=user
EXPO_PUBLIC_MQTT_PASSWORD=password
"@
EscribirSinBom (Join-Path $Destino 'app\frontend.env') $envFront

# Igual que con el backend: la copia del repo arrastra el frontend\.env de
# desarrollo, con la IP de LAN de ESTA maquina. En la laptop esa IP no existe y
# la app se veria vacia sin decir por que. Se pisa aqui.
$envFrontRepo = Join-Path $Destino 'repo\frontend\.env'
if (Test-Path (Split-Path $envFrontRepo -Parent)) {
    EscribirSinBom $envFrontRepo $envFront
    Ok "repo\frontend\.env (apunta a 10.0.2.2, ya no a la IP de esta maquina)"
}
Ok "app\frontend.env (apunta a 10.0.2.2 para el emulador)"

$doc = Join-Path $repoRaiz 'deploy\DEMO-LAPTOP.md'
if (Test-Path $doc) {
    Copy-Item $doc (Join-Path $Destino 'DEMO-LAPTOP.md') -Force
    Ok "DEMO-LAPTOP.md"
}

$leeme = @"
BAMX - KIT DE DEMO
==================

Copia ESTA CARPETA COMPLETA a la laptop, en C:\BAMX-DEMO
(la ruta importa: el archivo app\.env ya trae escritas esas rutas).

OJO: aqui adentro va el inventario completo de BAMX, su tabla de usuarios y
las contrasenas de base de datos. Pasalo por USB o enlace privado, nunca por
un servicio de transferencia publico, y borralo de la laptop al terminar.

Luego abre Claude Code parado en C:\BAMX-DEMO\repo y dile:

    Lee deploy\DEMO-LAPTOP.md y ejecutalo desde el paso 3.

El paso a paso completo esta en DEMO-LAPTOP.md, aqui al lado.

Lo unico que este kit NO trae y hay que descargar: Android Studio.
Empieza esa descarga ANTES que nada, es la que tarda.

    winget install Google.AndroidStudio

Contenido:
  db\          respaldos de las bases (se restauran en la laptop)
  app\         el backend ya compilado y su configuracion
  firebird\    Firebird 2.5 portable, no se instala
  runtime\     Java, no se instala
  node\        Node.js, no se instala
  imagenes\    fotos de producto
  repo\        el codigo
"@
EscribirSinBom (Join-Path $Destino 'LEEME.txt') $leeme
Ok "LEEME.txt"

# ---------------------------------------------------------------------------
# 6. Cierre
# ---------------------------------------------------------------------------
Titulo "Listo"

Write-Host ""
Write-Host "  Kit armado en: " -NoNewline; Write-Host $Destino -ForegroundColor White
Write-Host "  Tamano total:  " -NoNewline; Write-Host (Tam $Destino) -ForegroundColor White
Write-Host "  Tiempo:        $([int]((Get-Date) - $inicio).TotalSeconds)s"
Write-Host ""
Write-Host "  Siguiente paso:" -ForegroundColor Cyan
Write-Host "    1. Copia la carpeta a la laptop como C:\BAMX-DEMO"
Write-Host "    2. En la laptop, lanza la descarga de Android Studio"
Write-Host "    3. Sigue DEMO-LAPTOP.md"
Write-Host ""
