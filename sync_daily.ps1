# =============================================================================
# SCRIPT DE EJECUCION DIARIA AUTOMATIZADA — ALBARRACIN MOTOS Y REPUESTOS
# =============================================================================
$BaseDir = "d:\SEBASTIAN\IA_desarrollos\comp2\albarracin_repuestos"
Set-Location -Path $BaseDir

$LogFile = Join-Path $BaseDir "daily_cron.log"
$Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$Timestamp] [CRON_RUNNER] Iniciando ciclo diario de sincronizacion vehicular..." | Out-File -FilePath $LogFile -Append -Encoding utf8

# 1. Ejecutar sincronizacion incremental con datos abiertos y catalogo maestro
python dnrpa_sync.py --run-now | Out-File -FilePath $LogFile -Append -Encoding utf8

# 1.5. Sincronizar precios, stock y catalogo de repuestos (proveedores y compatibilidades)
if (Test-Path "$BaseDir\lista_proveedor.csv") {
    "[$Timestamp] [CRON_RUNNER] Sincronizando catalogo de repuestos y listas de proveedores..." | Out-File -FilePath $LogFile -Append -Encoding utf8
    python importador.py | Out-File -FilePath $LogFile -Append -Encoding utf8
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
