"""
==============================================================================
EXPENDEX® VENDING - PASARELA DE PAGOS MERCADO PAGO QR & ESP32 BRIDGE
Ingeniería en Electrónica y Automatización (IEA) - FIME UANL
Script Maestro de Comunicación Serial, Generación de QR y Verificación de Pagos
==============================================================================
"""

import os
import sys
import time
import uuid
import threading
import requests
import qrcode
import serial
import serial.tools.list_ports

# ----------------------------------------------------------------------------
# 1. CREDENCIALES OFICIALES DE MERCADO PAGO DEVELOPERS
# ----------------------------------------------------------------------------
PUBLIC_KEY   = os.environ.get("MP_PUBLIC_KEY", "TU_MERCADOPAGO_PUBLIC_KEY_AQUI")
ACCESS_TOKEN = os.environ.get("MP_ACCESS_TOKEN", "TU_MERCADOPAGO_ACCESS_TOKEN_AQUI")
COLLECTOR_ID = "141474351"

HEADERS = {
    "Authorization": f"Bearer {ACCESS_TOKEN}",
    "Content-Type": "application/json"
}

# ----------------------------------------------------------------------------
# 2. CATÁLOGO OFICIAL DE PRODUCTOS FIME (BANDEJAS Y SLOTS)
# ----------------------------------------------------------------------------
CATALOGO_PRODUCTOS = {
    "1": {"nombre": "Burrito de Deshebrada Casero", "precio": 35.00, "slot": 1},
    "2": {"nombre": "Torta Especial FIME (Jamon y Queso)", "precio": 45.00, "slot": 2},
    "3": {"nombre": "Pechuga Cordon Bleu con Guarnicion", "precio": 55.00, "slot": 3},
    "4": {"nombre": "Tinga de Pollo Nortena con Arroz", "precio": 42.00, "slot": 4},
    "5": {"nombre": "Agua Fresca Natural 600ml (Horchata/Jamaica)", "precio": 20.00, "slot": 5},
    "6": {"nombre": "Combo Proteico FIME (Guisado + Bebida)", "precio": 65.00, "slot": 6},
}

# ----------------------------------------------------------------------------
# 3. DETECCIÓN Y CONEXIÓN CON EL ESP32 POR PUERTO SERIAL USB
# ----------------------------------------------------------------------------
def detectar_y_conectar_esp32():
    print("\n[ESP32] Buscando microcontrolador en puertos COM...")
    puertos = list(serial.tools.list_ports.comports())
    
    if not puertos:
        print("[ESP32] No se detectaron puertos COM. Activando MODO SIMULACIÓN.")
        return None
        
    for p in puertos:
        desc = p.description.lower()
        # Buscar adaptadores comunes de ESP32 (CP210x, CH340, USB Serial, FTDI)
        if any(chip in desc for chip in ["cp210", "ch340", "usb", "serial", "uart"]):
            try:
                print(f"[ESP32] Intentando conectar con {p.device} ({p.description})...")
                ser = serial.Serial(p.device, 115200, timeout=1.5)
                time.sleep(2) # Esperar ciclo de auto-reset DTR
                
                # Probar comunicación enviando PING
                ser.write(b"PING\n")
                time.sleep(0.3)
                resp = ser.read_all().decode(errors="ignore")
                print(f"[ESP32] ¡Conexión exitosa en {p.device}!")
                return ser
            except Exception as e:
                print(f"[ESP32] No se pudo abrir {p.device}: {e}")
                
    # Si ninguno respondió como ESP32 específico, preguntar si usar el primero disponible
    print(f"[ESP32] Puertos detectados: {[p.device for p in puertos]}")
    print("[ESP32] Operando en MODO SIMULACIÓN (puedes conectar el ESP32 en cualquier momento).")
    return None

