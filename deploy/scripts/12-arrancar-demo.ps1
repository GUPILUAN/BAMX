<#
.SYNOPSIS
    Prende la demo: Firebird + backend, y comprueba que responda de verdad.
    Esto se corre CADA VEZ que vas a demostrar.

.DESCRIPTION
    Corre en la LAPTOP, con 11-preparar-laptop.ps1 ya ejecutado alguna vez.

    Abre dos ventanas que hay que DEJAR ABIERTAS:
      - Firebird (la base de datos)
      - Backend (los logs de Spring)

    Cerrar cualquiera de las dos apaga la demo.

    Con -Usuario y -Password hace la prueba completa: login real y una
    consulta real al inventario. Es la unica forma de saber que la app va a
    mostrar datos de Aspel y no los de mentira que trae el frontend como
    respaldo (ver DEMO-LAPTOP.md, seccion "Como saber si estas viendo datos
    reales").

.PARAMETER Base
    Carpeta del kit. Default: C:\BAMX-DEMO

.PARAMETER Usuario
    Usuario de la app para la prueba de login (el mismo de Aspel).

.PARAMETER Password
    Su contrasena. Si pasas -Usuario sin -Password, la pide sin mostrarla.

.EXAMPLE
    .\12-arrancar-demo.ps1
    .\12-arrancar-demo.ps1 -Usuario Alexito
#>

[CmdletBinding()]
param(
    [string] $Base = 'C:\BAMX-DEMO',
    [string] $Usuario,
    [string] $Password
)

$ErrorActionPreference = 'Stop'

function Titulo($t) {
    Write-Host ""
    Write-Host "=== $t " -ForegroundColor Cyan -NoNewline
    Write-Host ("=" * [Math]::Max(0, 60 - $t.Length)) -ForegroundColor Cyan
}
function Ok($m)    { Write-Host "  [ok]   $m" -ForegroundColor Green }
function Info($m)  { Write-Host "  ....   $m" -ForegroundColor Gray }
function Aviso($m) { Write-Host "  [!]    $m" -ForegroundColor Yellow }
function Fatal($m) { Write-Host "  [ERR]  $m" -ForegroundColor Red; exit 1 }

function PuertoArriba($puerto) {
    try {
        return Test-NetConnection -ComputerName 127.0.0.1 -Port $puerto -InformationLevel Quiet -WarningAction SilentlyContinue
    } catch { return $false }
}

$fbDir    = Join-Path $Base 'firebird'
$appDir   = Join-Path $Base 'app'
$java     = Join-Path $Base 'runtime\bin\java.exe'
$jar      = Join-Path $appDir 'bamx-backend.jar'
$env:FIREBIRD = $fbDir

if (-not (Test-Path $jar))  { Fatal "No existe $jar. Copia el kit completo a $Base." }
if (-not (Test-Path $java)) { Fatal "No existe $java. Copia el kit completo a $Base." }
if (-not (Test-Path (Join-Path $appDir '.env'))) { Fatal "No existe $appDir\.env. Sin el, el backend arranca y truena con 'Could not resolve placeholder JWT_SECRET'." }
if (-not (Test-Path (Join-Path $Base 'db\SAE80EMPRE03.FDB'))) { Fatal "Las bases no estan restauradas. Corre primero 11-preparar-laptop.ps1" }

# ---------------------------------------------------------------------------
# 1. Firebird
# ---------------------------------------------------------------------------
Titulo "Base de datos"

if (PuertoArriba 3050) {
    Ok "Firebird ya esta arriba (3050)"
} else {
    Info "Arrancando Firebird portable (deja abierta la ventana que se abre)"
    Start-Process -FilePath (Join-Path $fbDir 'bin\fbserver.exe') -ArgumentList '-a' -WorkingDirectory (Join-Path $fbDir 'bin')
    $i = 0
    do { Start-Sleep -Milliseconds 700; $i++ } while (-not (PuertoArriba 3050) -and $i -lt 15)
    if (-not (PuertoArriba 3050)) { Fatal "Firebird no levanto. Corre 11-preparar-laptop.ps1 para el diagnostico completo." }
    Ok "Firebird arriba"
}

# ---------------------------------------------------------------------------
# 2. Backend
# ---------------------------------------------------------------------------
Titulo "Backend"

if (PuertoArriba 8080) {
    Ok "Ya hay algo en el 8080. Asumo que es el backend de una corrida anterior."
} else {
    # El working directory NO es cosmetico: application.properties busca el .env
    # relativo al directorio del proceso. Arrancando desde otro lado, el import
    # es "optional:" y no falla ahi, sino despues con un error de placeholder
    # que no menciona el .env por ningun lado.
    Info "Arrancando el jar desde $appDir (ahi vive el .env)"
    Start-Process -FilePath $java -ArgumentList '-jar', 'bamx-backend.jar' -WorkingDirectory $appDir
    Info "Esperando a que Spring levante (10 a 40 segundos)"
    $i = 0
    do { Start-Sleep -Seconds 2; $i++ } while (-not (PuertoArriba 8080) -and $i -lt 45)
    if (-not (PuertoArriba 8080)) {
        Aviso "El backend no abrio el 8080."
        Aviso "Mira la ventana negra que se abrio: el error real esta ahi."
        Aviso "Lo mas comun: 'Could not resolve placeholder' = falta una variable en app\.env"
        Fatal "Backend caido"
    }
    Ok "Backend escuchando en 8080"
}

# ---------------------------------------------------------------------------
# 3. Prueba de humo: HTTP + pool + Jaybird + Firebird + esquema
# ---------------------------------------------------------------------------
Titulo "Prueba de humo"

# Este endpoint es publico y consulta la tabla de fotos. La clave inventada no
# existe, tampoco el archivo en disco, y por eso responde 404. Ese 404 ES el
# exito: significa que la cadena completa hasta Firebird funciono.
# Un 500 aqui es problema de base de datos, no de HTTP.
$codigo = 0
try {
    $r = Invoke-WebRequest -Uri 'http://localhost:8080/api/public/fotos-inventarios/__healthcheck__' -UseBasicParsing -TimeoutSec 20
    $codigo = $r.StatusCode
} catch {
    if ($_.Exception.Response) { $codigo = [int]$_.Exception.Response.StatusCode }
}

if ($codigo -eq 404) {
    Ok "Healthcheck 404 = cadena completa viva (HTTP -> Spring -> Jaybird -> Firebird)"
} elseif ($codigo -eq 500) {
    Fatal "Healthcheck 500 = el backend vive pero no puede con la base. Revisa las rutas DATABASE_PATH_* en app\.env"
} else {
    Aviso "Healthcheck respondio $codigo (esperaba 404). Sigo, pero desconfia."
}

# ---------------------------------------------------------------------------
# 4. Prueba real: login + inventario
# ---------------------------------------------------------------------------
if ($Usuario) {
    Titulo "Login e inventario reales"

    if (-not $Password) {
        $sec = Read-Host "  Contrasena de $Usuario" -AsSecureString
        $Password = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
            [Runtime.InteropServices.Marshal]::SecureStringToBSTR($sec))
    }

    $cuerpo = @{ username = $Usuario; password = $Password } | ConvertTo-Json
    try {
        $login = Invoke-RestMethod -Uri 'http://localhost:8080/api/usuarios/login' -Method Post `
                                   -ContentType 'application/json' -Body $cuerpo -TimeoutSec 20
    } catch {
        Fatal "El login fallo. Usuario o contrasena incorrectos, o la base de usuarios no restauro bien."
    }

    $token = $login.access
    if (-not $token) { Fatal "El login respondio pero sin token de acceso." }
    Ok "Login correcto, token emitido"

    try {
        $inv = Invoke-RestMethod -Uri 'http://localhost:8080/api/inventarios/?size=5&search=GRANEL' `
                                 -Headers @{ Authorization = "Bearer $token" } -TimeoutSec 30
    } catch {
        Fatal "El inventario respondio con error. Probable desajuste de sufijo de empresa en app\.env."
    }

    $items = $inv.content
    if (-not $items -or $items.Count -eq 0) {
        Aviso "El inventario respondio vacio. Revisa APP_EMPRESA_SUFFIX en app\.env."
    } else {
        Ok "Inventario devolvio datos reales de Aspel:"
        $items | Select-Object -First 5 | ForEach-Object {
            Write-Host ("         {0,-14} {1}" -f $_.product_id, $_.product_name) -ForegroundColor White
        }
    }
}

# ---------------------------------------------------------------------------
# 5. Cierre
# ---------------------------------------------------------------------------
Titulo "Demo lista del lado de la laptop"

Write-Host ""
Write-Host "  Deja abiertas las dos ventanas (Firebird y backend)." -ForegroundColor Yellow
Write-Host ""
Write-Host "  Falta la tablet:" -ForegroundColor Cyan
Write-Host "    1. Android Studio -> Device Manager -> arranca el AVD Medium Tablet"
Write-Host "    2. cd $Base\repo\frontend"
Write-Host "    3. npx expo start"
Write-Host "    4. teclea  a   (abre en el emulador e instala Expo Go solo)"
Write-Host ""
Write-Host "  Si la app se ve con 'Manzanas' y 'Platano': NO estas viendo datos reales." -ForegroundColor Yellow
Write-Host "  Los reales dicen FRUTA A GRANEL, VERDURA A GRANEL, JAMON A GRANEL." -ForegroundColor Yellow
Write-Host ""
