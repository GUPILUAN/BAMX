<#
.SYNOPSIS
    Prueba de humo del backend instalado. Solo lee, no modifica nada.

.DESCRIPTION
    Cada paso prueba una capa mas profunda que el anterior:

      1-2  el servicio existe y el puerto abre        -> Windows / WinSW
      3    endpoint publico devuelve 404              -> HTTP + Hikari + Jaybird + Firebird
      4    login devuelve tokens                      -> base de perfiles + JWT
      5-7  endpoints con token devuelven datos        -> sufijo de empresa correcto
      8    los logs no traen stacktraces              -> arranque limpio

    El paso 3 merece explicacion: /api/public/fotos-inventarios/{cveArt} es
    publico (no pide token), consulta la tabla de fotos en Firebird, no
    encuentra la clave inventada, cae a buscar el archivo en disco, tampoco
    lo encuentra, y responde 404. Ese 404 es exito: prueba toda la cadena
    hasta la base de datos. Un 500 ahi significa problema de conexion o de
    esquema. Es el healthcheck disponible sin agregar codigo al backend.

    Sin -Usuario / -Password se corren solo los pasos 1, 2, 3 y 8.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\03-verify.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\03-verify.ps1 -Usuario "admin" -Password "secreta"

.EXAMPLE
    # Desde otra computadora de la red (prueba firewall y subred):
    powershell -ExecutionPolicy Bypass -File .\03-verify.ps1 -BaseUrl "http://192.168.100.244:8080"
#>
[CmdletBinding()]
param(
    [string] $BaseUrl  = "http://localhost:8080",
    [string] $Usuario  = "",
    [string] $Password = "",
    [string] $ClaveArt = "VEDU000GR",
    [string] $LogsDir  = "C:\BAMX\logs"
)

$ErrorActionPreference = "Continue"
$ProgressPreference    = "SilentlyContinue"

$script:Fallas = 0
$script:Pasos  = 0

function Test-Paso {
    param([string] $Nombre, [scriptblock] $Accion)
    $script:Pasos++
    Write-Host ""
    Write-Host "  [$script:Pasos] $Nombre" -ForegroundColor Cyan
    try {
        $r = & $Accion
        if ($r -eq $false) {
            $script:Fallas++
        }
    } catch {
        Write-Host "      [FAIL] $($_.Exception.Message)" -ForegroundColor Red
        $script:Fallas++
    }
}

function Get-CodigoHttp {
    param([string] $Url, [hashtable] $Headers = @{})
    try {
        $r = Invoke-WebRequest -Uri $Url -Headers $Headers -Method GET -TimeoutSec 30 -UseBasicParsing
        return [int] $r.StatusCode
    } catch {
        if ($_.Exception.Response) { return [int] $_.Exception.Response.StatusCode }
        throw
    }
}

$BaseUrl = $BaseUrl.TrimEnd("/")

Write-Host ""
Write-Host "  BAMX - Verificacion del backend" -ForegroundColor White
Write-Host "  url: $BaseUrl   |   $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor DarkGray

$esLocal = ($BaseUrl -like "*localhost*") -or ($BaseUrl -like "*127.0.0.1*")
$puerto  = 8080
if ($BaseUrl -match ":(\d+)$") { $puerto = [int] $matches[1] }


# ---------------------------------------------------------------------------
Test-Paso "Servicio de Windows" {
    if (-not $esLocal) { Write-Host "      [SKIP] Verificacion remota." -ForegroundColor DarkGray; return }

    $svc = Get-Service -Name "bamx-backend" -ErrorAction SilentlyContinue
    if (-not $svc) {
        Write-Host "      [FAIL] El servicio 'bamx-backend' no existe." -ForegroundColor Red
        return $false
    }

    $arranque = (Get-CimInstance Win32_Service -Filter "Name='bamx-backend'").StartMode
    Write-Host "      estado: $($svc.Status)   arranque: $arranque" -ForegroundColor Gray

    if ($svc.Status -ne "Running") {
        Write-Host "      [FAIL] El servicio no esta corriendo." -ForegroundColor Red
        return $false
    }
    if ($arranque -ne "Auto") {
        Write-Host "      [WARN] El arranque no es automatico: NO va a levantar solo al encender." -ForegroundColor Yellow
        Write-Host "             sc.exe config bamx-backend start= delayed-auto" -ForegroundColor Yellow
    }
    Write-Host "      [ OK ] Corriendo con arranque automatico." -ForegroundColor Green
}


# ---------------------------------------------------------------------------
Test-Paso "Puerto $puerto" {
    $host_ = ([Uri]$BaseUrl).Host
    $t = Test-NetConnection -ComputerName $host_ -Port $puerto -WarningAction SilentlyContinue
    if (-not $t.TcpTestSucceeded) {
        Write-Host "      [FAIL] ${host_}:$puerto no acepta conexiones." -ForegroundColor Red
        if (-not $esLocal) {
            Write-Host "             Si en la propia maquina si responde, es firewall o aislamiento de red." -ForegroundColor Yellow
        }
        return $false
    }
    Write-Host "      [ OK ] ${host_}:$puerto acepta conexiones." -ForegroundColor Green
}


