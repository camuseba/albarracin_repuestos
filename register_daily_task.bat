@echo off
title Albarracin Motos - Registro de Tarea Diaria 03:30 AM
echo ========================================================
echo REGISTRANDO TAREA PROGRAMADA AUTOMATICA: 03:30 AM
echo Sincronizacion de Catalogo Instagram, Mercado Libre y DNRPA
echo ========================================================

schtasks /create /tn "AlbarracinDailySync" /tr "\"%~dp0sync_daily.bat\"" /sc daily /st 03:30 /f

if %ERRORLEVEL% EQU 0 (
    echo [CONFIGURANDO] Habilitando recuperacion automatica tras suspension o apagado...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries; Set-ScheduledTask -TaskName 'AlbarracinDailySync' -Settings $settings" >nul 2>&1
    echo.
    echo [EXITO] Tarea "AlbarracinDailySync" registrada correctamente.
    echo - Se ejecutara a las 03:30 AM o al encender la computadora si estuvo apagada.
    echo - Sincroniza catalogo Instagram, Mercado Libre y base vehicular.
) else (
    echo.
    echo [AVISO] Se requieren permisos de administrador si la creacion fallo.
)

pause

