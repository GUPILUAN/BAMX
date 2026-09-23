<#
.SYNOPSIS
    Compila el backend y deja el .jar listo para copiar a la maquina de BAMX.

.DESCRIPTION
    Corre en la MAQUINA DE DESARROLLO, no en la de BAMX. La computadora de
    BAMX nunca necesita Maven, ni git, ni el codigo fuente: solo recibe el
    .jar ya construido.

    Produce deploy\dist\bamx-backend.jar (carpeta ignorada por git).

    Por default compila una COPIA LIMPIA del ultimo commit (git archive a una
    carpeta temporal), no la carpeta backend\ del repo. Dos razones:
      - El jar que va a produccion corresponde exactamente a un commit: nada
        sin commitear se cuela.
      - backend\target lo comparten el IDE (la extension Java de VS Code
        recompila ahi en cuanto ve un "clean") y el backend de desarrollo si
        esta corriendo. Compilar ahi dio fallas intermitentes de
        ClassNotFoundException en los tests, que no eran del codigo.
    Con -DesdeCarpeta se compila backend\ tal cual esta, cambios incluidos.

    Los tests SI se corren: van contra H2 en memoria (no necesitan Firebird
    ni .env) y sirven de verificacion del artefacto. Con -SinTests se saltan.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\01-build.ps1

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File .\01-build.ps1 -SinTests

.EXAMPLE
    # Probar cambios del backend que aun no estan commiteados:
    powershell -ExecutionPolicy Bypass -File .\01-build.ps1 -DesdeCarpeta
#>
[CmdletBinding()]
param(
    [switch] $SinTests,
    [string] $JdkPath = "",
    [switch] $DesdeCarpeta
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot  = (Resolve-Path (Join-Path $scriptDir "..\..")).Path
$dist      = Join-Path $repoRoot "deploy\dist"

Write-Host ""
Write-Host "  BAMX - Build del backend" -ForegroundColor White
Write-Host "  repo: $repoRoot" -ForegroundColor DarkGray
Write-Host ""

# ---------------------------------------------------------------------------
# JDK 25
# ---------------------------------------------------------------------------
# El pom fija <java.version>25</java.version>. Un JDK mas nuevo tambien
# compila (usa --release 25), pero fijamos el 25 para que el artefacto sea
# identico al que produce el CI (setup-java temurin 25). Ademas con JDK 26
# JaCoCo todavia no instrumenta las clases de los mocks y los tests truenan.
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
# Que se compila
# ---------------------------------------------------------------------------
$temporal = $null
if ($DesdeCarpeta) {
    $backend = Join-Path $repoRoot "backend"
    Write-Host "  Compilando backend\ TAL CUAL ESTA (-DesdeCarpeta)." -ForegroundColor Yellow
    Write-Host "  Si el IDE o el backend de desarrollo estan usando backend\target," -ForegroundColor DarkGray
    Write-Host "  los tests pueden fallar con ClassNotFoundException: cerrarlos antes." -ForegroundColor DarkGray
} else {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        throw "No se encontro git. Instalarlo, o usar -DesdeCarpeta para compilar backend\ directo."
    }

    $commit = (& git -C $repoRoot rev-parse --short HEAD).Trim()
    $rama   = (& git -C $repoRoot rev-parse --abbrev-ref HEAD).Trim()
    Write-Host "  Compilando el commit $commit ($rama)." -ForegroundColor Gray

    $pendientes = & git -C $repoRoot status --porcelain -- backend
    if ($pendientes) {
        Write-Host ""
        Write-Host "  [WARN] Hay cambios sin commitear en backend\ que NO van a entrar al jar:" -ForegroundColor Yellow
        $pendientes | Select-Object -First 10 | ForEach-Object { Write-Host "           $_" -ForegroundColor Yellow }
        Write-Host "         Commitearlos, o usar -DesdeCarpeta si de verdad se quieren incluir." -ForegroundColor Yellow
        Write-Host ""
    }

    # Ruta corta y fuera del repo: ningun IDE la esta vigilando.
    $temporal = Join-Path ([IO.Path]::GetTempPath()) "bamx-build-$commit"
    if (Test-Path $temporal) { Remove-Item $temporal -Recurse -Force }
    New-Item -ItemType Directory -Path $temporal -Force | Out-Null

    $zip = Join-Path $temporal "backend.zip"
    & git -C $repoRoot archive --format=zip -o $zip HEAD backend
    if ($LASTEXITCODE -ne 0) { throw "git archive fallo (codigo $LASTEXITCODE)." }
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [IO.Compression.ZipFile]::ExtractToDirectory($zip, $temporal)
    Remove-Item $zip -Force

    $backend = Join-Path $temporal "backend"
}

if (-not (Test-Path (Join-Path $backend "mvnw.cmd"))) {
    throw "No se encontro mvnw.cmd en $backend. Se esta corriendo el script desde el repo correcto?"
}

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

try {
    # El "cd /d" dentro de cmd no es adorno: Maven necesita el cwd correcto
    # para localizar el pom.xml y la carpeta .mvn. Y mvnw.cmd va con ruta
    # absoluta porque con NoDefaultCurrentDirectoryInExePath definida, cmd no
    # ejecuta nada del directorio actual aunque se haya hecho "cd".
    $mvnw = Join-Path $backend "mvnw.cmd"
    cmd /c "cd /d `"$backend`" && `"$mvnw`" $objetivo"
    $codigo = $LASTEXITCODE

    if ($codigo -ne 0) {
        throw "El build fallo (codigo $codigo). Revisar la salida de Maven arriba."
    }

    # -----------------------------------------------------------------------
    # Publicar el artefacto
    # -----------------------------------------------------------------------
    $jar = Get-ChildItem (Join-Path $backend "target") -Filter "*.jar" -ErrorAction SilentlyContinue |
           Where-Object { $_.Name -notlike "*.original" } |
           Sort-Object Length -Descending |
           Select-Object -First 1

    if (-not $jar) {
        throw "El build termino bien pero no se encontro el .jar en $backend\target."
    }

    if (-not (Test-Path $dist)) { New-Item -ItemType Directory -Path $dist -Force | Out-Null }
    $destino = Join-Path $dist "bamx-backend.jar"
    Copy-Item $jar.FullName $destino -Force
} finally {
    if ($temporal -and (Test-Path $temporal)) {
        Remove-Item $temporal -Recurse -Force -ErrorAction SilentlyContinue
    }
}

$mb = [math]::Round((Get-Item $destino).Length / 1MB, 1)

Write-Host ""
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
Write-Host "  Build listo" -ForegroundColor Green
Write-Host "  ---------------------------------------------------------------" -ForegroundColor DarkCyan
if (-not $DesdeCarpeta) {
    Write-Host "  commit:  $commit ($rama)" -ForegroundColor Gray
}
Write-Host "  destino: $destino  ($mb MB)" -ForegroundColor White
Write-Host ""
Write-Host "  Siguiente paso: copiar a la maquina de BAMX junto con" -ForegroundColor DarkGray
Write-Host "  deploy\winsw\, deploy\scripts\ y el JDK 25 portable." -ForegroundColor DarkGray
Write-Host "  Ver deploy\README.md, seccion 'Que llevar en la USB'." -ForegroundColor DarkGray
Write-Host ""
