<#
.SYNOPSIS
    Compila el APK de las tablets con la URL del servidor de BAMX quemada adentro.

.DESCRIPTION
    Corre en la MAQUINA DE DESARROLLO (la que tiene Android SDK), no en la de
    BAMX. Compila en local con Gradle: no necesita cuenta de Expo ni EAS.

    La URL del backend se INLINEA al compilar: queda escrita dentro del APK.
    Si la IP del servidor cambia, hay que volver a correr este script y
    reinstalar el APK en cada tablet. Por eso -ApiUrl es obligatorio y se valida.

    Que hace, en orden:
      1. Valida la URL: http, con puerto, y nada de localhost (desde la tablet
         "localhost" es la propia tablet).
      2. Localiza Node, el Android SDK y un JDK 17-21 para Gradle.
      3. Compila en modo HERMETICO. EXPO_NO_DOTENV=1 hace que Expo ignore
         frontend\.env (que trae la IP de desarrollo) y las EXPO_PUBLIC_* se
         pasan explicitas. Ademas borra la cache de Metro: Metro no la
         invalida cuando cambian esas variables y podria hornear la URL vieja.
      4. expo prebuild (genera frontend\android, ignorado por git) y
         gradlew assembleRelease.
      5. ABRE el APK y verifica que la URL quedo adentro. Si no esta, falla.
         Es la unica forma de saber a donde apunta el APK antes de instalarlo
         en todas las tablets.
      6. Lo deja en deploy\dist\apk\ con el host y el puerto en el nombre.

    Por que no EAS en la nube: EAS no sube frontend\.env (esta en .gitignore)
    y el APK saldria apuntando a http://localhost:8080. Ver deploy\README.md.

    La primera vez tarda (baja el NDK y compila codigo nativo por cada ABI).
    Las siguientes reutilizan la cache de Gradle y son mucho mas rapidas.

    NOTA: escrito sin acentos a proposito (PowerShell 5.1 lee los .ps1 como
    ANSI si no traen BOM).

.PARAMETER ApiUrl
    URL del backend tal como la vera la tablet: http://<IP-fija>:<puerto>.

.PARAMETER Abis
    Arquitecturas a compilar. El default cubre tablets ARM de 32 y 64 bits.
    Para probar en el emulador de Android Studio agregar x86_64.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\05-build-apk.ps1 -ApiUrl http://192.168.1.100:8080

.EXAMPLE
    # Para probarlo tambien en el emulador:
    powershell -ExecutionPolicy Bypass -File .\05-build-apk.ps1 -ApiUrl http://192.168.1.100:8080 -Abis "armeabi-v7a,arm64-v8a,x86_64"
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)] [string] $ApiUrl,
    [string] $Abis         = "armeabi-v7a,arm64-v8a",
    [string] $JdkPath      = "",
    [string] $AndroidSdk   = "",
    # Refrigeradores: mientras no haya sensores, un broker inalcanzable a
    # proposito. Sin valor, la app caeria a broker.hivemq.com (publico).
    [string] $MqttUrl      = "wss://localhost:1883/mqtt",
    [string] $MqttUsuario  = "user",
    [string] $MqttPassword = "password"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
$frontend  = Join-Path $repoRoot "frontend"
$android   = Join-Path $frontend "android"
$salida    = Join-Path $repoRoot "deploy\dist\apk"