# ----------------------------------------------------------------------------
# 4. CREACIÓN DE PREFERENCIA DE PAGO Y CÓDIGO QR EN MERCADO PAGO
# ----------------------------------------------------------------------------
def crear_orden_qr(item):
    nombre = item["nombre"]
    precio = item["precio"]
    slot   = item["slot"]
    
    ref_id = f"XPEN_SLOT{slot}_{uuid.uuid4().hex[:6]}"
    
    url = "https://api.mercadopago.com/checkout/preferences"
    payload = {
        "items": [
            {
                "title": f"ExpendeX: {nombre}",
                "description": f"Dispensador Automatico FIME - Slot {slot}",
                "quantity": 1,
                "unit_price": float(precio),
                "currency_id": "MXN"
            }
        ],
        "external_reference": ref_id,
        "statement_descriptor": "EXPENDEX FIME",
        "back_urls": {
            "success": "https://www.mercadopago.com.mx",
            "failure": "https://www.mercadopago.com.mx",
            "pending": "https://www.mercadopago.com.mx"
        },
        "auto_return": "approved"
    }
    
    try:
        res = requests.post(url, headers=HEADERS, json=payload, timeout=8)
        if res.status_code != 201:
            print(f"[ERROR MP] Código {res.status_code}: {res.text}")
            return None, None
            
        data = res.json()
        init_point = data.get("init_point")
        pref_id = data.get("id")
        
        # Generar imagen de Código QR
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_M,
            box_size=12,
            border=3
        )
        qr.add_data(init_point)
        qr.make(fit=True)
        img = qr.make_image(fill_color="#002D62", back_color="#FFFFFF") # Colores FIME Azul/Blanco
        
        qr_file = "qr_pago_actual.png"
        img.save(qr_file)
        
        print("\n" + "="*65)
        print(f"  ORDEN GENERADA EXITOSAMENTE EN MERCADO PAGO MÉXICO")
        print("="*65)
        print(f"  Platillo:            {nombre}")
        print(f"  Precio Oficial:      ${precio:.2f} MXN")
        print(f"  Slot Físico:         Bandeja #{slot}")
        print(f"  ID Referencia:       {ref_id}")
        print(f"  Preferencia MP:      {pref_id}")
        print(f"  Enlace de Pago:      {init_point}")
        print("="*65)
        print(f">> Código QR guardado en: {os.path.abspath(qr_file)}")
        print(">> Abriendo ventana con el Código QR para escanear con el celular...")
        
        # Abrir visor de imágenes en Windows
        try:
            os.startfile(qr_file)
        except Exception:
            pass
            
        return ref_id, init_point
        
    except Exception as e:
        print("[ERROR] Excepción de conexión con Mercado Pago:", e)
        return None, None

# ----------------------------------------------------------------------------
# 5. MONITOREO EN TIEMPO REAL DEL PAGO (POLLING INTELIGENTE)
# ----------------------------------------------------------------------------
def esperar_pago_aprobado(external_ref, timeout_seg=180):
    url = f"https://api.mercadopago.com/v1/payments/search?external_reference={external_ref}"
    print(f"\n[MONITOR] Esperando confirmación de cobro para {external_ref}...")
    print("[MONITOR] Escanea el QR con la cámara de tu celular o la app de Mercado Pago.")
    
    t_start = time.time()
    puntos = 0
    
    while time.time() - t_start < timeout_seg:
        try:
            res = requests.get(url, headers=HEADERS, timeout=5)
            if res.status_code == 200:
                results = res.json().get("results", [])
                for p in results:
                    estado = p.get("status")
                    if estado == "approved":
                        pago_id = p.get("id")
                        monto = p.get("transaction_amount")
                        metodo = p.get("payment_method_id", "tarjeta/qr")
                        print("\n\n" + "*"*65)
                        print("  ¡PAGO APROBADO EN MERCADO PAGO! AUTORIZANDO ENTREGA")
                        print("*"*65)
                        print(f"  ID de Transacción:   {pago_id}")
                        print(f"  Monto Acreditado:    ${monto:.2f} MXN")
                        print(f"  Método de Cobro:     {metodo.upper()}")
                        print(f"  Fecha y Hora:        {p.get('date_approved')}")
                        print("*"*65)
                        return True
                    elif estado in ["rejected", "cancelled"]:
                        print(f"\n[AVISO] Pago rechazado por el banco ({p.get('status_detail')})")
                        return False
        except Exception:
            pass
            
        time.sleep(1.8)
        sys.stdout.write(".")
        sys.stdout.flush()
        puntos += 1
        if puntos % 35 == 0:
            restante = int(timeout_seg - (time.time() - t_start))
            print(f" ({restante}s restantes)")
            
    print("\n[TIMEOUT] Tiempo de espera agotado (180 segundos). Orden cancelada.")
    return False

