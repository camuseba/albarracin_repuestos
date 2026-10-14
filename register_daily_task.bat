@echo off
title Albarracin Motos - Registro de Tarea Diaria 03:30 AM
echo ========================================================
echo REGISTRANDO TAREA PROGRAMADA AUTOMATICA: 03:30 AM
echo Sincronizacion de Catalogo Instagram, Mercado Libre y DNRPA
echo ========================================================

schtasks /create /tn "AlbarracinDailySync" /tr "\"%~dp0sync_daily.bat\"" /sc daily /st 03:30 /f

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [EXITO] Tarea "AlbarracinDailySync" registrada correctamente.
    echo Se ejecutara todos los dias a las 03:30 AM en segundo plano.
) else (
    echo.
    echo [AVISO] Se requieren permisos de administrador si la creacion fallo.
)

pause