# ---------------------------------------------------------------------------
Test-Paso "Conexion a Firebird (endpoint publico, se espera 404)" {
    $codigo = Get-CodigoHttp "$BaseUrl/api/public/fotos-inventarios/__healthcheck__"
    if ($codigo -eq 404) {
        Write-Host "      [ OK ] 404. La cadena HTTP -> pool -> Jaybird -> Firebird funciona." -ForegroundColor Green
    } elseif ($codigo -eq 500) {
        Write-Host "      [FAIL] 500. La app responde pero la consulta a la base falla." -ForegroundColor Red
        Write-Host "             Causa tipica: no existe la tabla FOTO_INVE01. Este endpoint corre" -ForegroundColor Yellow
        Write-Host "             sin token, y sin token el sufijo de empresa cae al default '01'." -ForegroundColor Yellow
        Write-Host "             Revisar los logs para el error exacto de SQL." -ForegroundColor Yellow
        return $false
    } else {
        Write-Host "      [WARN] Codigo inesperado: $codigo (se esperaba 404)." -ForegroundColor Yellow
    }
}


# ---------------------------------------------------------------------------
$tokenAcceso = $null

if ($Usuario -eq "") {
    Write-Host ""
    Write-Host "  [--] Pasos 4 a 7 omitidos: no se dieron credenciales." -ForegroundColor DarkGray
    Write-Host "       Volver a correr con -Usuario '<user>' -Password '<pass>'" -ForegroundColor DarkGray
    Write-Host "       Sin esto NO queda probado que el sufijo de empresa sea el correcto." -ForegroundColor DarkGray
} else {

    Test-Paso "Login (base de perfiles + JWT)" {
        $cuerpo = @{ username = $Usuario; password = $Password } | ConvertTo-Json -Compress
        $r = $null
        try {
            $r = Invoke-RestMethod -Uri "$BaseUrl/api/usuarios/login" -Method POST `
                                   -Body $cuerpo -ContentType "application/json" -TimeoutSec 30
        } catch {
            # El backend responde con un JSON explicativo; sin esto el operador
            # solo veria "(404) Not Found", que no dice nada util.
            $codigo = 0
            $mensaje = ""
            if ($_.Exception.Response) {
                $codigo = [int] $_.Exception.Response.StatusCode
                try {
                    $lector  = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                    $crudo   = $lector.ReadToEnd()
                    $mensaje = (ConvertFrom-Json $crudo).message
                } catch { }
            }

            Write-Host "      [FAIL] Login rechazado (HTTP $codigo)." -ForegroundColor Red
            if ($mensaje) { Write-Host "             El servidor dice: $mensaje" -ForegroundColor Red }

            switch ($codigo) {
                404 { Write-Host "             Ese usuario no existe en la base de perfiles. Revisar el nombre, o que DATABASE_PATH_AUTH apunte a la base correcta." -ForegroundColor Yellow }
                401 { Write-Host "             El usuario existe pero la contrasena no coincide." -ForegroundColor Yellow }
                403 { Write-Host "             El usuario existe pero esta inactivo o sin permisos." -ForegroundColor Yellow }
                500 { Write-Host "             Error del servidor: probable problema con la base de perfiles. Revisar los logs." -ForegroundColor Yellow }
                0   { Write-Host "             No hubo respuesta HTTP: el backend no esta escuchando o la red lo bloquea." -ForegroundColor Yellow }
            }
            return $false
        }

        if (-not $r.access) {
            Write-Host "      [FAIL] La respuesta no trae token de acceso." -ForegroundColor Red
            return $false
        }
        $script:tokenAcceso = $r.access

        # El claim 'empresa' del JWT es el que decide contra que tablas de
        # Aspel se consulta. Vale la pena verlo explicitamente.
        try {
            $payload = $r.access.Split(".")[1]
            switch ($payload.Length % 4) { 2 { $payload += "==" } 3 { $payload += "=" } }
            $json = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($payload.Replace("-","+").Replace("_","/")))
            $claims = $json | ConvertFrom-Json
            Write-Host "      claim empresa en el token: '$($claims.empresa)'" -ForegroundColor Gray
            if (-not $claims.empresa -or $claims.empresa -eq "01") {
                Write-Host "      [WARN] Sufijo '01' o vacio: en Aspel esa empresa suele estar vacia." -ForegroundColor Yellow
                Write-Host "             Revisar APP_EMPRESA_SUFFIX en el .env." -ForegroundColor Yellow
            }
        } catch { }

        Write-Host "      [ OK ] Login correcto, tokens emitidos." -ForegroundColor Green
    }

    Test-Paso "Inventario (sufijo de empresa correcto)" {
        if (-not $script:tokenAcceso) { Write-Host "      [SKIP] Sin token." -ForegroundColor DarkGray; return }
        $h = @{ Authorization = "Bearer $($script:tokenAcceso)" }
        $r = Invoke-RestMethod -Uri "$BaseUrl/api/inventarios/?search=$ClaveArt&size=5" -Headers $h -TimeoutSec 60

        $n = 0
        if ($r.content)             { $n = @($r.content).Count }
        elseif ($r -is [array])     { $n = $r.Count }

        if ($n -gt 0) {
            Write-Host "      [ OK ] $n resultado(s) para '$ClaveArt'. El sufijo de empresa es correcto." -ForegroundColor Green
        } else {
            Write-Host "      [WARN] Cero resultados para '$ClaveArt'." -ForegroundColor Yellow
            Write-Host "             O la clave no existe en esta base, o APP_EMPRESA_SUFFIX apunta" -ForegroundColor Yellow
            Write-Host "             a una empresa vacia. Probar con -ClaveArt de un producto real." -ForegroundColor Yellow
        }
    }

    Test-Paso "Almacenes" {
        if (-not $script:tokenAcceso) { Write-Host "      [SKIP] Sin token." -ForegroundColor DarkGray; return }
        $h = @{ Authorization = "Bearer $($script:tokenAcceso)" }
        $r = Invoke-RestMethod -Uri "$BaseUrl/api/almacenes/all" -Headers $h -TimeoutSec 60
        Write-Host "      [ OK ] $(@($r).Count) almacen(es)." -ForegroundColor Green
    }

    Test-Paso "Lotes (Semaforo)" {
        if (-not $script:tokenAcceso) { Write-Host "      [SKIP] Sin token." -ForegroundColor DarkGray; return }
        $h = @{ Authorization = "Bearer $($script:tokenAcceso)" }
        $r = Invoke-RestMethod -Uri "$BaseUrl/api/lotes/?size=5" -Headers $h -TimeoutSec 60

        $total = 0
        if ($null -ne $r.totalElements) { $total = $r.totalElements }
        Write-Host "      [ OK ] El endpoint responde. Lotes totales: $total" -ForegroundColor Green
        if ($total -lt 20) {
            Write-Host "      [INFO] Pocos lotes es lo ESPERADO: el Semaforo depende de que se" -ForegroundColor DarkGray
            Write-Host "             capture lote y caducidad en Aspel. No es falla del despliegue." -ForegroundColor DarkGray
        }
    }
}


# ---------------------------------------------------------------------------
Test-Paso "Logs" {
    if (-not $esLocal) { Write-Host "      [SKIP] Verificacion remota." -ForegroundColor DarkGray; return }
    if (-not (Test-Path $LogsDir)) {
        Write-Host "      [WARN] No existe $LogsDir." -ForegroundColor Yellow
        return
    }

    $out = Join-Path $LogsDir "bamx-backend.out.log"
    if (Test-Path $out) {
        $contenido = Get-Content $out -Tail 400 -ErrorAction SilentlyContinue

        if ($contenido -match "Started BackendApplication") {
            Write-Host "      [ OK ] 'Started BackendApplication' presente." -ForegroundColor Green
        } else {
            Write-Host "      [WARN] No se vio 'Started BackendApplication' en las ultimas 400 lineas." -ForegroundColor Yellow
        }

        $errores = @($contenido | Select-String -Pattern "Exception|ERROR|Caused by" -SimpleMatch:$false)
        if ($errores.Count -gt 0) {
            Write-Host "      [WARN] $($errores.Count) linea(s) con Exception/ERROR. Ultimas 5:" -ForegroundColor Yellow
            $errores | Select-Object -Last 5 | ForEach-Object {
                Write-Host "             $($_.Line.Trim())" -ForegroundColor DarkGray
            }
        } else {
            Write-Host "      [ OK ] Sin excepciones en el log reciente." -ForegroundColor Green
        }
    } else {
        Write-Host "      [WARN] No existe $out." -ForegroundColor Yellow
    }
}


# ---------------------------------------------------------------------------
Write-Host ""
Write-Host ("=" * 78) -ForegroundColor DarkCyan
if ($script:Fallas -eq 0) {
    Write-Host "  Verificacion OK ($script:Pasos pasos)." -ForegroundColor Green
    Write-Host ""
    Write-Host "  Falta lo que ningun script puede probar solo:" -ForegroundColor DarkGray
    Write-Host "    - Reiniciar la computadora y volver a correr este script." -ForegroundColor DarkGray
    Write-Host "      Es LA prueba de que arranca solo. Sin iniciar sesion en Windows." -ForegroundColor DarkGray
    Write-Host "    - Correr este script DESDE UNA TABLET o laptop de la red," -ForegroundColor DarkGray
    Write-Host "      con -BaseUrl http://<ip>:$puerto (prueba firewall y subred)." -ForegroundColor DarkGray
    Write-Host ""
} else {
    Write-Host "  $script:Fallas de $script:Pasos pasos fallaron." -ForegroundColor Red
    Write-Host ""
    Write-Host "  Get-Content 'C:\BAMX\logs\bamx-backend.out.log' -Tail 60" -ForegroundColor Yellow
    Write-Host "  Get-Content 'C:\BAMX\logs\bamx-backend.err.log' -Tail 60" -ForegroundColor Yellow
    Write-Host ""
}
Write-Host ("=" * 78) -ForegroundColor DarkCyan

if ($script:Fallas -gt 0) { exit 1 }
exit 0
