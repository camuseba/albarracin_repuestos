# =============================================================================
# SCRIPT DE EJECUCION DIARIA AUTOMATIZADA — ALBARRACIN MOTOS Y REPUESTOS
# Sincronización: 03:30 AM Argentina (Vehicular, Mercado Libre e Instagram)
# =============================================================================
$BaseDir = if ($PSScriptRoot) { $PSScriptRoot } else { "h:\SEBASTIAN\IA_desarrollos\comp2\albarracin_repuestos" }
Set-Location -Path $BaseDir

$LogFile = Join-Path $BaseDir "daily_cron.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$Timestamp] [CRON_RUNNER] Iniciando ciclo diario de sincronizacion completa..." | Out-File -FilePath $LogFile -Append -Encoding utf8

# 1. Ejecutar sincronizacion incremental vehicular con datos abiertos y catalogo maestro
if (Get-Command python -ErrorAction SilentlyContinue) {
    python dnrpa_sync.py --run-now | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 1.2. Sincronizar catalogo de Mercado Libre, precios vivos y stock oficial
"[$Timestamp] [CRON_RUNNER] Sincronizando catalogo en vivo desde Mercado Libre..." | Out-File -FilePath $LogFile -Append -Encoding utf8
if (Get-Command python -ErrorAction SilentlyContinue) {
    python sync_mercadolibre_catalog.py | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 1.3. Sincronizar Albarracín Instagram Smart Catalog (@albarracinmotos)
"[$Timestamp] [CRON_RUNNER] Sincronizando Albarracín Instagram Smart Catalog (@albarracinmotos)..." | Out-File -FilePath $LogFile -Append -Encoding utf8
if (Get-Command node -ErrorAction SilentlyContinue) {
    node sync_instagram_catalog.js --run-now | Out-File -FilePath $LogFile -Append -Encoding utf8
} elseif (Get-Command python -ErrorAction SilentlyContinue) {
    python sync_instagram_catalog.py --run-now | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# 1.5. Sincronizar precios, stock y catalogo de repuestos (proveedores y compatibilidades)
if (Test-Path "$BaseDir\lista_proveedor.csv") {
    "[$Timestamp] [CRON_RUNNER] Sincronizando catalogo de repuestos y listas de proveedores..." | Out-File -FilePath $LogFile -Append -Encoding utf8
    if (Get-Command python -ErrorAction SilentlyContinue) {
        python importador.py | Out-File -FilePath $LogFile -Append -Encoding utf8
    }
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
                "[$Timestamp] [CRON_RUNNER] Disparando despliegue automatico a Netlify ($hookUrl)..." | Out-File -FilePath $LogFile -Append -Encoding utf8
                Invoke-RestMethod -Uri $hookUrl -Method Post
                "[$Timestamp] [CRON_RUNNER] Despliegue en Netlify solicitado exitosamente." | Out-File -FilePath $LogFile -Append -Encoding utf8
            } catch {
                "[$Timestamp] [CRON_RUNNER] Error al llamar al Netlify Build Hook: $_" | Out-File -FilePath $LogFile -Append -Encoding utf8
            }
        }
    }
}

"[$Timestamp] [CRON_RUNNER] Ciclo diario finalizado exitosamente." | Out-File -FilePath $LogFile -Append -Encoding utf8
