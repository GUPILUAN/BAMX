<#
.SYNOPSIS
    Instala el backend de BAMX como servicio de Windows. Requiere Administrador.

.DESCRIPTION
    Corre EN LA MAQUINA DE BAMX, despues de que 00-preflight.ps1 salio sin
    bloqueantes.

    Espera encontrar todo el material en la carpeta dist\ (que viaja en la
    USB, no esta en git):

        deploy\dist\bamx-backend.jar     <- lo produce 01-build.ps1
        deploy\dist\WinSW-x64.exe        <- descargado de github.com/winsw/winsw
        deploy\dist\.env                 <- copiado de env\.env.produccion.example y rellenado
        deploy\dist\runtime\bin\java.exe <- JDK 25 portable (zip de Temurin extraido)

    Y el XML versionado en deploy\winsw\bamx-backend.xml.

    Que hace, en orden:
      1. Valida que es Administrador y que esta todo el material.
      2. Valida el .env linea por linea (aqui se atrapan los errores tipicos).
      3. Crea C:\BAMX\app y C:\BAMX\logs y copia todo.
      4. Instala el servicio con WinSW y lo pone en arranque automatico retrasado.
      5. Abre el puerto en el firewall, solo para perfiles Private y Domain.
      6. Arranca el servicio y espera a que responda.

    Es idempotente para el firewall. Si el servicio YA existe, aborta y
    manda a usar 04-update.ps1.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\02-install.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\02-install.ps1 -Destino "D:\BAMX" -Puerto 8081
#>
[CmdletBinding()]
param(
    [string] $Destino = "C:\BAMX",
    [int]    $Puerto  = 8080,
    [switch] $SinFirewall
)

$ErrorActionPreference = "Stop"

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$deployRoot = Resolve-Path (Join-Path $scriptDir "..")
$dist       = Join-Path $deployRoot "dist"
$xmlOrigen  = Join-Path $deployRoot "winsw\bamx-backend.xml"

$appDir  = Join-Path $Destino "app"
$logsDir = Join-Path $Destino "logs"

function Write-Paso { param([string]$T) Write-Host ""; Write-Host "  >> $T" -ForegroundColor Cyan }
function Write-Ok   { param([string]$T) Write-Host "     [ OK ] $T" -ForegroundColor Green }
function Write-Info { param([string]$T) Write-Host "     [INFO] $T" -ForegroundColor Gray }
function Write-Warn { param([string]$T) Write-Host "     [WARN] $T" -ForegroundColor Yellow }

Write-Host ""
Write-Host "  BAMX - Instalacion del servicio backend" -ForegroundColor White
Write-Host "  destino: $Destino   puerto: $Puerto" -ForegroundColor DarkGray


# ---------------------------------------------------------------------------
# 1. Administrador
# ---------------------------------------------------------------------------
Write-Paso "1. Permisos"
$identidad = [Security.Principal.WindowsIdentity]::GetCurrent()
$principal = New-Object Security.Principal.WindowsPrincipal($identidad)
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Este script necesita permisos de Administrador. Abrir PowerShell con 'Ejecutar como administrador' y volver a correrlo."
}
Write-Ok "Corriendo como Administrador."


# ---------------------------------------------------------------------------
# 2. Material presente
# ---------------------------------------------------------------------------
Write-Paso "2. Material de instalacion"

$jarOrigen  = Join-Path $dist "bamx-backend.jar"
$envOrigen  = Join-Path $dist ".env"
$javaOrigen = Join-Path $dist "runtime\bin\java.exe"

$winswOrigen = $null
foreach ($n in @("WinSW-x64.exe", "WinSW.NET461.exe", "winsw.exe", "bamx-backend.exe")) {
    $p = Join-Path $dist $n
    if (Test-Path $p) { $winswOrigen = $p; break }
}

$faltantes = @()
if (-not (Test-Path $jarOrigen))  { $faltantes += "dist\bamx-backend.jar (correr 01-build.ps1 en la maquina de desarrollo)" }
if (-not (Test-Path $envOrigen))  { $faltantes += "dist\.env (copiar env\.env.produccion.example y rellenarlo)" }
if (-not (Test-Path $javaOrigen)) { $faltantes += "dist\runtime\bin\java.exe (extraer ahi el zip del JDK 25 de Temurin)" }
if (-not $winswOrigen)            { $faltantes += "dist\WinSW-x64.exe (descargar de github.com/winsw/winsw, release v2.12.0)" }
if (-not (Test-Path $xmlOrigen))  { $faltantes += "winsw\bamx-backend.xml (viene en el repo)" }

