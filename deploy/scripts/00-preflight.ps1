<#
.SYNOPSIS
    Diagnostico previo a instalar el backend de BAMX. NO instala ni modifica nada.

.DESCRIPTION
    Este script es lo PRIMERO que se corre al llegar a la computadora de BAMX.
    Solo lee y reporta. Su trabajo es contestar las preguntas que no podemos
    responder desde fuera:

      - Aspel y Firebird, estan en ESTA maquina?
      - Como se llama exactamente el servicio de Firebird?
      - Donde estan los .FDB reales y que sufijo de empresa usan?
      - Existe la base de perfiles (sin ella nadie puede hacer login)?
      - Esta libre el puerto 8080?
      - Cual es la IP y es fija?

    Al final imprime un resumen con BLOQUEANTES y los valores detectados para
    armar el archivo .env.

    NOTA: escrito sin acentos a proposito. PowerShell 5.1 lee los .ps1 como
    ANSI si no traen BOM, y los acentos saldrian rotos en maquinas con otra
    configuracion regional.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\00-preflight.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\00-preflight.ps1 -DbPassword "otraClave"
#>
[CmdletBinding()]
param(
    [string] $DbUser     = "sysdba",
    [string] $DbPassword = "masterkey",
    [int]    $Puerto     = 8080,
    [string] $IsqlPath   = "",
    [switch] $SaltarSql
)

$ErrorActionPreference = "Continue"
$ProgressPreference    = "SilentlyContinue"

# ---------------------------------------------------------------------------
# Infraestructura del reporte
# ---------------------------------------------------------------------------
$script:Bloqueantes  = New-Object System.Collections.ArrayList
$script:Advertencias = New-Object System.Collections.ArrayList
$script:Sugerido     = [ordered]@{}

function Write-Titulo {
    param([string] $Texto)
    Write-Host ""
    Write-Host ("=" * 78) -ForegroundColor DarkCyan
    Write-Host "  $Texto" -ForegroundColor Cyan
    Write-Host ("=" * 78) -ForegroundColor DarkCyan
}

function Write-Ok {
    param([string] $Texto)
    Write-Host "  [ OK ] $Texto" -ForegroundColor Green
}

function Write-Info {
    param([string] $Texto)
    Write-Host "  [INFO] $Texto" -ForegroundColor Gray
}

function Write-Advertencia {
    param([string] $Texto, [string] $Accion = "")
    Write-Host "  [WARN] $Texto" -ForegroundColor Yellow
    if ($Accion -ne "") { Write-Host "         -> $Accion" -ForegroundColor Yellow }
    [void] $script:Advertencias.Add($Texto)
}

function Write-Bloqueante {
    param([string] $Texto, [string] $Accion = "")
    Write-Host "  [FAIL] $Texto" -ForegroundColor Red
    if ($Accion -ne "") { Write-Host "         -> $Accion" -ForegroundColor Red }
    [void] $script:Bloqueantes.Add($Texto)
}

Write-Host ""
Write-Host "  BAMX - Diagnostico previo a la instalacion del backend" -ForegroundColor White
Write-Host "  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')  |  equipo: $env:COMPUTERNAME  |  usuario: $env:USERNAME" -ForegroundColor DarkGray
Write-Host "  Este script NO modifica nada. Solo lee y reporta." -ForegroundColor DarkGray


# ---------------------------------------------------------------------------
# 1. Sistema operativo
# ---------------------------------------------------------------------------
Write-Titulo "1. Sistema operativo"
try {
    $os = Get-CimInstance Win32_OperatingSystem -ErrorAction Stop
    Write-Info "$($os.Caption)  (build $($os.BuildNumber))"
    Write-Info "Arquitectura: $($os.OSArchitecture)"
    $ramGb = [math]::Round($os.TotalVisibleMemorySize / 1MB, 1)
    Write-Info "RAM total: $ramGb GB"

    if ($os.OSArchitecture -notlike "*64*") {
        Write-Bloqueante "Windows de 32 bits." "No existe JDK 25 para x86. Se necesita una maquina de 64 bits."
    } else {
        Write-Ok "Windows de 64 bits."
    }

    if ($ramGb -lt 3) {
        Write-Advertencia "Solo $ramGb GB de RAM y la maquina la comparte con Aspel." "Bajar -Xmx768m a -Xmx512m en bamx-backend.xml."
    }
} catch {
    Write-Advertencia "No se pudo leer la informacion del sistema: $($_.Exception.Message)"
}


