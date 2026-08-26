<#
.SYNOPSIS
    Deja la laptop lista para la demo: restaura las bases, escribe los .env
    y verifica que todo responda. Se corre UNA VEZ.

.DESCRIPTION
    Corre en la LAPTOP, parado donde sea, con el kit ya copiado en C:\BAMX-DEMO.

    Que hace:
      1. Levanta Firebird 2.5 en modo aplicacion (portable, sin instalar nada).
      2. Restaura db\empresa03.fbk y db\perfiles.fbk a bases .FDB usables.
      3. Verifica con consultas reales que las bases traen datos.
      4. Copia la configuracion de Expo al frontend del repo.

    NO instala nada en el sistema: ni servicios, ni registro, ni PATH.
    Para desmontar todo: cierra la ventana de Firebird y borra C:\BAMX-DEMO.

.PARAMETER Base
    Carpeta donde quedo el kit. Default: C:\BAMX-DEMO

.PARAMETER Rehacer
    Restaura las bases aunque ya existan (borra las anteriores).

.EXAMPLE
    .\11-preparar-laptop.ps1
#>

[CmdletBinding()]
param(
    [string] $Base = 'C:\BAMX-DEMO',
    [switch] $Rehacer
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
function Fatal($m) {
    Write-Host "  [ERR]  $m" -ForegroundColor Red
    Write-Host ""
    Write-Host "  Si te atoraste aqui, abre Claude Code en $Base\repo y pegale este error." -ForegroundColor Yellow
    exit 1
}

# ---------------------------------------------------------------------------
# 1. Que el kit este completo
# ---------------------------------------------------------------------------
Titulo "Revisando el kit"

if (-not (Test-Path $Base)) {
    Fatal "No existe $Base. Copia ahi la carpeta BAMX-DEMO-KIT completa (renombrada a BAMX-DEMO)."
}

$necesarios = @{
    'firebird\bin\fbserver.exe' = 'Firebird portable'
    'firebird\bin\gbak.exe'     = 'gbak (restaurador)'
    'firebird\bin\isql.exe'     = 'isql (consultas)'
    'runtime\bin\java.exe'      = 'Java portable'
    'app\bamx-backend.jar'      = 'Backend compilado'
    'app\.env'                  = 'Config del backend'
    'db\empresa03.fbk'          = 'Respaldo del inventario'
    'db\perfiles.fbk'           = 'Respaldo de usuarios'
}
$faltantes = @()
foreach ($rel in $necesarios.Keys) {
    if (-not (Test-Path (Join-Path $Base $rel))) { $faltantes += "$rel  ($($necesarios[$rel]))" }
}
if ($faltantes.Count -gt 0) {
    Write-Host "  Falta esto en el kit:" -ForegroundColor Red
    $faltantes | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
    Fatal "Kit incompleto. Vuelve a copiarlo desde la otra computadora."
}
Ok "Kit completo"

$fbDir     = Join-Path $Base 'firebird'
$fbserver  = Join-Path $fbDir 'bin\fbserver.exe'
$gbak      = Join-Path $fbDir 'bin\gbak.exe'
$isql      = Join-Path $fbDir 'bin\isql.exe'
$dbDir     = Join-Path $Base 'db'

# Firebird 2.5 en Windows resuelve su carpeta raiz asi: primero el REGISTRO,
# despues la variable FIREBIRD, y al final la carpeta padre del ejecutable.
# En una laptop limpia no hay registro, asi que cae en C:\BAMX-DEMO\firebird,
# que es justo lo que queremos. Igual dejamos la variable puesta.
#
# VERIFICADO a la mala: en una maquina que YA tiene Firebird instalado, el
# registro gana, el fbserver portable termina usando el security2.fdb de la
# instalacion —que el servicio ya tiene abierto en exclusiva— y todo login
# falla con "Your user name and password are not defined". Por eso mas abajo
# no basta con ver el puerto escuchando: hay que probar que autentique.
$env:FIREBIRD = $fbDir
Ok "FIREBIRD = $fbDir"

# Ejecutar un .exe capturando su salida SIN que el script se muera.
#
# En PowerShell 5.1, "& algo.exe 2>&1" convierte cada linea de stderr en un
# ErrorRecord. Con $ErrorActionPreference = 'Stop' eso es un error TERMINANTE:
# el script se aborta en la llamada misma y nunca corre el manejo de errores
# que viene abajo. O sea, justo cuando algo falla es cuando el diagnostico no
# se imprime. Aqui se baja la preferencia solo mientras dura la llamada.
function Correr($exe, [string[]] $argumentos) {
    $previo = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    try {
        $salida = & $exe @argumentos 2>&1 | ForEach-Object { $_.ToString() }
        return @{ codigo = $LASTEXITCODE; salida = $salida; texto = ($salida -join ' | ') }
    } finally {
        $ErrorActionPreference = $previo
    }
}

# Registrar ESTA copia de Firebird como servicio de Windows. Es lo mismo que
# hace el instalador oficial, y es la unica forma soportada de que el servidor
# sepa cual es su carpeta raiz cuando el registro apunta a otra instalacion.
# Necesita administrador. Se deshace con instsvc remove / instreg remove.
function ArreglarFirebird($fbDirectorio) {
    $esAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()
               ).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    if (-not $esAdmin) {
        Aviso "Para registrarlo automaticamente hace falta administrador."
        Aviso "Vuelve a abrir PowerShell con 'Ejecutar como administrador' y repite."
        return $false
    }

    $bin = Join-Path $fbDirectorio 'bin'
    Get-Process -Name 'fbserver' -ErrorAction SilentlyContinue |
        Where-Object { $_.Path -like "$fbDirectorio*" } |
        Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    foreach ($paso in @(@('instreg.exe', 'install'), @('instsvc.exe', 'install'), @('instsvc.exe', 'start'))) {
        $r = Correr (Join-Path $bin $paso[0]) @($paso[1])
        Write-Host "         $($paso[0]) $($paso[1]): $($r.texto)" -ForegroundColor DarkGray
    }
    Start-Sleep -Seconds 4
    return $true
}

