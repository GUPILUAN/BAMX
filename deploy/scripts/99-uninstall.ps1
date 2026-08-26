<#
.SYNOPSIS
    Desinstala el backend de BAMX y deja la maquina como estaba. Requiere Administrador.

.DESCRIPTION
    Para el servicio, lo quita del registro de servicios de Windows, borra la
    regla de firewall y (con -BorrarArchivos) elimina C:\BAMX.

    NO TOCA NADA DE ASPEL NI DE FIREBIRD. La app es de solo lectura contra el
    ERP: nunca escribio una fila en INVE, LTPD, MINVE ni ninguna otra tabla de
    Aspel. Desinstalarla no puede afectar la contabilidad ni el inventario.

    Por default CONSERVA los archivos (logs incluidos) por si se necesita
    diagnosticar algo. Con -BorrarArchivos se elimina todo.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\99-uninstall.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\99-uninstall.ps1 -BorrarArchivos
#>
[CmdletBinding()]
param(
    [string] $Destino = "C:\BAMX",
    [int]    $Puerto  = 8080,
    [switch] $BorrarArchivos
)

$ErrorActionPreference = "Continue"

$appDir = Join-Path $Destino "app"
$exe    = Join-Path $appDir "bamx-backend.exe"

function Write-Paso { param([string]$T) Write-Host ""; Write-Host "  >> $T" -ForegroundColor Cyan }
function Write-Ok   { param([string]$T) Write-Host "     [ OK ] $T" -ForegroundColor Green }
function Write-Info { param([string]$T) Write-Host "     [INFO] $T" -ForegroundColor Gray }

Write-Host ""
Write-Host "  BAMX - Desinstalacion del backend" -ForegroundColor White
Write-Host "  No se toca nada de Aspel ni de Firebird." -ForegroundColor DarkGray

$principal = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    throw "Se necesitan permisos de Administrador."
}


# ---------------------------------------------------------------------------
Write-Paso "1. Servicio"
$svc = Get-Service -Name "bamx-backend" -ErrorAction SilentlyContinue
if ($svc) {
    if (Test-Path $exe) {
        & $exe stop      | Out-Null
        Start-Sleep -Seconds 3
        & $exe uninstall | Out-Null
        Start-Sleep -Seconds 2
    } else {
        # Sin el exe de WinSW, se quita con las herramientas de Windows.
        Stop-Service -Name "bamx-backend" -Force -ErrorAction SilentlyContinue
        & sc.exe delete bamx-backend | Out-Null
    }

    if (Get-Service -Name "bamx-backend" -ErrorAction SilentlyContinue) {
        Write-Info "El servicio sigue registrado; suele desaparecer al cerrar services.msc o al reiniciar."
    } else {
        Write-Ok "Servicio detenido y eliminado."
    }
} else {
    Write-Info "El servicio no estaba instalado."
}


# ---------------------------------------------------------------------------
Write-Paso "2. Firewall"
$reglas = Get-NetFirewallRule -ErrorAction SilentlyContinue |
          Where-Object { $_.DisplayName -like "BAMX Backend API*" }
if ($reglas) {
    foreach ($r in $reglas) {
        Remove-NetFirewallRule -Name $r.Name -ErrorAction SilentlyContinue
        Write-Ok "Regla eliminada: $($r.DisplayName)"
    }
} else {
    Write-Info "No habia reglas de firewall de BAMX."
}


# ---------------------------------------------------------------------------
Write-Paso "3. Archivos"
if (Test-Path $Destino) {
    if ($BorrarArchivos) {
        Remove-Item $Destino -Recurse -Force -ErrorAction SilentlyContinue
        if (Test-Path $Destino) {
            Write-Info "Quedaron archivos en $Destino (probablemente en uso). Borrar a mano tras reiniciar."
        } else {
            Write-Ok "$Destino eliminado."
        }
    } else {
        Write-Info "$Destino se conserva (incluye logs y el .env)."
        Write-Info "Para borrarlo: volver a correr con -BorrarArchivos"
    }
} else {
    Write-Info "No existe $Destino."
}


Write-Host ""
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Desinstalacion completa" -ForegroundColor Green
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Aspel y Firebird quedaron intactos." -ForegroundColor Gray
Write-Host ""