function Write-Paso { param([string]$T) Write-Host ""; Write-Host "  >> $T" -ForegroundColor Cyan }
function Write-Ok   { param([string]$T) Write-Host "     [ OK ] $T" -ForegroundColor Green }
function Write-Info { param([string]$T) Write-Host "     [INFO] $T" -ForegroundColor Gray }
function Write-Warn { param([string]$T) Write-Host "     [WARN] $T" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  BAMX - Build del APK para las tablets" -ForegroundColor White


# ---------------------------------------------------------------------------
# 1. La URL
# ---------------------------------------------------------------------------
Write-Paso "1. URL del servidor"

$ApiUrl = $ApiUrl.Trim().TrimEnd("/")

if ($ApiUrl -like "https://*") {
    throw "El backend habla HTTP plano, no HTTPS. Usar http://<ip>:<puerto>."
}
if ($ApiUrl -match '^http://([A-Za-z0-9.-]+):(\d{1,5})$') {
    $hostApi   = $matches[1]
    $puertoApi = [int] $matches[2]
} else {
    throw "URL invalida: '$ApiUrl'. Formato esperado: http://192.168.1.100:8080 (con puerto y sin ruta)."
}

# Una diagonal final haria que las rutas quedaran como //api/..., y el firewall
# de Spring Security rechaza las URLs con "//". Por eso el TrimEnd de arriba.
if ($hostApi -eq "localhost" -or $hostApi -like "127.*" -or $hostApi -eq "0.0.0.0" -or $hostApi -eq "10.0.2.2") {
    throw "'$hostApi' no sirve dentro del APK: desde la tablet eso es la propia tablet (o el emulador). Usar la IP fija de la computadora de BAMX en la red local."
}

$esPrivada = ($hostApi -like "192.168.*") -or ($hostApi -like "10.*") -or ($hostApi -match '^172\.(1[6-9]|2[0-9]|3[01])\.')
if (-not $esPrivada) {
    Write-Warn "'$hostApi' no es una IP de red local. Esta API NUNCA debe exponerse a internet (ver 'Deuda conocida' en deploy\README.md)."
}
Write-Ok "URL que se va a quemar en el APK: $ApiUrl"

# Informativo: desde aqui puede no verse el servidor (compilando fuera de la
# red de BAMX, por ejemplo). No se aborta por eso.
try {
    Invoke-WebRequest -Uri "$ApiUrl/api/public/fotos-inventarios/__healthcheck__" -UseBasicParsing -TimeoutSec 5 | Out-Null
    Write-Info "El servidor respondio (inesperado: se esperaba 404, pero hay alguien escuchando)."
} catch {
    if ($_.Exception.Response -and [int]$_.Exception.Response.StatusCode -eq 404) {
        Write-Ok "El backend responde en esa URL desde esta maquina (404 del healthcheck)."
    } else {
        Write-Info "No se pudo contactar el backend desde esta maquina. Es normal si se compila fuera de la red de BAMX."
    }
}


# ---------------------------------------------------------------------------
# 2. Herramientas
# ---------------------------------------------------------------------------
Write-Paso "2. Herramientas"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    throw "No se encontro Node.js en el PATH. Instalar Node 20.19 o superior."
}
Write-Ok "Node $(node --version)"

if ($AndroidSdk -eq "") {
    foreach ($c in @($env:ANDROID_HOME, $env:ANDROID_SDK_ROOT, (Join-Path $env:LOCALAPPDATA "Android\Sdk"))) {
        if ($c -and (Test-Path (Join-Path $c "platform-tools"))) { $AndroidSdk = $c; break }
    }
}
if ($AndroidSdk -eq "" -or -not (Test-Path (Join-Path $AndroidSdk "platform-tools"))) {
    throw "No se encontro el Android SDK. Instalar Android Studio (trae el SDK) o pasar -AndroidSdk 'C:\ruta\al\Sdk'."
}
Write-Ok "Android SDK: $AndroidSdk"

# Gradle 8 + AGP 8 corren sobre JDK 17 a 21. El JDK 25/26 que usa el backend
# NO sirve aqui: Gradle revienta con "Unsupported class file major version".
function Get-VersionJdk {
    param([string] $Ruta)
    $release = Join-Path $Ruta "release"
    if (-not (Test-Path $release)) { return 0 }
    $linea = Select-String -Path $release -Pattern '^JAVA_VERSION="(\d+)' | Select-Object -First 1
    if ($linea) { return [int] $linea.Matches[0].Groups[1].Value }
    return 0
}