# ---------------------------------------------------------------------------
# 2. .NET Framework (lo necesita WinSW v2)
# ---------------------------------------------------------------------------
Write-Titulo "2. .NET Framework (requisito de WinSW)"
try {
    $ndp = Get-ItemProperty "HKLM:\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" -ErrorAction Stop
    $release = [int] $ndp.Release
    Write-Info "Release del registro: $release  (version reportada: $($ndp.Version))"
    if ($release -ge 394254) {
        Write-Ok ".NET Framework 4.6.1 o superior. WinSW v2 va a funcionar."
    } else {
        Write-Bloqueante ".NET Framework menor a 4.6.1 (release $release)." "Instalar .NET Framework 4.8, o usar el build self-contained de WinSW v3."
    }
} catch {
    Write-Bloqueante "No se encontro .NET Framework 4.x en el registro." "Instalar .NET Framework 4.8, o usar el build self-contained de WinSW v3."
}


# ---------------------------------------------------------------------------
# 3. Aspel instalado en esta maquina?
# ---------------------------------------------------------------------------
Write-Titulo "3. Instalacion de Aspel"
$raicesAspel = @(
    "C:\Program Files (x86)\Common Files\Aspel",
    "C:\Program Files\Common Files\Aspel",
    "D:\Program Files (x86)\Common Files\Aspel"
)
$aspelRoot = $null
foreach ($r in $raicesAspel) {
    if (Test-Path $r) { $aspelRoot = $r; break }
}

if ($aspelRoot) {
    Write-Ok "Aspel encontrado en: $aspelRoot"
    $sae = Get-ChildItem -Path $aspelRoot -Directory -Recurse -Depth 2 -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -like "SAE*" } | Select-Object -First 3
    foreach ($s in $sae) { Write-Info "  version: $($s.FullName)" }
} else {
    Write-Advertencia "No se encontro Aspel en esta maquina." "ESCENARIO DE DOS MAQUINAS: ver deploy/README.md. Habra que apuntar DATABASE_HOST_* a la IP del servidor de Aspel, abrir el 3050 alla, y BORRAR la linea <depend> del XML de WinSW."
}


# ---------------------------------------------------------------------------
# 4. Servicios de Firebird
# ---------------------------------------------------------------------------
Write-Titulo "4. Servicios de Firebird"
$svcFirebird = Get-Service -ErrorAction SilentlyContinue |
               Where-Object { $_.Name -like "*irebird*" -or $_.DisplayName -like "*irebird*" }

$nombreGuardian = $null
if ($svcFirebird) {
    foreach ($s in $svcFirebird) {
        $arranque = "?"
        try { $arranque = (Get-CimInstance Win32_Service -Filter "Name='$($s.Name)'" -ErrorAction Stop).StartMode } catch { }
        Write-Info ("{0,-38} estado: {1,-8} arranque: {2}" -f $s.Name, $s.Status, $arranque)
        if ($s.Name -like "*Guardian*") { $nombreGuardian = $s.Name }
    }

    if ($nombreGuardian) {
        Write-Ok "Servicio guardian: $nombreGuardian"
        if ($nombreGuardian -ne "FirebirdGuardianDefaultInstance") {
            Write-Advertencia "El guardian NO se llama 'FirebirdGuardianDefaultInstance'." "Cambiar la linea <depend> de bamx-backend.xml a: <depend>$nombreGuardian</depend>"
        }
        $script:Sugerido["_DEPEND_"] = $nombreGuardian
    } else {
        Write-Advertencia "Hay servicios de Firebird pero ninguno es el Guardian." "Usar el nombre del servidor en <depend>, o borrar la linea si no aplica."
        $script:Sugerido["_DEPEND_"] = $svcFirebird[0].Name
    }
} else {
    if ($aspelRoot) {
        Write-Bloqueante "Aspel esta instalado pero NO hay servicio de Firebird." "Revisar si Aspel usa Firebird embebido, o si el servicio esta deshabilitado."
    } else {
        Write-Advertencia "No hay servicios de Firebird aqui (consistente con el escenario de dos maquinas)."
    }
}