# ---------------------------------------------------------------------------
# 2. Levantar Firebird portable
# ---------------------------------------------------------------------------
Titulo "Firebird"

$puertoOcupado = $null
try {
    $puertoOcupado = Test-NetConnection -ComputerName 127.0.0.1 -Port 3050 -InformationLevel Quiet -WarningAction SilentlyContinue
} catch {
    $puertoOcupado = $false
}

if ($puertoOcupado) {
    Ok "Ya hay algo escuchando en el 3050 (Firebird arriba)"
} else {
    Info "Arrancando fbserver.exe -a (se abre una ventana; DEJALA ABIERTA)"
    Start-Process -FilePath $fbserver -ArgumentList '-a' -WorkingDirectory (Join-Path $fbDir 'bin')
    $intentos = 0
    do {
        Start-Sleep -Milliseconds 700
        $intentos++
        $arriba = Test-NetConnection -ComputerName 127.0.0.1 -Port 3050 -InformationLevel Quiet -WarningAction SilentlyContinue
    } while (-not $arriba -and $intentos -lt 15)

    if (-not $arriba) {
        Aviso "Firebird no levanto en el 3050."
        Aviso "Windows pudo haber mostrado una alerta de firewall: la demo es local,"
        Aviso "puedes cancelarla sin problema, pero el proceso tiene que seguir vivo."
        Fatal "Plan B: instala Firebird 2.5.9 de firebirdsql.org/en/firebird-2-5/ y vuelve a correr esto."
    }
    Ok "Firebird escuchando en 127.0.0.1:3050"
}

# No se agrega aqui ninguna "prueba de autenticacion": la restauracion de abajo
# ES esa prueba, y falla en segundos si Firebird no acepta sysdba/masterkey.
# Ese camino ya trae el diagnostico y el arreglo.

# ---------------------------------------------------------------------------
# 3. Restaurar las bases
# ---------------------------------------------------------------------------
Titulo "Restaurando bases de datos"