if ($faltantes.Count -gt 0) {
    Write-Host ""
    Write-Host "     Falta material:" -ForegroundColor Red
    foreach ($f in $faltantes) { Write-Host "       - $f" -ForegroundColor Red }
    throw "Faltan $($faltantes.Count) archivo(s). Ver deploy\README.md, seccion 'Que llevar en la USB'."
}

Write-Ok "jar:     $([math]::Round((Get-Item $jarOrigen).Length / 1MB, 1)) MB"
Write-Ok "winsw:   $(Split-Path -Leaf $winswOrigen)"
Write-Ok "runtime: JDK portable presente"

# Windows marca los .exe bajados de internet; sin desbloquear, el servicio
# puede negarse a arrancar.
try { Unblock-File -Path $winswOrigen -ErrorAction SilentlyContinue } catch { }


# ---------------------------------------------------------------------------
# 3. Validar el .env  (aqui es donde se atrapan los errores tipicos)
# ---------------------------------------------------------------------------
Write-Paso "3. Validacion del .env"

$config = @{}
foreach ($linea in (Get-Content $envOrigen -ErrorAction Stop)) {
    $t = $linea.Trim()
    if ($t -eq "" -or $t.StartsWith("#")) { continue }
    $i = $t.IndexOf("=")
    if ($i -lt 1) { continue }
    $config[$t.Substring(0, $i).Trim()] = $t.Substring($i + 1).Trim()
}

$obligatorias = @(
    "JWT_SECRET", "ACCESS_TOKEN_EXPIRATION", "REFRESH_TOKEN_EXPIRATION",
    "APP_HOST_URL", "APP_IMAGES_PATH",
    "DATABASE_HOST_EMPRESA", "DATABASE_PORT_EMPRESA", "DATABASE_PATH_EMPRESA",
    "DATABASE_HOST_AUTH", "DATABASE_PORT_AUTH", "DATABASE_PATH_AUTH"
)

$errores = @()

foreach ($k in $obligatorias) {
    if (-not $config.ContainsKey($k) -or $config[$k] -eq "") {
        $errores += "Falta $k. Sin ella Spring no resuelve el placeholder y el servicio no arranca."
    }
}

# Backslashes: el .env se parsea como .properties, donde "\" escapa.
foreach ($k in @("APP_IMAGES_PATH", "DATABASE_PATH_EMPRESA", "DATABASE_PATH_AUTH")) {
    if ($config.ContainsKey($k) -and $config[$k] -like "*\*") {
        $errores += "$k trae '\'. Spring lee este archivo como .properties y '\' es caracter de escape. Cambiar todas las diagonales a '/'."
    }
}

# El codigo concatena literalmente imagesPath + cveArt + ".jpg".
if ($config.ContainsKey("APP_IMAGES_PATH") -and -not $config["APP_IMAGES_PATH"].EndsWith("/")) {
    $errores += "APP_IMAGES_PATH no termina en '/'. FotoInveController concatena la ruta literalmente y quedaria invalida."
}

if ($config.ContainsKey("JWT_SECRET")) {
    if ($config["JWT_SECRET"] -like "*CAMBIAR*") {
        $errores += "JWT_SECRET sigue con el valor de la plantilla. Generar uno real."
    } elseif ($config["JWT_SECRET"].Length -lt 32) {
        $errores += "JWT_SECRET mide $($config['JWT_SECRET'].Length) caracteres. Se necesitan al menos 32."
    }
}

if (-not $config.ContainsKey("APP_EMPRESA_SUFFIX") -or $config["APP_EMPRESA_SUFFIX"] -eq "") {
    Write-Warn "APP_EMPRESA_SUFFIX vacio: se usaria el default '01', que en Aspel suele estar vacia. Confirmar con el preflight."
}

