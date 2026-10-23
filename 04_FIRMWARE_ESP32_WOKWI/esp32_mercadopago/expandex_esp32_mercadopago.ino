// ============================================================================
// EXPENDEX® — FIRMWARE MECATRÓNICO OFICIAL ESP32-S3 / ESP32 WROOM
// PROYECTO DE INGENIERÍA EN ELECTRÓNICA Y AUTOMATIZACIÓN (IEA) - FIME UANL
// Pasarela de Pagos Cashless Mercado Pago QR + Control de Dispensado y Sensor IR
// Compatible con Visual Studio Code (PlatformIO / Arduino Extension / IDE)
// ============================================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE RED WIFI (OPCIONAL: PARA MODO AUTÓNOMO EN LA FACULTAD)
// ----------------------------------------------------------------------------
const char* WIFI_SSID     = "FIME_ALUMNOS";     // Cambia por el SSID de tu red
const char* WIFI_PASSWORD = "";                 // Password de tu red (o vacío si es abierta)
const bool  HABILITAR_WIFI_DIRECTO = false;     // Poner 'true' si el ESP32 consultará MP por sí solo

// ----------------------------------------------------------------------------
// 2. CREDENCIALES OFICIALES DE MERCADO PAGO DEVELOPERS
// ----------------------------------------------------------------------------
const char* MP_PUBLIC_KEY   = "APP_USR-b9b1ba31-2b8f-49a4-ae6d-29932498f239";
const char* MP_ACCESS_TOKEN = "APP_USR-7942610310473752-101604-2171dbea0243c347cf23021159470925-3766833937";

// ----------------------------------------------------------------------------
// 3. PINES MECATRÓNICOS DE ACTUACIÓN Y SENSORES
// ----------------------------------------------------------------------------
const int PIN_MOTOR_DEFAULT = 23;  // Salida Gate MOSFET / Relevador (Canal de prueba)
const int PIN_SENSOR_IR     = 19;  // Entrada del sensor óptico infrarrojo de caída (haz activo en LOW)
const int PIN_STATUS_LED    = 2;   // LED integrado del ESP32 para diagnóstico visual

// Parámetros de operación y tiempos
const unsigned long TIMEOUT_GIRO_MAX_MS = 6000;  // 6 segundos máximo de giro para prevenir atascos
const unsigned long INTERVALO_POLLING_MS = 2000; // Consulta cada 2 segundos en modo WiFi directo

String ultimoPaymentIdProcesado = "";
unsigned long ultimaConsultaMs  = 0;

// ----------------------------------------------------------------------------
// 4. RUTINA DE DISPENSADO CON MONITOREO DE SENSOR ÓPTICO DE CAÍDA
// ----------------------------------------------------------------------------
bool ejecutarDispensadoMecatronico(int slotId, String motivo = "") {
  Serial.println("==========================================");
  Serial.print("[EXPENDEX] DISPENSANDO SLOT #"); Serial.println(slotId);
  if (motivo != "") {
    Serial.print("[EXPENDEX] Origen / Info: "); Serial.println(motivo);
  }
  Serial.println("==========================================");

  // 1. Encender indicador visual y motor/MOSFET
  digitalWrite(PIN_STATUS_LED, HIGH);
  digitalWrite(PIN_MOTOR_DEFAULT, HIGH);

  unsigned long t0 = millis();
  bool productoDetectado = false;

  // 2. Bucle de monitoreo continuo del sensor IR mientras gira la espiral
  while (millis() - t0 < TIMEOUT_GIRO_MAX_MS) {
    // Si el producto cae y corta el haz óptico IR (señal en nivel BAJO)
    if (digitalRead(PIN_SENSOR_IR) == LOW) {
      delay(80); // Filtro antirrebote mecánico por oscilación del producto
      if (digitalRead(PIN_SENSOR_IR) == LOW) {
        productoDetectado = true;
        break; // Detener inmediatamente el motor
      }
    }
    delay(10);
  }

  // 3. Apagado inmediato del motor
  digitalWrite(PIN_MOTOR_DEFAULT, LOW);
  digitalWrite(PIN_STATUS_LED, LOW);

  // 4. Reporte de resultado hacia la Raspberry Pi / PC
  if (productoDetectado) {
    Serial.print("STATUS:OK_DELIVERED:"); Serial.println(slotId);
    Serial.println("[EXPENDEX] Producto detectado en el pozo. Entrega exitosa.");
    return true;
  } else {
    Serial.print("STATUS:ERR_TIMEOUT_OR_JAM:"); Serial.println(slotId);
    Serial.println("[ALERTA] Tiempo de giro agotado sin confirmación óptica de caída.");
    return false;
  }
}