# ---------------------------------------------------------------------------
# 5. Firebird escuchando en 3050
# ---------------------------------------------------------------------------
Write-Titulo "5. Conectividad a Firebird (puerto 3050)"
try {
    $tcp3050 = Test-NetConnection -ComputerName "localhost" -Port 3050 -WarningAction SilentlyContinue -ErrorAction Stop
    if ($tcp3050.TcpTestSucceeded) {
        Write-Ok "localhost:3050 acepta conexiones."
    } else {
        if ($aspelRoot) {
            Write-Bloqueante "localhost:3050 NO responde." "Arrancar el servicio de Firebird, o revisar RemoteBindAddress en firebird.conf."
        } else {
            Write-Advertencia "localhost:3050 no responde (esperado si Firebird esta en otra maquina)."
        }
    }
} catch {
    Write-Advertencia "No se pudo probar el puerto 3050: $($_.Exception.Message)"
}


# ---------------------------------------------------------------------------
# 6. Localizar los .FDB y el Conexiones.ini
# ---------------------------------------------------------------------------
Write-Titulo "6. Bases de datos (.FDB) y Conexiones.ini"
$fdbs = @()
if ($aspelRoot) {
    Write-Info "Buscando archivos .FDB bajo $aspelRoot (puede tardar)..."
    $fdbs = Get-ChildItem -Path $aspelRoot -Recurse -Filter "*.FDB" -ErrorAction SilentlyContinue |
            Sort-Object Length -Descending
    if ($fdbs) {
        foreach ($f in $fdbs) {
            $mb = [math]::Round($f.Length / 1MB, 1)
            Write-Info ("{0,10} MB  {1}" -f $mb, $f.FullName)
        }
    } else {
        Write-Bloqueante "No se encontro ningun .FDB bajo la carpeta de Aspel." "Buscar manualmente: Get-ChildItem C:\ -Recurse -Filter *.FDB"
    }

    $conex = Get-ChildItem -Path $aspelRoot -Recurse -Filter "Conexiones.ini" -ErrorAction SilentlyContinue | Select-Object -First 1
    if ($conex) {
        Write-Host ""
        Write-Info "Contenido de $($conex.FullName):"
        Get-Content $conex.FullName -ErrorAction SilentlyContinue |
            ForEach-Object { Write-Host "         $_" -ForegroundColor DarkGray }
    } else {
        Write-Info "No se encontro Conexiones.ini (no es bloqueante)."
    }
}

# Heuristica: la base de EMPRESA es la mas grande que no parezca de perfiles.
$fdbEmpresa = $null
$fdbAuth    = $null
foreach ($f in $fdbs) {
    $esPerfil = ($f.FullName -like "*Perfil*") -or ($f.Name -like "*PERFIL*") -or ($f.Name -like "*BAMX*")
    if ($esPerfil -and -not $fdbAuth) { $fdbAuth = $f }
    if (-not $esPerfil -and -not $fdbEmpresa -and $f.Name -notlike "*Ejemplo*") { $fdbEmpresa = $f }
}

