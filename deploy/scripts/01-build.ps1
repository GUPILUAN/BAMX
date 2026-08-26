<#
.SYNOPSIS
    Compila el backend y deja el .jar listo para copiar a la maquina de BAMX.

.DESCRIPTION
    Corre en la MAQUINA DE DESARROLLO, no en la de BAMX. La computadora de
    BAMX nunca necesita Maven, ni git, ni el codigo fuente: solo recibe el
    .jar ya construido.

    Produce deploy\dist\bamx-backend.jar (carpeta ignorada por git).

    Los tests SI se corren: son 4, tardan poco, y van contra H2 en memoria
    (no necesitan Firebird ni .env). Sirven de verificacion del artefacto.
    Con -SinTests se saltan.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\01-build.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\01-build.ps1 -SinTests
#>
[CmdletBinding()]
param(
    [switch] $SinTests,
    [string] $JdkPath = ""
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = Resolve-Path (Join-Path $scriptDir "..\..")
$backend   = Join-Path $repoRoot "backend"
$dist      = Join-Path $repoRoot "deploy\dist"

Write-Host ""
Write-Host "  BAMX - Build del backend" -ForegroundColor White
Write-Host "  repo:    $repoRoot" -ForegroundColor DarkGray
Write-Host "  backend: $backend" -ForegroundColor DarkGray
Write-Host ""

if (-not (Test-Path (Join-Path $backend "mvnw.cmd"))) {
    throw "No se encontro mvnw.cmd en $backend. Se esta corriendo el script desde el repo correcto?"
}

# ---------------------------------------------------------------------------
# JDK 25
# ---------------------------------------------------------------------------
# El pom fija <java.version>25</java.version>. Un JDK mas nuevo tambien
# compila (usa --release 25), pero fijamos el 25 para que el artefacto sea
# identico al que produce el CI (setup-java temurin 25).
if ($JdkPath -eq "") {
    $candidatos = @()
    if ($env:JAVA_HOME -and (Test-Path $env:JAVA_HOME)) { $candidatos += $env:JAVA_HOME }
    $candidatos += (Get-ChildItem "C:\Program Files\Java" -Directory -ErrorAction SilentlyContinue |
                    Where-Object { $_.Name -like "*jdk-25*" } |
                    Select-Object -ExpandProperty FullName)
    $candidatos += (Get-ChildItem "C:\Program Files\Eclipse Adoptium" -Directory -ErrorAction SilentlyContinue |
                    Where-Object { $_.Name -like "*jdk-25*" } |
                    Select-Object -ExpandProperty FullName)

    # Un Get-ChildItem sin resultados deja un $null dentro del arreglo, y
    # Join-Path con $null lanza excepcion terminante (ErrorActionPreference
    # = Stop). Sin este filtro, una maquina sin JDK revienta con un error
    # ilegible en vez del mensaje de abajo.
    $candidatos = @($candidatos | Where-Object { $_ })

    foreach ($c in $candidatos) {
        if (Test-Path (Join-Path $c "bin\javac.exe")) { $JdkPath = $c; break }
    }
}

if ($JdkPath -eq "" -or -not (Test-Path (Join-Path $JdkPath "bin\javac.exe"))) {
    throw "No se encontro un JDK 25. Instalar Temurin JDK 25 o pasar -JdkPath 'C:\ruta\al\jdk'."
}

$env:JAVA_HOME = $JdkPath
Write-Host "  JAVA_HOME: $JdkPath" -ForegroundColor Gray
& (Join-Path $JdkPath "bin\java.exe") -version
Write-Host ""

# ---------------------------------------------------------------------------
# Compilar
# ---------------------------------------------------------------------------
$objetivo = "clean package"
if ($SinTests) {
    $objetivo = "clean package -DskipTests"
    Write-Host "  Compilando SIN tests..." -ForegroundColor Yellow
} else {
    Write-Host "  Compilando con tests..." -ForegroundColor Gray
}
Write-Host ""

# El "cd /d" dentro de cmd no es adorno: Push-Location cambia la ubicacion de
# PowerShell pero NO el directorio de trabajo del proceso, asi que un
# "cmd /c mvnw.cmd" a secas no encuentra el wrapper. Ademas Maven necesita el
# cwd correcto para localizar el pom.xml y la carpeta .mvn.
$mvnw = Join-Path $backend "mvnw.cmd"
cmd /c "cd /d `"$backend`" && `"$mvnw`" $objetivo"
$codigo = $LASTEXITCODE

if ($codigo -ne 0) {
    throw "El build fallo (codigo $codigo). Revisar la salida de Maven arriba."
}

# ---------------------------------------------------------------------------
# Publicar el artefacto
# ---------------------------------------------------------------------------
$jar = Get-ChildItem (Join-Path $backend "target") -Filter "*.jar" -ErrorAction SilentlyContinue |
       Where-Object { $_.Name -notlike "*.original" } |
       Sort-Object Length -Descending |
       Select-Object -First 1

if (-not $jar) {
    throw "El build termino bien pero no se encontro el .jar en backend\target."
}

if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist -Force | Out-Null }
$destino = Join-Path $dist "bamx-backend.jar"
Copy-Item $jar.FullName $destino -Force

$mb = [math]::Round((Get-Item $destino).Length / 1MB, 1)

Write-Host ""
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Build listo" -ForegroundColor Green
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  origen:  $($jar.Name)" -ForegroundColor Gray
Write-Host "  destino: $destino  ($mb MB)" -ForegroundColor White
Write-Host ""
Write-Host "  Siguiente paso: copiar a la maquina de BAMX junto con" -ForegroundColor DarkGray
Write-Host "  deploy\winsw\, deploy\scripts\ y el JDK 25 portable." -ForegroundColor DarkGray
Write-Host "  Ver deploy\README.md, seccion 'Que llevar en la USB'." -ForegroundColor DarkGray
Write-Host ""