// ----------------------------------------------------------------------------
// 5. CONSULTA DIRECTA A LA API DE MERCADO PAGO (MODO AUTÓNOMO CON WIFI)
// ----------------------------------------------------------------------------
void verificarPagosMercadoPagoDirecto() {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure(); // Conexión TLS/HTTPS a Mercado Pago sin validación estricta de cert

  HTTPClient https;
  String url = "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=1";

  if (https.begin(client, url)) {
    https.addHeader("Authorization", String("Bearer ") + MP_ACCESS_TOKEN);
    https.addHeader("Content-Type", "application/json");

    int httpCode = https.GET();
    if (httpCode == HTTP_CODE_OK) {
      String payload = https.getString();
      JsonDocument doc;
      DeserializationError err = deserializeJson(doc, payload);

      if (!err && doc["results"].size() > 0) {
        JsonObject ultimoPago = doc["results"][0];
        String idPago = String((long)ultimoPago["id"]);
        String status = ultimoPago["status"].as<String>();
        float  monto  = ultimoPago["transaction_amount"].as<float>();
        String extRef = ultimoPago["external_reference"].as<String>();

        // Si el pago más reciente está aprobado y es nuevo
        if (status == "approved" && idPago != ultimoPaymentIdProcesado) {
          if (ultimoPaymentIdProcesado != "") {
            int slot = 1; // Slot por defecto
            if (extRef.startsWith("XPEN_") || extRef.startsWith("SLOT_")) {
              // Extraer slot si viene en la referencia
              int subIdx = extRef.indexOf('_');
              if (subIdx >= 0) {
                int nextIdx = extRef.indexOf('_', subIdx + 1);
                if (nextIdx > subIdx) {
                  slot = extRef.substring(subIdx + 1, nextIdx).toInt();
                }
              }
            }
            String info = "Pago MP #" + idPago + " ($" + String(monto, 2) + " MXN) Ref: " + extRef;
            ejecutarDispensadoMecatronico(slot, info);
          }
          ultimoPaymentIdProcesado = idPago;
        }
      }
    }
    https.end();
  }
}

// ----------------------------------------------------------------------------
// 6. SETUP PRINCIPAL
// ----------------------------------------------------------------------------
void setup() {
  Serial.begin(115200);

  pinMode(PIN_MOTOR_DEFAULT, OUTPUT);
  pinMode(PIN_STATUS_LED, OUTPUT);
  pinMode(PIN_SENSOR_IR, INPUT_PULLUP);

  digitalWrite(PIN_MOTOR_DEFAULT, LOW);
  digitalWrite(PIN_STATUS_LED, LOW);

  delay(500);
  Serial.println("\n========================================================");
  Serial.println("  EXPENDEX VENDING MACHINE - ESP32 CONTROLADOR ACTIVO   ");
  Serial.println("  IEA - FACULTAD DE INGENIERÍA MECÁNICA Y ELÉCTRICA    ");
  Serial.println("========================================================");
  Serial.print("[INFO] Public Key configurada:  "); Serial.println(MP_PUBLIC_KEY);
  Serial.println("[INFO] Sensor IR asignado a GPIO 19 | Motor Prueba a GPIO 23");
  Serial.println("[INFO] Escuchando comandos Serial (ej. 'DISPENSE:1')...");

  if (HABILITAR_WIFI_DIRECTO && String(WIFI_SSID) != "TU_RED_WIFI") {
    Serial.print("[WIFI] Conectando a "); Serial.println(WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 20) {
      delay(300);
      Serial.print(".");
      intentos++;
    }
    if (WiFi.status() == WL_CONNECTED) {
      Serial.println("\n[WIFI] ¡Conectado exitosamente! IP: " + WiFi.localIP().toString());
    } else {
      Serial.println("\n[WIFI] No se pudo conectar a WiFi. Operando en modo Serial exclusivo.");
    }
  } else {
    Serial.println("[WIFI] Modo Serial UART activo (controlado por Raspberry Pi / PC).");
  }

  Serial.println("EXPENDEX_ESP32_READY");
}

// ----------------------------------------------------------------------------
// 7. BUCLE CONTINUO (COMUNICACIÓN SERIAL + POLLING OPCIONAL)
// ----------------------------------------------------------------------------
void loop() {
  // A. Escuchar comandos entrantes por el puerto serie USB / UART (Modo RPi / PC)
  if (Serial.available() > 0) {
    String linea = Serial.readStringUntil('\n');
    linea.trim();

    if (linea.startsWith("DISPENSE:")) {
      int slot = linea.substring(9).toInt();
      if (slot <= 0) slot = 1;
      ejecutarDispensadoMecatronico(slot, "Comando Serial PC/RPi");
    } else if (linea == "PING") {
      Serial.println("PONG:EXPENDEX_READY");
    } else if (linea == "TEST_SENSOR") {
      int estado = digitalRead(PIN_SENSOR_IR);
      Serial.print("SENSOR_IR_VAL:"); Serial.println(estado == LOW ? "INTERRUMPIDO (OBJETO)" : "LIBRE");
    } else if (linea == "HELP") {
      Serial.println("Comandos disponibles: DISPENSE:<slot>, PING, TEST_SENSOR");
    }
  }

  // B. Si está activado el modo WiFi directo, consultar Mercado Pago periódicamente
  if (HABILITAR_WIFI_DIRECTO && (millis() - ultimaConsultaMs >= INTERVALO_POLLING_MS)) {
    ultimaConsultaMs = millis();
    verificarPagosMercadoPagoDirecto();
  }
}
