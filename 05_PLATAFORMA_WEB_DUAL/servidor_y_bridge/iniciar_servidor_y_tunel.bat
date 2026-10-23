@echo off
title ExpendeX Vending - Servidor Kiosco Raspberry Pi y Tunel Cloudflare
echo ==============================================================================
echo   EXPENDEX VENDING MACHINE - INICIANDO SISTEMA KIOSCO Y NUBE
echo   Facultad de Ingenieria Mecanica y Electrica (FIME UANL)
echo ==============================================================================
echo.

cd /d "C:\Users\SAmue\Desktop\ExpendeX"

echo [1/3] Verificando dependencias...
if not exist "node_modules" (
    echo Instalando modulos de Node.js...
    call "C:\Program Files\nodejs\npm.cmd" install
)

echo [2/3] Iniciando Servidor Kiosco Node.js en puerto 3000...
start "ExpendeX Node Server" /b "C:\Program Files\nodejs\node.exe" server.js

timeout /t 2 /nobreak > nul

echo [3/3] Iniciando Tunel Cloudflare a Internet...
start "ExpendeX Cloudflare Tunnel" "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel --url http://localhost:3000

echo.
echo ==============================================================================
echo   SISTEMA ACTIVO:
echo   - Kiosco Local (Pantalla 10.1"): http://localhost:3000/
echo   - Panel del Dueno:             http://localhost:3000/admin
echo   - Red Local Wi-Fi:             http://192.168.100.114:3000/
echo ==============================================================================
echo.
echo Abriendo Kiosco en tu navegador...
start http://localhost:3000/

pause