# Si la base es local, el archivo tiene que existir.
foreach ($par in @(@("DATABASE_HOST_EMPRESA","DATABASE_PATH_EMPRESA"), @("DATABASE_HOST_AUTH","DATABASE_PATH_AUTH"))) {
    $hk = $par[0]; $pk = $par[1]
    if ($config.ContainsKey($hk) -and $config.ContainsKey($pk)) {
        if ($config[$hk] -eq "localhost" -or $config[$hk] -eq "127.0.0.1") {
            $ruta = $config[$pk].Replace("/", "\")
            if (-not (Test-Path $ruta)) {
                $errores += "$pk apunta a un archivo que no existe en esta maquina: $ruta"
            }
        }
    }
}

if ($errores.Count -gt 0) {
    Write-Host ""
    foreach ($e in $errores) { Write-Host "     [FAIL] $e" -ForegroundColor Red }
    throw "El .env tiene $($errores.Count) problema(s). Corregir dist\.env y volver a correr."
}
Write-Ok "$($config.Count) variables, todas validas."

if ($config.ContainsKey("SERVER_PORT") -and $config["SERVER_PORT"] -ne "" -and [int]$config["SERVER_PORT"] -ne $Puerto) {
    $Puerto = [int] $config["SERVER_PORT"]
    Write-Info "El .env define SERVER_PORT=$Puerto; se usa ese para el firewall y la verificacion."
}


# ---------------------------------------------------------------------------
# 4. El servicio no debe existir ya
# ---------------------------------------------------------------------------
Write-Paso "4. Estado previo del servicio"
$existente = Get-Service -Name "bamx-backend" -ErrorAction SilentlyContinue
if ($existente) {
    throw "El servicio 'bamx-backend' YA esta instalado (estado: $($existente.Status)). Para actualizar el jar usar 04-update.ps1. Para reinstalar desde cero, correr primero 99-uninstall.ps1."
}
Write-Ok "No hay instalacion previa."


# ---------------------------------------------------------------------------
# 5. Copiar archivos
# ---------------------------------------------------------------------------
Write-Paso "5. Copiando a $Destino"

New-Item -ItemType Directory -Path $appDir  -Force | Out-Null
New-Item -ItemType Directory -Path $logsDir -Force | Out-Null

Copy-Item $jarOrigen   (Join-Path $appDir "bamx-backend.jar") -Force
Copy-Item $envOrigen   (Join-Path $appDir ".env")             -Force
Copy-Item $xmlOrigen   (Join-Path $appDir "bamx-backend.xml") -Force
# El .exe y el .xml TIENEN que llamarse igual: asi encuentra WinSW su config.
Copy-Item $winswOrigen (Join-Path $appDir "bamx-backend.exe") -Force

$runtimeDestino = Join-Path $appDir "runtime"
if (Test-Path $runtimeDestino) { Remove-Item $runtimeDestino -Recurse -Force }
Copy-Item (Join-Path $dist "runtime") $runtimeDestino -Recurse -Force

Write-Ok "jar, .env, .xml, .exe y runtime copiados."

$javaDestino = Join-Path $appDir "runtime\bin\java.exe"
if (-not (Test-Path $javaDestino)) {
    throw "Despues de copiar no existe $javaDestino. Revisar que el zip del JDK se haya extraido SIN la carpeta contenedora (dist\runtime\bin\java.exe, no dist\runtime\jdk-25\bin\java.exe)."
}
& $javaDestino -version
Write-Ok "El JDK portable responde."


# ---------------------------------------------------------------------------
# 6. Ajustar el <depend> si el servicio de Firebird se llama distinto
# ---------------------------------------------------------------------------
Write-Paso "6. Dependencia de Firebird"
$guardian = Get-Service -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "*irebird*Guardian*" -or $_.Name -like "*Guardian*irebird*" } |
            Select-Object -First 1

$xmlDestino = Join-Path $appDir "bamx-backend.xml"
if ($guardian) {
    if ($guardian.Name -ne "FirebirdGuardianDefaultInstance") {
        (Get-Content $xmlDestino -Raw).Replace("<depend>FirebirdGuardianDefaultInstance</depend>", "<depend>$($guardian.Name)</depend>") |
            Set-Content -Path $xmlDestino -Encoding UTF8
        Write-Ok "<depend> ajustado a $($guardian.Name)."
    } else {
        Write-Ok "<depend>FirebirdGuardianDefaultInstance</depend> es correcto."
    }
} else {
    # Sin guardian local (Firebird remoto, o instalado de otra forma): dejar la
    # dependencia haria que el servicio no arranque nunca.
    (Get-Content $xmlDestino) | Where-Object { $_ -notmatch "<depend>" } |
        Set-Content -Path $xmlDestino -Encoding UTF8
    Write-Warn "No hay servicio Guardian de Firebird local. Se quito la linea <depend> del XML. Los reintentos de arranque cubren el caso de una base remota que tarda en responder."
}