if ($JdkPath -eq "") {
    $candidatos = @()
    if ($env:JAVA_HOME) { $candidatos += $env:JAVA_HOME }
    foreach ($raiz in @("C:\Program Files\Java", "C:\Program Files\Eclipse Adoptium", "C:\Program Files\Microsoft")) {
        $candidatos += (Get-ChildItem $raiz -Directory -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
    }
    $candidatos += "C:\Program Files\Android\Android Studio\jbr"
    $candidatos = @($candidatos | Where-Object { $_ })

    foreach ($c in $candidatos) {
        $v = Get-VersionJdk $c
        if ($v -ge 17 -and $v -le 21 -and (Test-Path (Join-Path $c "bin\java.exe"))) { $JdkPath = $c; break }
    }
}
if ($JdkPath -eq "" -or -not (Test-Path (Join-Path $JdkPath "bin\java.exe"))) {
    throw "No se encontro un JDK 17 a 21 para Gradle. Instalar Temurin 17, o pasar -JdkPath (el 'jbr' de Android Studio sirve)."
}
Write-Ok "JDK para Gradle: $JdkPath (Java $(Get-VersionJdk $JdkPath))"

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Info "No hay node_modules; instalando dependencias (npm ci)..."
    cmd /c "cd /d `"$frontend`" && npm ci"
    if ($LASTEXITCODE -ne 0) { throw "npm ci fallo (codigo $LASTEXITCODE)." }
}
Write-Ok "Dependencias del frontend presentes."


# ---------------------------------------------------------------------------
# 3-4. Compilar
# ---------------------------------------------------------------------------
# Las variables se ponen en el entorno de ESTE proceso para que las hereden
# npx y Gradle, y se restauran al final para no ensuciar la sesion.
$variables = [ordered]@{
    "EXPO_NO_DOTENV"                          = "1"
    "EXPO_NO_GIT_STATUS"                      = "1"
    "CI"                                      = "1"
    "EXPO_PUBLIC_API_URL"                     = $ApiUrl
    "EXPO_PUBLIC_MQTT_BROKER_URL"             = $MqttUrl
    "EXPO_PUBLIC_MQTT_USERNAME"               = $MqttUsuario
    "EXPO_PUBLIC_MQTT_PASSWORD"               = $MqttPassword
    "ANDROID_HOME"                            = $AndroidSdk
    "JAVA_HOME"                               = $JdkPath
    # Propiedad de Gradle via entorno: evita pelearse con las comas en cmd.
    "ORG_GRADLE_PROJECT_reactNativeArchitectures" = $Abis
}
$previas = @{}
foreach ($k in $variables.Keys) {
    $previas[$k] = [Environment]::GetEnvironmentVariable($k, "Process")
    [Environment]::SetEnvironmentVariable($k, $variables[$k], "Process")
}

try {
    Write-Paso "3. Limpiando la cache de Metro"
    $cacheMetro = Join-Path ([IO.Path]::GetTempPath()) "metro-cache"
    if (Test-Path $cacheMetro) {
        Remove-Item $cacheMetro -Recurse -Force -ErrorAction SilentlyContinue
        Write-Ok "Borrada $cacheMetro"
    } else {
        Write-Ok "No habia cache de Metro."
    }

    Write-Paso "4a. expo prebuild (genera frontend\android)"
    # prebuild reescribe los scripts "android"/"ios" de package.json (de
    # "expo start --android" a "expo run:android"). Es un archivo versionado y
    # este proyecto es managed: se respalda byte a byte y se restaura al final.
    $packageJson = Join-Path $frontend "package.json"
    $packageOriginal = [IO.File]::ReadAllBytes($packageJson)
    try {
        cmd /c "cd /d `"$frontend`" && npx expo prebuild --platform android --clean --no-install"
        if ($LASTEXITCODE -ne 0) { throw "expo prebuild fallo (codigo $LASTEXITCODE)." }
    } finally {
        [IO.File]::WriteAllBytes($packageJson, $packageOriginal)
    }
    Write-Ok "Proyecto nativo generado (package.json intacto)."

    Write-Paso "4b. gradlew assembleRelease (ABIs: $Abis)"
    Write-Info "La primera vez puede tardar 15-30 min. Las siguientes, unos minutos."
    # gradlew.bat va con ruta ABSOLUTA: si el sistema tiene definida
    # NoDefaultCurrentDirectoryInExePath, cmd no ejecuta nada del directorio
    # actual aunque se haya hecho "cd" antes, y responde "no se reconoce".
    # --no-daemon: un daemon viejo conservaria el entorno con el que arranco
    # (otra URL, otro JAVA_HOME).
    $gradlew = Join-Path $android "gradlew.bat"
    cmd /c "cd /d `"$android`" && `"$gradlew`" assembleRelease --no-daemon"
    if ($LASTEXITCODE -ne 0) { throw "Gradle fallo (codigo $LASTEXITCODE). Revisar la salida de arriba." }
} finally {
    foreach ($k in $variables.Keys) {
        [Environment]::SetEnvironmentVariable($k, $previas[$k], "Process")
    }
}

