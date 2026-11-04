# =============================================================================
# SCRIPT DE EJECUCION DIARIA AUTOMATIZADA — ALBARRACIN MOTOS Y REPUESTOS
# Sincronización: 03:30 AM Argentina (Vehicular, Mercado Libre e Instagram)
# =============================================================================
$BaseDir = if ($PSScriptRoot) { $PSScriptRoot } else { "d:\SEBASTIAN\IA_desarrollos\comp2\albarracin_repuestos" }
Set-Location -Path $BaseDir

$LogFile = Join-Path $BaseDir "daily_cron.log"

function Write-CronLog {
    param([string]$Message)
    $now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "[$now] [CRON_RUNNER] $Message" | Out-File -FilePath $LogFile -Append -Encoding utf8
    Write-Host "[$now] [CRON_RUNNER] $Message"
}

function Test-PythonAvailable {
    try {
        $p = Start-Process -FilePath "python.exe" -ArgumentList "-V" -NoNewWindow -Wait -PassThru -ErrorAction Stop -RedirectStandardError ([System.IO.Path]::GetTempFileName())
        return ($p.ExitCode -eq 0)
    } catch {
        return $false
    }
}

$IsPythonReady = Test-PythonAvailable
$IsNodeReady = [bool](Get-Command node -ErrorAction SilentlyContinue)

Write-CronLog "Iniciando ciclo diario de sincronizacion completa (Node=$IsNodeReady, Python=$IsPythonReady)..."

# 1. Ejecutar sincronizacion incremental vehicular con datos abiertos y catalogo maestro
if ($IsPythonReady) {
    Write-CronLog "Sincronizando catalogo vehicular incremental..."
    python dnrpa_sync.py --run-now 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 1.2. Sincronizar catalogo de Mercado Libre, precios vivos y stock oficial
if ($IsPythonReady) {
    Write-CronLog "Sincronizando catalogo en vivo desde Mercado Libre..."
    python sync_mercadolibre_catalog.py 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 1.3. Sincronizar Albarracín Instagram Smart Catalog (@albarracinmotos)
Write-CronLog "Sincronizando Albarracín Instagram Smart Catalog (@albarracinmotos)..."
if ($IsNodeReady) {
    node sync_instagram_catalog.js --run-now 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
} elseif ($IsPythonReady) {
    python sync_instagram_catalog.py --run-now 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
} else {
    Write-CronLog "AVISO: No se encontro Node.js ni Python para sincronizar Instagram."
}

# 1.5. Sincronizar precios, stock y catalogo de repuestos (proveedores y compatibilidades)
if ($IsPythonReady -and (Test-Path "$BaseDir\lista_proveedor.csv")) {
    Write-CronLog "Sincronizando catalogo de repuestos y listas de proveedores..."
    python importador.py 2>&1 | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 2. Replicar a carpeta fidelizacion si existe
if (Test-Path "$BaseDir\club_albarracin_fidelizacion\compatibility_db.json") {
    Copy-Item -Path "$BaseDir\compatibility_db.json" -Destination "$BaseDir\club_albarracin_fidelizacion\compatibility_db.json" -Force
}

# 3. Disparar Build Hook de Netlify si esta configurado en .env
if (Test-Path "$BaseDir\.env") {
    $envContent = Get-Content "$BaseDir\.env"
    $hookLine = $envContent | Where-Object { $_ -match "^NETLIFY_BUILD_HOOK_URL=(.+)" }
    if ($hookLine) {
        $hookUrl = $matches[1].Trim()
        if ($hookUrl -and $hookUrl -notmatch "tu_build_hook") {
            try {
                Write-CronLog "Disparando despliegue automatico a Netlify ($hookUrl)..."
                Invoke-RestMethod -Uri $hookUrl -Method Post
                Write-CronLog "Despliegue en Netlify solicitado exitosamente."
            } catch {
                Write-CronLog "Error al llamar al Netlify Build Hook: $_"
            }
        }
    }
}

Write-CronLog "Ciclo diario finalizado exitosamente."