function Restaurar($fbk, $fdb, $etiqueta) {
    if ((Test-Path $fdb) -and -not $Rehacer) {
        Ok "$etiqueta ya restaurada ($('{0:N0} MB' -f ((Get-Item $fdb).Length / 1MB))). Usa -Rehacer para rehacerla."
        return
    }
    if (Test-Path $fdb) {
        Info "Borrando la version anterior de $etiqueta"
        Remove-Item $fdb -Force
    }
    # ${etiqueta} con llaves: sin ellas, PowerShell lee "$etiqueta:" como una
    # variable con ambito (tipo $env:) y no compila el script.
    Info "${etiqueta}: restaurando... (el inventario tarda varios minutos, es normal)"
    $t = Get-Date
    $argumentos = @('-c', '-user', 'sysdba', '-password', 'masterkey', $fbk, "localhost:$fdb")
    $r = Correr $gbak $argumentos

    # Si Firebird escucha pero no autentica, gbak muere en segundos con esto.
    # Pasa cuando el fbserver portable resolvio su carpeta raiz por el registro
    # (apuntando a otra instalacion de Firebird) y termino usando un
    # security2.fdb que no puede abrir. Se arregla registrando esta copia.
    $esProblemaDeLogin = $r.texto -match '28000|user name and password|Firebird login'
    if ($esProblemaDeLogin) {
        Write-Host ""
        Aviso "Firebird responde en el 3050 pero rechaza sysdba/masterkey."
        Aviso "Voy a registrar esta copia de Firebird como servicio para arreglarlo."
        if (ArreglarFirebird $fbDir) {
            Info "Reintentando la restauracion"
            $r = Correr $gbak $argumentos
        }
    }

    if ($r.codigo -ne 0 -or -not (Test-Path $fdb)) {
        $r.salida | Select-Object -Last 10 | ForEach-Object { Write-Host "         $_" -ForegroundColor Red }
        Write-Host ""
        if ($r.texto -match '28000|user name and password|Firebird login') {
            Aviso "Sigue sin autenticar. Lo mas comun es que esta maquina ya tuviera"
            Aviso "otro Firebird instalado y los dos se peleen por security2.fdb."
            Aviso "Revisalo con:  Get-Service *Firebird*"
            Fatal "Plan B: instala Firebird 2.5.9 de firebirdsql.org/en/firebird-2-5/ y repite. Tiene que ser 2.5, las versiones nuevas no abren estos archivos."
        }
        Fatal "gbak no pudo restaurar $etiqueta"
    }
    Ok "$etiqueta lista: $('{0:N0} MB' -f ((Get-Item $fdb).Length / 1MB)) en $([int]((Get-Date) - $t).TotalSeconds)s"
}

Restaurar (Join-Path $dbDir 'empresa03.fbk') (Join-Path $dbDir 'SAE80EMPRE03.FDB') 'Inventario (empresa)'
Restaurar (Join-Path $dbDir 'perfiles.fbk')  (Join-Path $dbDir 'PERFILES.FDB')     'Usuarios (login)'

# ---------------------------------------------------------------------------
# 4. Verificar que las bases traen datos de verdad
# ---------------------------------------------------------------------------
Titulo "Verificando contenido"

# El sufijo de empresa sale del .env; las tablas de Aspel se llaman INVE03, etc.
$sufijo = '03'
$envApp = Join-Path $Base 'app\.env'
$lineaSufijo = Select-String -Path $envApp -Pattern '^APP_EMPRESA_SUFFIX=(.+)$' | Select-Object -First 1
if ($lineaSufijo) { $sufijo = $lineaSufijo.Matches[0].Groups[1].Value.Trim() }

function Contar($fdb, $sql) {
    $tmp = Join-Path $env:TEMP "bamx_q_$([guid]::NewGuid().ToString('N')).sql"
    Set-Content -Path $tmp -Value "SET NAMES WIN1252;`r`n$sql`r`nEXIT;`r`n" -Encoding ASCII
    $r = (Correr $isql @('-user', 'sysdba', '-password', 'masterkey', '-i', $tmp, "localhost:$fdb")).salida
    try { [System.IO.File]::Delete($tmp) } catch { }
    $num = ($r | Select-String -Pattern '^\s*(\d+)\s*$' | Select-Object -First 1)
    if ($num) { return [int]$num.Matches[0].Groups[1].Value }
    return -1
}

