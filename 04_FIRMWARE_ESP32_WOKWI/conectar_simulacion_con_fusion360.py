"""
=============================================================================
EXPENDEX® - PUENTE DE INTEGRACION: SIMULADOR VS CODE <-> FUSION 360
Facultad de Ingenieria Mecanica y Electrica (FIME - UANL)
=============================================================================
Este script se ejecuta directamente en la terminal de Visual Studio Code.
Monitorea la simulacion activa de Wokwi (diagram.json / ESP32) y retransmite
automaticamente las ordenes de dispensado a Autodesk Fusion 360 (puerto 9999).
=============================================================================
"""

import sys
import time
import socket
import json
import threading
import re

FUSION_HOST = "127.0.0.1"
FUSION_PORT = 9999
WOKWI_SERIAL_PORT = 4000  # Configurado en wokwi.toml (rfc2217ServerPort)

def send_to_fusion360(slot_name="A1", degrees=360.0):
    """Envia el comando de giro al script de Fusion 360"""
    slot_clean = slot_name.upper().strip()
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(2.5)
        s.connect((FUSION_HOST, FUSION_PORT))
        
        payload = json.dumps({"slot": slot_clean, "degrees": degrees})
        s.send(payload.encode('utf-8'))
        resp = s.recv(1024).decode('utf-8', errors='ignore')
        s.close()
        print(f"\n>>> [FUSION 360 EN VIVO] Girando resorte mecanico del Slot '{slot_clean}' (360°)...")
        print(f"    Respuesta de Autodesk Fusion 360: {resp.strip()}\n")
        return True
    except ConnectionRefusedError:
        print(f"\n[AVISO] No se detecto Fusion 360 escuchando en el puerto {FUSION_PORT}.")
        print("-> Abre Autodesk Fusion 360 y ejecuta: Shift+S -> 'Expendex_Wokwi_Animator' -> Run.")
        return False
    except Exception as e:
        print(f"[ERROR FUSION] {e}")
        return False

def monitor_wokwi_serial():
    """Se conecta al puerto serie virtual de Wokwi en VS Code (puerto 4000)"""
    print(f"[MONITOR] Intentando conectar al puerto serie de Wokwi en localhost:{WOKWI_SERIAL_PORT}...")
    while True:
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.connect(("127.0.0.1", WOKWI_SERIAL_PORT))
            print(f"[CONECTADO] Enlace serie con la simulacion Wokwi en VS Code ESTABLECIDO.")
            
            buffer = ""
            while True:
                data = sock.recv(512).decode('utf-8', errors='ignore')
                if not data:
                    break
                buffer += data
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line:
                        continue
                    
                    # Detectar ordenes de dispensado en la consola del ESP32
                    if "FUSION360_DISPENSE:" in line:
                        slot = line.split("FUSION360_DISPENSE:")[-1].strip()
                        send_to_fusion360(slot)
                    elif "DISPENSANDO " in line:
                        m = re.search(r'DISPENSANDO\s+([A-Fa-f0-9\-]+)', line)
                        if m:
                            send_to_fusion360(m.group(1))
                    elif "Casilla / Slot: M-" in line:
                        m = re.search(r'Slot:\s*M-([A-Fa-f0-9]+)', line)
                        if m:
                            send_to_fusion360(m.group(1))

        except ConnectionRefusedError:
            # Wokwi aun no arranca o esta en pausa
            time.sleep(2.0)
        except Exception as e:
            time.sleep(2.0)

def main():
    print("""
  =============================================================
     EXPENDEX® - ENLACE VISUAL STUDIO CODE <-> FUSION 360
     Coordinacion de Ingenieria en Electronica y Mecatronica
  =============================================================
  - Escuchando simulacion Wokwi en VS Code (diagram.json)
  - Enlazando con Autodesk Fusion 360 (puerto 9999)
  =============================================================
    """)

    # 1. Iniciar monitor serie de Wokwi en segundo plano
    t = threading.Thread(target=monitor_wokwi_serial, daemon=True)
    t.start()

    print("Comandos disponibles en esta terminal de VS Code:")
    print("  * Escribe el codigo del slot (ej: A1, A2, B1, B4) y presiona Enter")
    print("  * O interactua directamente con la simulacion Wokwi (diagram.json)")
    print("  * Escribe 'demo' para girar 3 slots en secuencia")
    print("  * Escribe 'salir' para cerrar este enlace\n")

    while True:
        try:
            cmd = input("VSCode-ExpendeX > ").strip()
            if not cmd:
                continue
            if cmd.lower() in ['salir', 'exit', 'q']:
                break
            if cmd.lower() == 'demo':
                for s in ['A1', 'A2', 'B1']:
                    send_to_fusion360(s)
                    time.sleep(2.0)
            else:
                send_to_fusion360(cmd)
        except (KeyboardInterrupt, EOFError):
            break

if __name__ == '__main__':
    if len(sys.argv) > 1:
        send_to_fusion360(sys.argv[1])
    else:
        main()
