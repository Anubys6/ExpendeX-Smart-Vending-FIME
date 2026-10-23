@echo off
chcp 65001 >nul
title Expendex - Lanzador Simulacion VS Code Wokwi (Matriz 36 LEDs) + Pagina Web
echo ===============================================================================
echo   EXPENDEX (FIME UANL) - SIMULACION EN VIVO VS CODE WOKWI (36 LEDs) + WEB
echo ===============================================================================
echo.
echo [1/3] Iniciando Servidor Backend Node.js (Puerto 3000 + Puente Wokwi 4000)...
start "Expendex Backend Server (Puerto 3000)" /MIN cmd /c "cd /d "C:\Users\SAmue\Downloads\Proyecto Final\06_PLATAFORMA_WEB_KIOSCO_Y_ADMIN\servidor_y_bridge" && node server.js"
timeout /t 2 /nobreak >nul

echo [2/3] Abriendo Pagina Web del Quiosco (http://localhost:3000) y Panel Admin...
start "" "http://localhost:3000"
start "" "http://localhost:3000/admin"

echo [3/3] Abriendo Proyecto de Matriz de 36 LEDs (6x6) en Visual Studio Code...
call code "C:\Users\SAmue\Downloads\Proyecto Final\Simulacion_VSCode_Wokwi_Matriz_36_LEDs" "C:\Users\SAmue\Downloads\Proyecto Final\Simulacion_VSCode_Wokwi_Matriz_36_LEDs\diagram.json"

echo.
echo ===============================================================================
echo   LISTO PARA DEMOSTRACION EN VIVO:
echo   1. En Visual Studio Code, presiona F1 y selecciona: "Wokwi: Start Simulator"
echo      (o haz clic en el boton Play verde sobre diagram.json).
echo   2. En la Pagina Web (http://localhost:3000), selecciona cualquier Comida,
echo      Bebida o Combo y haz clic en "Pagar con Tarjeta / Saldo", "Apple Pay"
echo      o "Google Pay".
echo   3. Observa como se enciende AL INSTANTE el LED exacto (M-A1 a M-F6) y el
echo      Relevador (Pin 18) en la matriz de 36 LEDs de Wokwi!
echo   4. Haz clic en el boton verde "Sensor Caida (IR)" en Wokwi para simular que
echo      el producto cayo a la bandeja y apagar el motor.
echo ===============================================================================
pause
