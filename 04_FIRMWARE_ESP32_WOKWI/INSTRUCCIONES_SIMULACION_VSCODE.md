# Guía de Simulación en Vivo: Matriz de 36 LEDs (6×6) en VS Code (Wokwi) + Página Web Expendex

## Opción 1: Arranque Automático con 1 Clic (Recomendado)
Haz doble clic en el archivo:
- **`Abrir_Simulacion_VSCode_Wokwi_y_Web.bat`** (ubicado en la raíz de `Proyecto Final` y dentro de esta carpeta).

Este lanzador ejecuta automáticamente:
1. **Servidor Backend Node.js (`server.js`)** en `http://localhost:3000` con puente directo al puerto `4000` (RFC2217) y endpoint `/api/esp32/pendientes`.
2. **Página Web del Cliente (Quiosco 10.1")** en `http://localhost:3000` y **Panel del Dueño** en `http://localhost:3000/admin`.
3. **Visual Studio Code** con esta carpeta y el archivo `diagram.json` abierto.

---

## Opción 2: Pasos dentro de Visual Studio Code
1. Con la carpeta abierta en **Visual Studio Code**, abre el archivo `diagram.json` o presiona **`F1`** (`Ctrl+Shift+P`) y selecciona:
   ```text
   Wokwi: Start Simulator
   ```
2. Espera ~2 segundos a que la pantalla LCD 1602 muestre:
   ```text
   Expendex  2.8°C
   LISTO P/ COMPRA
   ```
3. Ve a tu navegador en **`http://localhost:3000`** (Página Web del Quiosco):
   - Elige cualquier **Platillo Caliente** (`A1`–`F1`, `A6`–`F6`), **Bebida Fría** (`A2`–`F5`) o **Combo** (ej. `A1-A2`).
   - Haz clic en **"Pagar con Tarjeta / Saldo"**, **"Apple Pay"** o **"Google Pay"**.
4. **¡Observa la Matriz de 36 LEDs en Wokwi!**
   - En menos de `15 ms`, el **LED exacto de la casilla comprada** (`M-A1` a `M-F6`) y el **Módulo Relevador (`Pin 18`)** se encenderán en color rojo brillante.
   - La pantalla **LCD 1602** mostrará `DISPENSANDO A1 / PULSA BOTON IR..` (o `[1/2] COMIDA A1` si compraste un combo).
5. **Simular Caída del Producto (Sensor Infrarrojo IR):**
   - Haz clic en el **botón verde `"Sensor Caida (IR)"`** en el simulador Wokwi (conectado al `GPIO 4`).
   - El motor/LED se apagará inmediatamente al detectar el producto en la bandeja receptora (o pasará automáticamente al segundo motor `[2/2] BEBIDA` si compraste un combo).