# ---------------------------------------------------------------------------
# 7. Instalar el servicio
# ---------------------------------------------------------------------------
Write-Paso "7. Instalando el servicio"
$exe = Join-Path $appDir "bamx-backend.exe"

& $exe install
if ($LASTEXITCODE -ne 0) { throw "WinSW install fallo (codigo $LASTEXITCODE)." }
Write-Ok "Servicio 'bamx-backend' registrado."

# Refuerzo del arranque retrasado. El XML ya lo pide, pero sc.exe es la
# fuente de verdad del SCM y no cuesta nada asegurarlo.
& sc.exe config bamx-backend start= delayed-auto | Out-Null
Write-Ok "Arranque automatico retrasado configurado."


# ---------------------------------------------------------------------------
# 8. Firewall
# ---------------------------------------------------------------------------
Write-Paso "8. Firewall"
if ($SinFirewall) {
    Write-Info "Se salto por el parametro -SinFirewall."
} else {
    $nombreRegla = "BAMX Backend API $Puerto"
    $regla = Get-NetFirewallRule -DisplayName $nombreRegla -ErrorAction SilentlyContinue
    if ($regla) {
        Write-Info "La regla '$nombreRegla' ya existia."
    } else {
        # Private y Domain a proposito, NUNCA Public: el backend tiene CORS
        # abierto y permitAll("/**") (la autorizacion real la hace el filtro
        # JWT). Esta API no debe salir a internet.
        New-NetFirewallRule -DisplayName $nombreRegla `
            -Direction Inbound -Protocol TCP -LocalPort $Puerto `
            -Action Allow -Profile Private,Domain | Out-Null
        Write-Ok "Regla creada para TCP $Puerto (perfiles Private y Domain)."
    }
}


# ---------------------------------------------------------------------------
# 9. Arrancar
# ---------------------------------------------------------------------------
Write-Paso "9. Arrancando"
& $exe start
if ($LASTEXITCODE -ne 0) { throw "WinSW start fallo (codigo $LASTEXITCODE). Revisar $logsDir." }

Write-Info "Esperando a que la API responda (hasta 90 s)..."
$arriba = $false
for ($i = 1; $i -le 45; $i++) {
    Start-Sleep -Seconds 2
    try {
        $t = Test-NetConnection -ComputerName "localhost" -Port $Puerto -WarningAction SilentlyContinue -ErrorAction Stop
        if ($t.TcpTestSucceeded) { $arriba = $true; break }
    } catch { }
}

Write-Host ""
if ($arriba) {
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  Instalacion completa" -ForegroundColor Green
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  La API responde en http://localhost:$Puerto" -ForegroundColor White
    Write-Host ""
    Write-Host "  Siguiente paso OBLIGATORIO: .\03-verify.ps1" -ForegroundColor Yellow
    Write-Host "  (que el puerto abra no prueba que la conexion a Firebird sirva)" -ForegroundColor DarkGray
} else {
    Write-Host "  El servicio arranco pero el puerto $Puerto no respondio en 90 s." -ForegroundColor Red
    Write-Host "  Revisar los logs:" -ForegroundColor Red
    Write-Host "    Get-Content '$logsDir\bamx-backend.out.log' -Tail 60" -ForegroundColor Yellow
    Write-Host "    Get-Content '$logsDir\bamx-backend.err.log' -Tail 60" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  Causa mas comun: el .env no se esta encontrando. Verificar que" -ForegroundColor DarkGray
    Write-Host "  bamx-backend.xml tenga <workingdirectory>%BASE%</workingdirectory>" -ForegroundColor DarkGray
    Write-Host "  y que exista $appDir\.env" -ForegroundColor DarkGray
    exit 1
}
Write-Host ""