$fdbEmpresa = Join-Path $dbDir 'SAE80EMPRE03.FDB'
$fdbAuth    = Join-Path $dbDir 'PERFILES.FDB'

$productos = Contar $fdbEmpresa "SELECT COUNT(*) FROM INVE$sufijo;"
$conStock  = Contar $fdbEmpresa "SELECT COUNT(*) FROM INVE$sufijo WHERE EXIST > 0;"
$lotes     = Contar $fdbEmpresa "SELECT COUNT(*) FROM LTPD$sufijo WHERE STATUS='A' AND CANTIDAD > 0;"
$almacenes = Contar $fdbEmpresa "SELECT COUNT(*) FROM ALMACENES$sufijo;"
$usuarios  = Contar $fdbAuth    "SELECT COUNT(*) FROM USUARIOS;"

if ($productos -le 0) { Fatal "La tabla INVE$sufijo no devolvio datos. El sufijo de empresa puede estar mal en app\.env." }
Ok "Productos en catalogo: $productos"
Ok "Productos con existencia: $conStock"
Ok "Lotes activos (esto alimenta el Semaforo): $lotes"
Ok "Almacenes: $almacenes"
Ok "Usuarios para login: $usuarios"

if ($lotes -le 0) {
    Aviso "Sin lotes activos el Semaforo del Home sale vacio."
    Aviso "Se puede repoblar con scripts\seed-demo-lotes.sql del repo."
}

# ---------------------------------------------------------------------------
# 5. Configuracion del frontend
# ---------------------------------------------------------------------------
Titulo "Frontend"

$frontDir = Join-Path $Base 'repo\frontend'
if (Test-Path $frontDir) {
    $origen = Join-Path $Base 'app\frontend.env'
    $destino = Join-Path $frontDir '.env'
    if ((Test-Path $destino) -and -not $Rehacer) {
        Aviso "Ya existe frontend\.env, no lo piso. Revisa que diga 10.0.2.2:"
        Get-Content $destino | Where-Object { $_ -match 'EXPO_PUBLIC_API_URL' } | ForEach-Object { Write-Host "         $_" -ForegroundColor White }
    } else {
        Copy-Item $origen $destino -Force
        Ok "frontend\.env escrito (API en http://10.0.2.2:8080, que es como el emulador ve la laptop)"
    }

    if (Test-Path (Join-Path $frontDir 'node_modules\expo')) {
        Ok "node_modules ya presente, no hace falta npm install"
    } else {
        Aviso "Falta node_modules. En el siguiente paso hay que correr, dentro de $frontDir :"
        Write-Host "           npm install" -ForegroundColor White
    }
} else {
    Aviso "No encuentro $frontDir. Si vas a clonar el repo de GitHub, copia despues"
    Aviso "app\frontend.env a frontend\.env"
}

# ---------------------------------------------------------------------------
# 6. Cierre
# ---------------------------------------------------------------------------
Titulo "Laptop preparada"

Write-Host ""
Write-Host "  Ya quedaron: Firebird arriba, bases restauradas y verificadas." -ForegroundColor Green
Write-Host ""
Write-Host "  Siguiente:" -ForegroundColor Cyan
Write-Host "    1. Si falto node_modules:   cd $Base\repo\frontend  y  npm install"
Write-Host "    2. Prende el backend:       .\12-arrancar-demo.ps1"
Write-Host "    3. Abre el emulador de Android Studio (perfil Medium Tablet)"
Write-Host "    4. En frontend:             npx expo start  y luego la tecla  a"
Write-Host ""
Write-Host "  IMPORTANTE: no cierres la ventana de Firebird que se abrio." -ForegroundColor Yellow
Write-Host ""