Write-Host ""
if ($fdbEmpresa) {
    Write-Ok "Candidata a base de EMPRESA: $($fdbEmpresa.FullName)"
    $script:Sugerido["DATABASE_PATH_EMPRESA"] = $fdbEmpresa.FullName.Replace("\", "/")
} else {
    Write-Advertencia "No se pudo deducir la base de empresa." "Elegirla a mano de la lista de arriba."
}


# ---------------------------------------------------------------------------
# 7. Base de perfiles (auth) - SIN ESTO NADIE PUEDE HACER LOGIN
# ---------------------------------------------------------------------------
Write-Titulo "7. Base de perfiles / autenticacion"
if ($fdbAuth) {
    Write-Ok "Base de perfiles: $($fdbAuth.FullName)"
    $script:Sugerido["DATABASE_PATH_AUTH"] = $fdbAuth.FullName.Replace("\", "/")
} else {
    Write-Bloqueante "No se encontro la base de perfiles (BAMX_PERFILES.FDB o similar)." "Sin la base de auth NADIE puede iniciar sesion en la app. Hay que localizarla o llevarla a esta maquina antes de instalar."
}


# ---------------------------------------------------------------------------
# 8-10. Consultas SQL: credenciales, sufijos de empresa, tablas requeridas
# ---------------------------------------------------------------------------
Write-Titulo "8-10. Inspeccion de la base de datos"

if ($SaltarSql) {
    Write-Info "Se salto la inspeccion SQL por el parametro -SaltarSql."
} else {
    $isql = $null
    if ($IsqlPath -ne "" -and (Test-Path $IsqlPath)) {
        $isql = $IsqlPath
    } else {
        $raicesFb = @("C:\Program Files (x86)\Firebird", "C:\Program Files\Firebird")
        if ($aspelRoot) { $raicesFb += $aspelRoot }
        foreach ($rf in $raicesFb) {
            if (Test-Path $rf) {
                $cand = Get-ChildItem -Path $rf -Recurse -Filter "isql.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
                if ($cand) { $isql = $cand.FullName; break }
            }
        }
    }

    if (-not $isql) {
        Write-Advertencia "No se encontro isql.exe." "Se omiten las verificaciones 8, 9 y 10. Volver a correr con -IsqlPath 'ruta\isql.exe'. El sufijo de empresa HAY que confirmarlo antes de instalar."
    } elseif (-not $fdbEmpresa) {
        Write-Advertencia "Hay isql pero no se identifico la base de empresa; se omiten las consultas."
    } else {
        Write-Info "isql: $isql"

        # --- Consulta 1: que tablas INVExx / FOTO_INVExx existen ---
        $tmpSql = Join-Path $env:TEMP "bamx_pf1_$(Get-Random).sql"
        $q1 = @()
        $q1 += "SET NAMES WIN1252;"
        $q1 += "SELECT TRIM(RDB" + [char]36 + "RELATION_NAME) FROM RDB" + [char]36 + "RELATIONS"
        $q1 += " WHERE RDB" + [char]36 + "RELATION_NAME STARTING WITH 'INVE'"
        $q1 += "    OR RDB" + [char]36 + "RELATION_NAME STARTING WITH 'FOTO_INVE'"
        $q1 += " ORDER BY 1;"
        $q1 += "EXIT;"
        $q1 | Set-Content -Path $tmpSql -Encoding ASCII

        $salida = & $isql -user $DbUser -password $DbPassword -i $tmpSql $fdbEmpresa.FullName
        $codigo = $LASTEXITCODE
        Remove-Item $tmpSql -Force -ErrorAction SilentlyContinue

        if ($codigo -ne 0) {
            Write-Bloqueante "isql no pudo conectarse a la base de empresa (codigo $codigo)." "Probablemente la contrasena de SYSDBA no es '$DbPassword'. Pedirsela a quien administra Aspel y volver a correr con -DbPassword."
            if ($salida) { $salida | ForEach-Object { Write-Host "         $_" -ForegroundColor DarkGray } }
        } else {
            Write-Ok "Conexion con usuario '$DbUser' correcta."

            $tablas = @()
            foreach ($linea in $salida) {
                $t = "$linea".Trim()
                if ($t -match '^(INVE|FOTO_INVE)[0-9]{2}$') { $tablas += $t }
            }

            $sufijos = @()
            foreach ($t in $tablas) {
                if ($t -match '^INVE([0-9]{2})$') { $sufijos += $matches[1] }
            }
            $sufijos = @($sufijos | Sort-Object -Unique)

            if ($sufijos.Count -eq 0) {
                Write-Bloqueante "No se encontro ninguna tabla INVExx en la base." "Es la base equivocada, o el esquema no es el de Aspel SAE 8."
            } else {
                Write-Ok "Sufijos de empresa presentes: $($sufijos -join ', ')"

                # --- Consulta 2: cuantos productos tiene cada empresa ---
                $tmpSql2 = Join-Path $env:TEMP "bamx_pf2_$(Get-Random).sql"
                $q2 = @("SET NAMES WIN1252;")
                foreach ($sf in $sufijos) {
                    $q2 += "SELECT '$sf' AS SUFIJO, COUNT(*) AS PRODUCTOS FROM INVE$sf;"
                }
                $q2 += "EXIT;"
                $q2 | Set-Content -Path $tmpSql2 -Encoding ASCII

                $salida2 = & $isql -user $DbUser -password $DbPassword -i $tmpSql2 $fdbEmpresa.FullName
                Remove-Item $tmpSql2 -Force -ErrorAction SilentlyContinue

                Write-Host ""
                Write-Info "Productos por empresa (la que tenga datos es la buena):"
                $mejorSufijo = $null
                $mejorConteo = -1
                foreach ($l in $salida2) {
                    $txt = "$l".Trim()
                    if ($txt -match '^([0-9]{2})\s+([0-9]+)$') {
                        $sf  = $matches[1]
                        $cnt = [int] $matches[2]
                        Write-Host ("         INVE{0}: {1,10} productos" -f $sf, $cnt) -ForegroundColor DarkGray
                        if ($cnt -gt $mejorConteo) { $mejorConteo = $cnt; $mejorSufijo = $sf }
                    }
                }

                if ($mejorSufijo) {
                    Write-Host ""
                    Write-Ok "APP_EMPRESA_SUFFIX sugerido: $mejorSufijo  ($mejorConteo productos)"
                    $script:Sugerido["APP_EMPRESA_SUFFIX"] = $mejorSufijo
                }

                # FOTO_INVE01: la usa el endpoint publico de imagenes, que corre
                # SIN token y por lo tanto con el sufijo "01" por default.
                if ($tablas -contains "FOTO_INVE01") {
                    Write-Ok "FOTO_INVE01 existe (la necesita el endpoint publico de imagenes)."
                } else {
                    Write-Advertencia "NO existe FOTO_INVE01." "El endpoint /api/public/fotos-inventarios/ corre sin token, y sin token el sufijo cae al default '01'. Sin esa tabla las fotos de producto responden error 500 en vez de la imagen. La app sigue sirviendo (el frontend dibuja DefaultProductImage), pero el healthcheck del paso 3 de 03-verify.ps1 va a dar 500 en vez de 404."
                }
            }
        }

        # --- Consulta 3: la base de auth tiene usuarios? ---
        if ($fdbAuth) {
            $tmpSql3 = Join-Path $env:TEMP "bamx_pf3_$(Get-Random).sql"
            $q3 = @("SET NAMES WIN1252;", "SELECT COUNT(*) FROM USUARIOS;", "EXIT;")
            $q3 | Set-Content -Path $tmpSql3 -Encoding ASCII

            $salida3 = & $isql -user $DbUser -password $DbPassword -i $tmpSql3 $fdbAuth.FullName
            $codigo3 = $LASTEXITCODE
            Remove-Item $tmpSql3 -Force -ErrorAction SilentlyContinue

            Write-Host ""
            if ($codigo3 -eq 0) {
                $nUsuarios = 0
                foreach ($l in $salida3) {
                    $txt = "$l".Trim()
                    if ($txt -match '^[0-9]+$') { $nUsuarios = [int] $txt }
                }
                if ($nUsuarios -gt 0) {
                    Write-Ok "Base de perfiles OK: $nUsuarios usuarios registrados."
                } else {
                    Write-Bloqueante "La tabla USUARIOS existe pero esta VACIA." "Nadie va a poder iniciar sesion. Dar de alta al menos un usuario antes del go-live."
                }
            } else {
                Write-Bloqueante "No se pudo consultar la tabla USUARIOS de la base de perfiles." "Revisar credenciales y que el archivo sea la base correcta."
            }
        }
    }
}


# ---------------------------------------------------------------------------
# 11. Carpeta de imagenes
# ---------------------------------------------------------------------------
Write-Titulo "11. Carpeta de imagenes de producto"
$imgs = @()
if ($aspelRoot) {
    $imgs = Get-ChildItem -Path $aspelRoot -Directory -Recurse -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -like "Imagenes*" }
}
if ($imgs) {
    foreach ($i in $imgs) {
        $n = (Get-ChildItem $i.FullName -File -ErrorAction SilentlyContinue | Measure-Object).Count
        Write-Info "$($i.FullName)  ($n archivos)"
    }

    # Aspel crea una carpeta Imagenes POR EMPRESA (Empresa01\Imagenes,
    # Empresa03\Imagenes...). Hay que elegir la de la empresa VIVA, no la
    # primera que aparezca: apuntarle a Empresa01 cuando los datos estan en
    # la 03 deja todas las fotos en 404 sin ningun error visible.
    $elegida = $null
    $sufijoVivo = $script:Sugerido["APP_EMPRESA_SUFFIX"]
    if ($sufijoVivo) {
        $elegida = $imgs | Where-Object { $_.FullName -like "*Empresa$sufijoVivo*" } | Select-Object -First 1
        if ($elegida) {
            Write-Info "Se eligio la carpeta de la empresa $sufijoVivo (la que tiene los datos)."
        }
    }
    if (-not $elegida) {
        # Sin sufijo confirmado, la que mas archivos tenga es la mejor apuesta.
        $elegida = $imgs |
            Sort-Object { (Get-ChildItem $_.FullName -File -ErrorAction SilentlyContinue | Measure-Object).Count } -Descending |
            Select-Object -First 1
        Write-Advertencia "No se pudo cruzar la carpeta de imagenes con el sufijo de empresa." "Se eligio la que mas archivos tiene. VERIFICAR a mano que corresponda a la empresa correcta."
    }

    # OJO: la ruta TIENE que terminar en "/" (el codigo concatena literalmente).
    $rutaImg = $elegida.FullName.Replace("\", "/").TrimEnd("/") + "/"
    $script:Sugerido["APP_IMAGES_PATH"] = $rutaImg
    Write-Ok "APP_IMAGES_PATH sugerido: $rutaImg"
} else {
    Write-Advertencia "No se encontro carpeta de imagenes." "Las fotos de producto daran 404 y el frontend dibujara el icono por linea de producto. Degradado aceptable."
    $script:Sugerido["APP_IMAGES_PATH"] = "C:/Aspel/Imagenes/"
}


# ---------------------------------------------------------------------------
# 12. Puerto de la API
# ---------------------------------------------------------------------------
Write-Titulo "12. Puerto $Puerto"
$enUso = $null
try {
    $enUso = Get-NetTCPConnection -LocalPort $Puerto -State Listen -ErrorAction SilentlyContinue
} catch { }

if ($enUso) {
    $listaPids = @($enUso | Select-Object -ExpandProperty OwningProcess -Unique)
    foreach ($p in $listaPids) {
        $proc = Get-Process -Id $p -ErrorAction SilentlyContinue
        if ($proc) { Write-Info "Ocupado por PID $p ($($proc.ProcessName)) - $($proc.Path)" }
    }
    Write-Advertencia "El puerto $Puerto ya esta en uso." "Usar otro: agregar 'server.port=8081' al .env (CON PUNTO y en minusculas; SERVER_PORT en mayusculas NO funciona desde ese archivo), y ajustar APP_HOST_URL, la regla de firewall y EXPO_PUBLIC_API_URL del APK."
} else {
    Write-Ok "Puerto $Puerto libre."
}


# ---------------------------------------------------------------------------
# 13. Red
# ---------------------------------------------------------------------------
Write-Titulo "13. Configuracion de red"
$ipElegida = $null
try {
    $ifaces = Get-NetIPConfiguration -ErrorAction Stop |
              Where-Object { $_.IPv4Address -and $_.NetAdapter.Status -eq "Up" }

    foreach ($i in $ifaces) {
        $ip     = $i.IPv4Address.IPAddress
        $origen = $i.IPv4Address.PrefixOrigin
        $alias  = $i.InterfaceAlias

        # Adaptadores virtuales (VirtualBox, Hyper-V, VMware, Docker, WSL):
        # tienen IP y estan "Up", pero NO son la red de BAMX. Si el APK se
        # compila con una de estas IPs, ninguna tablet va a poder conectarse.
        $esVirtual = ($alias -match "vEthernet|VirtualBox|VMware|Hyper-V|Loopback|Docker|WSL") -or
                     ($ip -like "192.168.56.*") -or ($ip -like "172.1[6-9].*") -or
                     ($ip -like "172.2*.*") -or ($ip -like "172.3[01].*")

        # La interfaz real de LAN es la que tiene puerta de enlace.
        $tieneGateway = ($i.IPv4DefaultGateway -ne $null)

        $etiqueta = ""
        if ($esVirtual)    { $etiqueta = "  <- adaptador virtual, NO usar" }
        if ($tieneGateway) { $etiqueta = "  <- tiene gateway (red real)" }

        Write-Info ("{0,-18} ip: {1,-16} origen: {2,-8}{3}" -f $alias, $ip, $origen, $etiqueta)

        if ($tieneGateway -and -not $esVirtual -and -not $ipElegida) {
            $ipElegida = $ip
            if ($origen -eq "Dhcp") {
                Write-Advertencia "La IP de LAN $ip viene por DHCP." "REQUISITO DURO: EXPO_PUBLIC_API_URL se quema dentro del APK al compilarlo. Si esta IP cambia, TODAS las tablets dejan de funcionar y hay que recompilar y reinstalar el APK. Fijarla con reserva DHCP en el router (preferido) o IP estatica ANTES de generar el APK."
            } else {
                Write-Ok "IP de LAN $ip, fija ($origen). Es la que va en el APK."
            }
        }
    }

    if (-not $ipElegida) {
        Write-Advertencia "No se identifico una interfaz de LAN con puerta de enlace." "Elegir la IP a mano de la lista de arriba, descartando adaptadores virtuales."
    }
} catch {
    Write-Advertencia "No se pudo leer la configuracion de red: $($_.Exception.Message)"
}
if ($ipElegida) {
    $script:Sugerido["APP_HOST_URL"] = "http://" + $ipElegida + ":" + $Puerto
    $script:Sugerido["_EXPO_PUBLIC_API_URL_"] = "http://" + $ipElegida + ":" + $Puerto
}


# ---------------------------------------------------------------------------
# 14. Java (informativo)
# ---------------------------------------------------------------------------
Write-Titulo "14. Java instalado (informativo)"
$javaCmd = Get-Command java -ErrorAction SilentlyContinue
if ($javaCmd) {
    Write-Info "Hay un java en el PATH: $($javaCmd.Source)"
    Write-Info "No importa: la instalacion trae su propio JDK 25 portable en C:\BAMX\app\runtime."
} else {
    Write-Info "No hay java en el PATH. No hace falta: se instala un JDK 25 portable."
}


# ---------------------------------------------------------------------------
# RESUMEN
# ---------------------------------------------------------------------------
Write-Titulo "RESUMEN"

if ($script:Bloqueantes.Count -eq 0) {
    Write-Host "  Sin bloqueantes. Se puede proceder con 02-install.ps1." -ForegroundColor Green
} else {
    Write-Host "  $($script:Bloqueantes.Count) BLOQUEANTE(S) - resolver ANTES de instalar:" -ForegroundColor Red
    $n = 1
    foreach ($b in $script:Bloqueantes) { Write-Host "    $n. $b" -ForegroundColor Red; $n++ }
}

if ($script:Advertencias.Count -gt 0) {
    Write-Host ""
    Write-Host "  $($script:Advertencias.Count) advertencia(s):" -ForegroundColor Yellow
    $n = 1
    foreach ($a in $script:Advertencias) { Write-Host "    $n. $a" -ForegroundColor Yellow; $n++ }
}

Write-Host ""
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Valores detectados para C:\BAMX\app\.env" -ForegroundColor Cyan
Write-Host "  (revisarlos, NO copiarlos a ciegas)" -ForegroundColor DarkGray
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
foreach ($k in $script:Sugerido.Keys) {
    if ($k -like "_*_") { continue }
    Write-Host "  $k=$($script:Sugerido[$k])" -ForegroundColor White
}

Write-Host ""
Write-Host "  Falta definir a mano:" -ForegroundColor DarkGray
Write-Host "    JWT_SECRET  -> generar con:" -ForegroundColor DarkGray
Write-Host "      [Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))" -ForegroundColor DarkGray

if ($script:Sugerido["_DEPEND_"] -or $script:Sugerido["_EXPO_PUBLIC_API_URL_"]) {
    Write-Host ""
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    Write-Host "  Otros valores que hay que copiar a mano" -ForegroundColor Cyan
    Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
    if ($script:Sugerido["_DEPEND_"]) {
        Write-Host "  bamx-backend.xml   -> <depend>$($script:Sugerido['_DEPEND_'])</depend>" -ForegroundColor White
    }
    if ($script:Sugerido["_EXPO_PUBLIC_API_URL_"]) {
        Write-Host "  frontend\.env      -> EXPO_PUBLIC_API_URL=$($script:Sugerido['_EXPO_PUBLIC_API_URL_'])" -ForegroundColor White
        Write-Host "                        (fijar la IP ANTES de compilar el APK)" -ForegroundColor DarkGray
    }
}
Write-Host ""

if ($script:Bloqueantes.Count -gt 0) { exit 1 }
exit 0
