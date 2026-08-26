<#
.SYNOPSIS
    Actualiza el .jar del backend ya instalado. Requiere Administrador.

.DESCRIPTION
    Para el servicio, respalda el jar actual con fecha, copia el nuevo,
    y vuelve a arrancar. Downtime de segundos.

    Si el arranque falla, RESTAURA el jar anterior automaticamente y vuelve
    a levantar. La idea es que una actualizacion mala nunca deje a BAMX sin
    servicio.

    Opcionalmente actualiza tambien el .env (-ConEnv), util cuando cambia la
    IP de la maquina o se rota el JWT_SECRET.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\04-update.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\04-update.ps1 -ConEnv
#>
[CmdletBinding()]
param(
    [string] $Destino = "C:\BAMX",
    [switch] $ConEnv,
    [int]    $Puerto  = 8080
)

$ErrorActionPreference = "Stop"

$scriptDir  = Split-Path -Parent $MyInvocation.MyCommand.Path
$deployRoot = Resolve-Path (Join-Path $scriptDir "..")
$dist       = Join-Path $deployRoot "dist"

$appDir    = Join-Path $Destino "app"
$jarActual = Join-Path $appDir "bamx-backend.jar"
$jarNuevo  = Join-Path $dist "bamx-backend.jar"
$exe       = Join-Path $appDir "bamx-backend.exe"

function Write-Paso { param([string]$T) Write-Host ""; Write-Host "  >> $T" -ForegroundColor Cyan }
function Write-Ok   { param([string]$T) Write-Host "     [ OK ] $T" -ForegroundColor Green }

Write-Host ""
Write-Host "  BAMX - Actualizacion del backend" -ForegroundColor White

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Se necesitan permisos de Administrador."
}

if (-not (Test-Path $exe))      { throw "No hay instalacion en $appDir. Usar 02-install.ps1." }
if (-not (Test-Path $jarNuevo)) { throw "No existe $jarNuevo. Correr 01-build.ps1 en la maquina de desarrollo." }

$mbNuevo = [math]::Round((Get-Item $jarNuevo).Length / 1MB, 1)
Write-Host "  jar nuevo: $mbNuevo MB   ($(Get-Item $jarNuevo | Select-Object -ExpandProperty LastWriteTime))" -ForegroundColor DarkGray


# ---------------------------------------------------------------------------
Write-Paso "1. Parando el servicio"
& $exe stop | Out-Null
Start-Sleep -Seconds 3
Write-Ok "Detenido."


# ---------------------------------------------------------------------------
Write-Paso "2. Respaldo"
$sello   = Get-Date -Format "yyyyMMdd-HHmmss"
$respaldo = "$jarActual.bak-$sello"
if (Test-Path $jarActual) {
    Copy-Item $jarActual $respaldo -Force
    Write-Ok "Respaldo en $(Split-Path -Leaf $respaldo)"
}

$respaldoEnv = $null
if ($ConEnv) {
    $envNuevo  = Join-Path $dist ".env"
    $envActual = Join-Path $appDir ".env"
    if (-not (Test-Path $envNuevo)) { throw "-ConEnv pedido pero no existe $envNuevo." }
    $respaldoEnv = "$envActual.bak-$sello"
    Copy-Item $envActual $respaldoEnv -Force
    Copy-Item $envNuevo  $envActual   -Force
    Write-Ok ".env actualizado (respaldo en $(Split-Path -Leaf $respaldoEnv))"
}


# ---------------------------------------------------------------------------
Write-Paso "3. Copiando el jar nuevo"
Copy-Item $jarNuevo $jarActual -Force
Write-Ok "Copiado."


# ---------------------------------------------------------------------------
Write-Paso "4. Arrancando"
& $exe start | Out-Null

$arriba = $false
for ($i = 1; $i -le 45; $i++) {
    Start-Sleep -Seconds 2
    try {
        $t = Test-NetConnection -ComputerName "localhost" -Port $Puerto -WarningAction SilentlyContinue -ErrorAction Stop
        if ($t.TcpTestSucceeded) { $arriba = $true; break }
    } catch { }
}

if ($arriba) {
    Write-Ok "La API responde en el puerto $Puerto."
    Write-Host ""
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  Actualizacion completa" -ForegroundColor Green
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  Correr .\03-verify.ps1 para confirmar que la base responde." -ForegroundColor Yellow
    Write-Host "  Respaldo conservado: $(Split-Path -Leaf $respaldo)" -ForegroundColor DarkGray
    Write-Host ""
} else {
    # Reversion automatica: una actualizacion mala no debe dejar caido a BAMX.
    Write-Host ""
    Write-Host "     [FAIL] El jar nuevo no levanto en 90 s. REVIRTIENDO..." -ForegroundColor Red
    & $exe stop | Out-Null
    Start-Sleep -Seconds 3

    if (Test-Path $respaldo) { Copy-Item $respaldo $jarActual -Force }
    if ($respaldoEnv -and (Test-Path $respaldoEnv)) { Copy-Item $respaldoEnv (Join-Path $appDir ".env") -Force }

    & $exe start | Out-Null
    Start-Sleep -Seconds 10

    Write-Host "     Se restauro la version anterior y se volvio a arrancar." -ForegroundColor Yellow
    Write-Host "     Revisar por que fallo la nueva:" -ForegroundColor Yellow
    Write-Host "       Get-Content '$Destino\logs\bamx-backend.out.log' -Tail 80" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}