$apk = Join-Path $android "app\build\outputs\apk\release\app-release.apk"
if (-not (Test-Path $apk)) {
    throw "Gradle termino bien pero no aparecio $apk."
}


# ---------------------------------------------------------------------------
# 5. Verificar que la URL quedo adentro
# ---------------------------------------------------------------------------
Write-Paso "5. Verificando la URL dentro del APK"

Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [IO.Compression.ZipFile]::OpenRead($apk)
try {
    $entrada = $zip.Entries | Where-Object { $_.FullName -eq "assets/index.android.bundle" } | Select-Object -First 1
    if (-not $entrada) { throw "El APK no trae assets/index.android.bundle; no se puede verificar la URL." }

    $flujo = $entrada.Open()
    $memoria = New-Object IO.MemoryStream
    $flujo.CopyTo($memoria)
    $flujo.Dispose()
    # Latin1 mapea cada byte a un caracter: sirve para buscar texto ASCII
    # dentro del bytecode de Hermes, que guarda los strings tal cual.
    $contenido = [Text.Encoding]::GetEncoding(28591).GetString($memoria.ToArray())
    $memoria.Dispose()
} finally {
    $zip.Dispose()
}

if (-not $contenido.Contains($ApiUrl)) {
    throw "La URL $ApiUrl NO aparece dentro del APK. No instalarlo: apuntaria a otro servidor."
}
Write-Ok "La URL $ApiUrl esta dentro del bundle."

# La URL de desarrollo de frontend\.env no debe colarse.
$envDev = Join-Path $frontend ".env"
if (Test-Path $envDev) {
    $lineaDev = Get-Content $envDev | Where-Object { $_ -match '^\s*EXPO_PUBLIC_API_URL\s*=\s*(\S+)' } | Select-Object -First 1
    if ($lineaDev -and $lineaDev -match '=\s*(\S+)') {
        $urlDev = $matches[1].TrimEnd("/")
        if ($urlDev -ne $ApiUrl -and $contenido.Contains($urlDev)) {
            throw "El APK contiene la URL de desarrollo ($urlDev). El build no fue hermetico; no instalarlo."
        }
        Write-Ok "No se colo la URL de desarrollo de frontend\.env."
    }
}


# ---------------------------------------------------------------------------
# 6. Publicar
# ---------------------------------------------------------------------------
Write-Paso "6. Copiando a deploy\dist\apk"

if (-not (Test-Path $salida)) { New-Item -ItemType Directory -Path $salida -Force | Out-Null }
$nombre  = "BAMX-{0}-{1}-{2}.apk" -f $hostApi, $puertoApi, (Get-Date -Format "yyyyMMdd-HHmm")
$destino = Join-Path $salida $nombre
Copy-Item $apk $destino -Force

$mb   = [math]::Round((Get-Item $destino).Length / 1MB, 1)
$hash = (Get-FileHash $destino -Algorithm SHA256).Hash

Write-Host ""
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  APK listo" -ForegroundColor Green
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  archivo: $destino  ($mb MB)" -ForegroundColor White
Write-Host "  apunta a: $ApiUrl" -ForegroundColor White
Write-Host "  sha256:  $hash" -ForegroundColor DarkGray
Write-Host ""
Write-Host "  Instalar en cada tablet: copiar el .apk, abrirlo y aceptar" -ForegroundColor Gray
Write-Host "  'Instalar apps de fuentes desconocidas'. Con cable USB:" -ForegroundColor Gray
Write-Host "    adb install -r `"$destino`"" -ForegroundColor Gray
Write-Host ""
Write-Host "  Prueba en sitio: si el login dice 'No se pudo conectar con el" -ForegroundColor DarkGray
Write-Host "  servidor ...', el mensaje trae la URL de arriba: es red o firewall," -ForegroundColor DarkGray
Write-Host "  no la contrasena." -ForegroundColor DarkGray
Write-Host ""