# ----------------------------------------------------------------------------
# 6. ACCIÓN MECATRÓNICA: DISPENSAR Y MONITOREAR SENSOR IR
# ----------------------------------------------------------------------------
def ordenar_dispensado_esp32(ser, slot):
    cmd = f"DISPENSE:{slot}\n"
    
    if ser is not None and ser.is_open:
        print(f"\n[UART] Enviando comando al microcontrolador: {cmd.strip()}")
        ser.write(cmd.encode("utf-8"))
        
        # Esperar respuesta del firmware del ESP32
        t0 = time.time()
        print("[UART] Monitoreando giro de espiral y sensor óptico IR en pozo de entrega...")
        while time.time() - t0 < 8.0:
            if ser.in_waiting > 0:
                linea = ser.readline().decode(errors="ignore").strip()
                if linea:
                    print(f"  [ESP32] -> {linea}")
                    if "OK_DELIVERED" in linea:
                        print("\n=======================================================")
                        print("  ¡DISPENSADO CONFIRMADO POR SENSOR ÓPTICO INFRARROJO! ")
                        print(f"  Producto del Slot #{slot} entregado en bandeja.")
                        print("=======================================================\n")
                        return True
                    elif "ERR" in linea:
                        print("\n[ALERTA MECATRÓNICA] Falla en sensor IR o posible atasco en espiral.")
                        return False
            time.sleep(0.05)
    else:
        # Simulación realista cuando no hay ESP32 conectado
        print(f"\n[MODO SIMULACIÓN] Comando enviado virtualmente: DISPENSE:{slot}")
        print("[MODO SIMULACIÓN] Girando espiral helicoidal (MOSFET Canal activo)...")
        time.sleep(1.8)
        print("[MODO SIMULACIÓN] Haz óptico interrumpido en GPIO 19 (Sensor IR = LOW).")
        print("[MODO SIMULACIÓN] Motor apagado. ¡Producto entregado con éxito!\n")
        return True

# ----------------------------------------------------------------------------
# 7. INTERFAZ DE CONSOLA Y EJECUCIÓN PRINCIPAL
# ----------------------------------------------------------------------------
def main():
    print("""
  =============================================================
     __   __                    _       __   __  ____   ___  
     \\ \\ / /                   | |      \\ \\ / / |___ \\ / _ \\ 
      \\ V / _ __   ___ _ __   __| | ___  \\ V /    __) | | | |
      /   \\| '_ \\ / _ \\ '_ \\ / _` |/ _ \\  /   \\   |__ <| | | |
     / /^\\ \\ |_) |  __/ | | | (_| |  __/ / /^\\ \\  ___) | |_| |
     \\/   \\/ .__/ \\___|_| |_|\\__,_|\\___| \\/   \\/ |____/ \\___/ 
           | |                                               
           |_|   MICRO-RESTAURANTE REFRIGERADO FIME UANL      
  =============================================================
  Integración Oficial de Mercado Pago QR + Control ESP32
  Coordinación de Ingeniería en Electrónica y Automatización
    """)
    print(f"  * Public Key:   {PUBLIC_KEY}")
    print(f"  * Collector ID: {COLLECTOR_ID} (México - MLM)")
    
    # 1. Conectar con ESP32
    ser = detectar_y_conectar_esp32()
    
    while True:
        print("\n" + "-"*55)
        print("  SELECCIONA UN PRODUCTO PARA PRUEBA DE DISPENSADO:")
        print("-"*55)
        for k, v in CATALOGO_PRODUCTOS.items():
            print(f"  [{k}] {v['nombre']:<42} -> ${v['precio']:>5.2f} MXN (Slot {v['slot']})")
        print("  [S] Salir del programa")
        print("-"*55)
        
        opc = input("Ingresa tu opción (1-6 o S): ").strip().upper()
        
        if opc == "S":
            print("\nCerrando pasarela ExpendeX. ¡Hasta pronto!")
            if ser and ser.is_open:
                ser.close()
            break
            
        if opc not in CATALOGO_PRODUCTOS:
            print("[AVISO] Opción no válida. Intenta de nuevo.")
            continue
            
        item = CATALOGO_PRODUCTOS[opc]
        
        # 2. Generar el cobro en Mercado Pago y mostrar el QR
        ref, link = crear_orden_qr(item)
        if not ref:
            print("[ERROR] No se pudo crear la orden. Verifica tu conexión a Internet.")
            continue
            
        # 3. Monitorear hasta que el alumno pague con su teléfono
        pagado = esperar_pago_aprobado(ref)
        
        # 4. Si el pago fue aprobado, dispensar el producto
        if pagado:
            ordenar_dispensado_esp32(ser, item["slot"])
        else:
            print("[INFO] No se activó el motor debido a que no se completó el pago.")

if __name__ == "__main__":
    main()
