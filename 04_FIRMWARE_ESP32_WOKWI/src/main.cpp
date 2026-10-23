/*
 * =====================================================================================
 *  ExpendeX® — SMART VENDING MACHINE 36 SELECCIONES (MATRIZ 6x6 - FIME UANL)
 *  FIRMWARE OFICIAL ESP32 + SINCRONIZACIÓN EN TIEMPO REAL CON PÁGINA WEB Y MERCADO PAGO
 * =====================================================================================
 *  Este firmware integra la simulación en Visual Studio Code (Wokwi) con la Página Web:
 *  1. Se conecta a Internet / Red Local vía WiFi ("Wokwi-GUEST") y Puerto Serie RFC2217.
 *  2. Recibe al instante las compras realizadas en la Página Web del Quiosco (localhost:3000)
 *     tanto por puente directo TCP/Serial (Puerto 4000, <15 ms) como por HTTP Polling local
 *     (host.wokwi.internal:3000 y 10.0.2.2:3000) y API de Mercado Pago.
 *  3. Al comprar un producto o combo en la página web:
 *     - Identifica la casilla comprada (ej: A1, A2, B3, A1-A2, etc.) y el monto recibido.
 *     - Enciende en la matriz industrial de 36 LEDs (6x6) el LED exacto del producto.
 *     - Enciende el relevador (Pin 18) que activa el motor de espiral.
 *     - Muestra el estado en la pantalla LCD 1602 y la temperatura de la máquina.
 *     - PERMANECE ENCENDIDO hasta que presiones el botón verde "Sensor Caida (IR)".
 *     - Al presionar el botón, apaga el motor y queda listo para la siguiente venta.
 *  4. También admite comandos de prueba por Monitor Serie (ej: escribe "A1" y Enter).
 * =====================================================================================
 */

#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ArduinoJson.h>

// =====================================================================================
// 1. CONFIGURACIÓN DE RED WIFI (En Wokwi es Wokwi-GUEST sin contraseña)
// =====================================================================================
const char* WIFI_SSID     = "Wokwi-GUEST"; // En Wokwi conectar a Wokwi-GUEST
const char* WIFI_PASSWORD = "";

// =====================================================================================
// 2. CREDENCIALES OFICIALES DE MERCADO PAGO DEVELOPERS MÉXICO Y SERVIDOR LOCAL
// =====================================================================================
String MP_ACCESS_TOKEN = "APP_USR-3941039051237299-101604-2a8ab49412b69fce450b8b8b189af1a7-141474351";
String SERVER_URL = "http://host.wokwi.internal:3000";

// =====================================================================================
// 3. ASIGNACIÓN DE PINES HARDWARE DEL ESP32 (COINCIDENTE CON diagram.json)
// =====================================================================================
#define PIN_SDA         21  // I2C LCD
#define PIN_SCL         22  // I2C LCD
#define PIN_DROP_SENSOR 4   // Sensor Infrarrojo de Caída (Botón verde en Wokwi)
#define PIN_ONEWIRE     5   // Sensor de Temperatura DS18B20
#define PIN_RELAY       18  // Módulo Relevador (Activa motor de espiral)
#define PIN_COMPRESOR   2   // Relé de Potencia 30A Compresor de Refrigeración (Cámara Fría)

// --- MATRIZ INDUSTRIAL DE 36 MOTORES (6 FILAS x 6 COLUMNAS) ---
// 6 Filas (Cátodos 'C'):
#define PIN_FILA_A      13
#define PIN_FILA_B      12
#define PIN_FILA_C      14
#define PIN_FILA_D      27
#define PIN_FILA_E      26
#define PIN_FILA_F      25

// 6 Columnas (Ánodos 'A'):
#define PIN_COL_1       33
#define PIN_COL_2       32
#define PIN_COL_3       23
#define PIN_COL_4       19
#define PIN_COL_5       17
#define PIN_COL_6       16

const int FILAS[6]    = {PIN_FILA_A, PIN_FILA_B, PIN_FILA_C, PIN_FILA_D, PIN_FILA_E, PIN_FILA_F};
const int COLUMNAS[6] = {PIN_COL_1, PIN_COL_2, PIN_COL_3, PIN_COL_4, PIN_COL_5, PIN_COL_6};

// Dispositivos I2C y Sensores
LiquidCrystal_I2C lcd(0x27, 16, 2);
OneWire oneWire(PIN_ONEWIRE);
DallasTemperature sensorTemp(&oneWire);

// Variables de Control
String ultimoPaymentIdProcesado = "";
String ultimoCmdIdProcesado     = "";
unsigned long ultimaConsultaMpMs = 0;
const unsigned long INTERVALO_POLLING_MP = 3500; // Consulta MP cada 3.5 segundos
float temperaturaActual = 2.8;
unsigned long ultimoLecturaTempMs = 0;

// Declaraciones anticipadas de funciones
void actualizarPantallaReposo();
void leerTemperatura();
void apagarMatriz();
void encenderSlot(int fila, int col);
void encenderSlotCompuesto(String slot);
bool parsearSlot(String slot, int &fila, int &col);
void ejecutarDispensado(String slot, float monto, String paymentId);
void consultarMercadoPago();
void consultarServidorKiosco();
void procesarComandoServidor(String payload);

// =====================================================================================
// 4. CONTROL DE LA MATRIZ DE 36 MOTORES (LEDS)
// =====================================================================================
void apagarMatriz() {
    for (int f = 0; f < 6; f++) {
        digitalWrite(FILAS[f], HIGH); // Nivel ALTO en cátodo = apagado
    }
    for (int c = 0; c < 6; c++) {
        digitalWrite(COLUMNAS[c], LOW); // Nivel BAJO en ánodo = apagado
    }
}

void encenderSlot(int fila, int col) {
    apagarMatriz();
    if (fila >= 0 && fila < 6 && col >= 0 && col < 6) {
        digitalWrite(FILAS[fila], LOW);       // Cátodo a GND (0V)
        digitalWrite(COLUMNAS[col], HIGH);    // Ánodo a 3.3V -> ENCIENDE
    }
}

// Enciende la casilla simple (ej: A1) o combo / canal doble (ej: A1-A2 o A1+A2) en la matriz
void encenderSlotCompuesto(String slot) {
    apagarMatriz();
    slot.trim();
    slot.toUpperCase();
    if (slot.startsWith("M-")) slot = slot.substring(2);

    int guionIdx = slot.indexOf('-');
    if (guionIdx < 0) guionIdx = slot.indexOf('+');
    if (guionIdx > 0) {
        String s1 = slot.substring(0, guionIdx);
        String s2 = slot.substring(guionIdx + 1);
        int f1 = -1, c1 = -1, f2 = -1, c2 = -1;
        parsearSlot(s1, f1, c1);
        parsearSlot(s2, f2, c2);

        if (f1 >= 0 && f1 < 6 && c1 >= 0 && c1 < 6) {
            digitalWrite(FILAS[f1], LOW);
            digitalWrite(COLUMNAS[c1], HIGH);
        }
        if (f2 >= 0 && f2 < 6 && c2 >= 0 && c2 < 6) {
            digitalWrite(FILAS[f2], LOW);
            digitalWrite(COLUMNAS[c2], HIGH);
        }
    } else {
        int f = -1, c = -1;
        if (parsearSlot(slot, f, c)) {
            encenderSlot(f, c);
        }
    }
}

// Convierte código de casilla ("A1", "B4", "A1-A2", "M-C3", "XPEN_SLOT_D5") a (fila, columna)
bool parsearSlot(String slot, int &fila, int &col) {
    slot.trim();
    slot.toUpperCase();
    
    // Limpieza de prefijos comunes
    if (slot.startsWith("M-")) slot = slot.substring(2);
    if (slot.startsWith("SLOT_")) slot = slot.substring(5);
    if (slot.startsWith("SLOT-")) slot = slot.substring(5);
    if (slot.startsWith("XPEN_")) {
        int idx = slot.indexOf('_', 5);
        if (idx > 5) slot = slot.substring(5, idx);
        else slot = slot.substring(5);
        if (slot.startsWith("SLOT")) slot = slot.substring(4);
    }
    slot.trim();
    if (slot.length() < 2) return false;

    char f = slot.charAt(0);
    char c = slot.charAt(1);

    if (f >= 'A' && f <= 'F' && c >= '1' && c <= '6') {
        fila = f - 'A';
        col  = c - '1';
        return true;
    }
    return false;
}

// =====================================================================================
// 5. SECUENCIA REAL DE DISPENSADO CON SENSOR INFRARROJO DE CAÍDA
// =====================================================================================

// Espera la caída de un producto individual (motor activo, permanece encendido hasta que se presione el botón)
void esperarCaidaProducto(String etiquetaSlot, String tipoProducto) {
    int fila = -1, col = -1;
    if (!parsearSlot(etiquetaSlot, fila, col)) {
        fila = 0; col = 0;
    }

    // 1. Encender ÚNICAMENTE el LED de este producto y el relevador del motor
    apagarMatriz();
    encenderSlot(fila, col);
    digitalWrite(PIN_RELAY, HIGH); // Relevador activo (Motor girando)

    Serial.printf("\n>>> [DISPENSANDO %s] Casilla M-%s activa. Motor girando (Pin 18 = HIGH)...\n", tipoProducto.c_str(), etiquetaSlot.c_str());
    Serial.println(">>> Haz clic en el botón verde 'Sensor Caida (IR)' en Wokwi para simular la caída...");

    // 2. Bucle de espera: permanece encendido hasta que se presione el botón del sensor IR
    while (digitalRead(PIN_DROP_SENSOR) == HIGH) {
        encenderSlot(fila, col); // Mantener energizado el LED exacto
        delay(30);

        // Soporte alternativo por Monitor Serie
        if (Serial.available()) {
            String s = Serial.readStringUntil('\n');
            s.trim();
            if (s.equalsIgnoreCase("DROP") || s.length() == 0) {
                break;
            }
        }
    }

    // 3. APAGADO INMEDIATO DE ESTE MOTOR Y SU LED (NINGÚN MOTOR ACTIVO)
    digitalWrite(PIN_RELAY, LOW);
    apagarMatriz();
    delay(150); // Antirrebote mecánico

    Serial.printf("   [SENSOR IR] ¡Botón presionado! %s detectada en bandeja. Motor M-%s APAGADO.\n", tipoProducto.c_str(), etiquetaSlot.c_str());

    // Esperar a que el usuario suelte el botón para que no se dispare en falso el siguiente paso
    while (digitalRead(PIN_DROP_SENSOR) == LOW) {
        delay(20);
    }
    delay(150);
}

void ejecutarDispensado(String slot, float monto, String paymentId) {
    slot.trim();
    slot.toUpperCase();
    if (slot.startsWith("M-")) slot = slot.substring(2);

    Serial.println("\n*******************************************************");
    Serial.printf("⚡ [DISPENSADO EXPENDEX] ¡ORDEN CONFIRMADA!\n");
    Serial.printf("   ID Transacción: #%s\n", paymentId.c_str());
    Serial.printf("   Monto         : $%.2f MXN\n", monto);
    Serial.printf("   Casilla(s)    : %s\n", slot.c_str());
    Serial.println("*******************************************************\n");

    // Paso 1: Notificar en LCD
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("PAGO CONFIRMADO!");
    lcd.setCursor(0, 1);
    lcd.printf("$%.2f #%s", monto, paymentId.substring(0, 6).c_str());
    delay(900);

    // Verificar si es un COMBO (Comida + Bebida con guión o suma)
    int sepIdx = slot.indexOf('-');
    if (sepIdx < 0) sepIdx = slot.indexOf('+');

    if (sepIdx > 0) {
        // ES UN COMBO: DISPENSADO SECUENCIAL ESTRICTO
        // 1. Primero cae la comida (Columna 1 o 6)
        // 2. El usuario presiona el botón IR -> Se apaga el motor de comida
        // 3. Luego cae la bebida (Columnas 2 a 5)
        // 4. El usuario presiona el botón IR -> Se apaga todo y ningún motor queda activo
        String slotComida = slot.substring(0, sepIdx);
        String slotBebida = slot.substring(sepIdx + 1);
        slotComida.trim();
        slotBebida.trim();
        if (slotComida.startsWith("M-")) slotComida = slotComida.substring(2);
        if (slotBebida.startsWith("M-")) slotBebida = slotBebida.substring(2);

        Serial.println("\n=======================================================");
        Serial.printf("🍱 [COMBO SECUENCIAL] Paso 1: COMIDA (%s) -> Paso 2: BEBIDA (%s)\n", slotComida.c_str(), slotBebida.c_str());
        Serial.println("   (Nunca se activan dos motores simultáneamente)");
        Serial.println("=======================================================\n");

        // --- PASO 1/2: DISPENSAR COMIDA ---
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.printf("[1/2] COMIDA %s", slotComida.c_str());
        lcd.setCursor(0, 1);
        lcd.print("PULSA BOTON IR..");

        esperarCaidaProducto(slotComida, "COMIDA");

        // Transición en LCD
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("COMIDA ENTREGADA");
        lcd.setCursor(0, 1);
        lcd.printf("SIGUE BEBIDA %s", slotBebida.c_str());
        delay(1000);

        // --- PASO 2/2: DISPENSAR BEBIDA ---
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.printf("[2/2] BEBIDA %s", slotBebida.c_str());
        lcd.setCursor(0, 1);
        lcd.print("PULSA BOTON IR..");

        esperarCaidaProducto(slotBebida, "BEBIDA");

        // Finalización exitosa del combo: Ningún motor activo
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("COMBO COMPLETO!");
        lcd.setCursor(0, 1);
        lcd.print("Buen provecho! :)");
        Serial.printf("STATUS:OK_DELIVERED_COMBO:%s\n", slot.c_str());
        delay(2000);

    } else {
        // ES UN PRODUCTO INDIVIDUAL (SOLO COMIDA O SOLO BEBIDA)
        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.printf("DISPENSANDO %s", slot.c_str());
        lcd.setCursor(0, 1);
        lcd.print("PULSA BOTON IR..");

        esperarCaidaProducto(slot, "PRODUCTO");

        lcd.clear();
        lcd.setCursor(0, 0);
        lcd.print("RETIRE SU ORDEN");
        lcd.setCursor(0, 1);
        lcd.print("Buen provecho! :)");
        Serial.printf("STATUS:OK_DELIVERED:%s\n", slot.c_str());
        delay(2000);
    }

    // Volver a estado de reposo
    actualizarPantallaReposo();
}

// =====================================================================================
// 5.1 CONSULTA AL SERVIDOR KIOSCO (TARJETA / GOOGLE PAY / APPLE PAY / SALDO / WEB)
// =====================================================================================
unsigned long ultimaConsultaServidorMs = 0;
const unsigned long INTERVALO_POLLING_SERVER = 450; // Consulta rápida cada 450 ms

void procesarComandoServidor(String payload) {
    if (payload.length() < 10) return;
    JsonDocument doc;
    DeserializationError err = deserializeJson(doc, payload);
    if (!err && doc["pending"] == true) {
        String slot   = doc["slot"].as<String>();
        float monto   = doc["amount"].as<float>();
        String id     = doc["id"].as<String>();
        String nombre = doc["name"].as<String>();

        if (id.length() > 0 && id == ultimoCmdIdProcesado) {
            return; // Evita duplicado si llegó simultáneamente por Serial TCP y HTTP
        }
        if (id.length() > 0) {
            ultimoCmdIdProcesado = id;
        }

        Serial.println("\n*******************************************************");
        Serial.printf("💳 [DISPENSADO KIOSCO WEB] ¡Orden Digital Recibida! #%s\n", id.c_str());
        Serial.printf("   Producto: %s ($%.2f MXN)\n", nombre.c_str(), monto);
        Serial.printf("   Casilla : %s\n", slot.c_str());
        Serial.println("*******************************************************\n");

        ejecutarDispensado(slot, monto, id);
    }
}

void consultarServidorKiosco() {
    if (WiFi.status() != WL_CONNECTED) return;

    // 1. Vía Directa Host Wokwi VS Code (host.wokwi.internal:3000)
    {
        WiFiClient client;
        HTTPClient http;
        http.setTimeout(250);
        if (http.begin(client, "http://host.wokwi.internal:3000/api/esp32/pendientes")) {
            int code = http.GET();
            if (code == 200) {
                String payload = http.getString();
                http.end();
                procesarComandoServidor(payload);
                return;
            }
            http.end();
        }
    }

    // 2. Respaldo vía Gateway Local en Wokwi (10.0.2.2:3000)
    {
        WiFiClient client;
        HTTPClient http;
        http.setTimeout(250);
        if (http.begin(client, "http://10.0.2.2:3000/api/esp32/pendientes")) {
            int code = http.GET();
            if (code == 200) {
                String payload = http.getString();
                http.end();
                procesarComandoServidor(payload);
                return;
            }
            http.end();
        }
    }

    // 3. Si el usuario configuró una URL externa (ej. túnel Cloudflare)
    if (SERVER_URL.length() > 8 && !SERVER_URL.startsWith("http://host.wokwi.internal")) {
        String urlPendientes = SERVER_URL + "/api/esp32/pendientes";
        if (SERVER_URL.startsWith("https://")) {
            WiFiClientSecure secureClient;
            secureClient.setInsecure();
            HTTPClient https;
            https.setTimeout(800);
            if (https.begin(secureClient, urlPendientes)) {
                int code = https.GET();
                if (code == 200) {
                    String payload = https.getString();
                    https.end();
                    procesarComandoServidor(payload);
                    return;
                }
                https.end();
            }
        }
    }
}

// =====================================================================================
// 6. CONSULTA A LA API DE MERCADO PAGO (HTTPS POLLING EN WOKWI / WIFI)
// =====================================================================================
void consultarMercadoPago() {
    if (WiFi.status() != WL_CONNECTED) return;
    if (MP_ACCESS_TOKEN.length() < 20) return;

    WiFiClientSecure client;
    client.setInsecure(); // Permite HTTPS sin validar certificados raíz

    HTTPClient https;
    https.setTimeout(1200);
    String url = "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&limit=1";

    if (https.begin(client, url)) {
        https.addHeader("Authorization", "Bearer " + MP_ACCESS_TOKEN);
        https.addHeader("Content-Type", "application/json");

        int httpCode = https.GET();
        if (httpCode == HTTP_CODE_OK) {
            String payload = https.getString();
            JsonDocument doc;
            DeserializationError err = deserializeJson(doc, payload);

            if (!err && doc["results"].size() > 0) {
                JsonObject pago = doc["results"][0];
                String id      = String((long)pago["id"]);
                String status  = pago["status"].as<String>();
                float monto    = pago["transaction_amount"].as<float>();
                String extRef  = pago["external_reference"].as<String>();

                if (extRef == "" || extRef == "null") {
                    extRef = "A1";
                }

                if (status == "approved" && id != ultimoPaymentIdProcesado) {
                    if (ultimoPaymentIdProcesado != "") {
                        ejecutarDispensado(extRef, monto, id);
                    }
                    ultimoPaymentIdProcesado = id;
                }
            }
        }
        https.end();
    }
}

// =====================================================================================
// 7. PANTALLA EN MODO DE ESPERA Y TELEMETRÍA DE TEMPERATURA
// =====================================================================================
void actualizarPantallaReposo() {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.printf("ExpendeX  %.1f%cC", temperaturaActual, 223);
    lcd.setCursor(0, 1);
    lcd.print("LISTO P/ COMPRA");
}

void leerTemperatura() {
    sensorTemp.requestTemperatures();
    float t = sensorTemp.getTempCByIndex(0);
    if (t > -50 && t < 70) {
        temperaturaActual = t;
    }
    // Control Automático de Termostato con Histéresis para Compresor
    if (temperaturaActual >= 5.5) {
        digitalWrite(PIN_COMPRESOR, HIGH); // Encender Compresor
    } else if (temperaturaActual <= 3.0) {
        digitalWrite(PIN_COMPRESOR, LOW);  // Apagar Compresor (Frío alcanzado)
    }
}

// =====================================================================================
// 8. SETUP Y LOOP PRINCIPAL
// =====================================================================================
void setup() {
    Serial.begin(115200);
    delay(300);

    Serial.println("\n=======================================================");
    Serial.println("  ExpendeX® — VENDING MACHINE INDUSTRIAL ESP32 (MATRIZ 6x6)");
    Serial.println("  Sincronización en Vivo con Página Web + Mercado Pago");
    Serial.println("=======================================================");

    // Inicializar pines de Filas y Columnas (36 LEDs: M-A1 a M-F6)
    for (int f = 0; f < 6; f++) {
        pinMode(FILAS[f], OUTPUT);
    }
    for (int c = 0; c < 6; c++) {
        pinMode(COLUMNAS[c], OUTPUT);
    }
    apagarMatriz();

    // Periféricos
    pinMode(PIN_RELAY, OUTPUT);
    digitalWrite(PIN_RELAY, LOW);

    pinMode(PIN_COMPRESOR, OUTPUT);
    digitalWrite(PIN_COMPRESOR, LOW);

    pinMode(PIN_DROP_SENSOR, INPUT_PULLUP);

    // Pantalla LCD
    Wire.begin(PIN_SDA, PIN_SCL);
    lcd.init();
    lcd.backlight();
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("INICIANDO...");
    lcd.setCursor(0, 1);
    lcd.print("ExpendeX 6x6 IoT");

    // Sensor de temperatura
    sensorTemp.begin();
    leerTemperatura();

    // Conexión WiFi
    Serial.printf("[WIFI] Conectando a %s...\n", WIFI_SSID);
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

    int intentos = 0;
    while (WiFi.status() != WL_CONNECTED && intentos < 12) {
        delay(250);
        Serial.print(".");
        intentos++;
    }

    if (WiFi.status() == WL_CONNECTED) {
        Serial.printf("\n[WIFI] ¡Conectado con éxito! IP: %s\n", WiFi.localIP().toString().c_str());
        Serial.println("[SYNC] Enlazado con Página Web Quiosco (http://localhost:3000) y Mercado Pago.");
    } else {
        Serial.println("\n[SYNC] Modo Serial RFC2217 / Simulación Directa activo.");
    }

    actualizarPantallaReposo();
    Serial.println("\n💡 LISTO: Compra cualquier producto en la Página Web o escribe 'A1'..'F6' aquí.");
}

void loop() {
    // 1. Recepción instantánea por Serial / Puente TCP Puerto 4000 (desde server.js o consola)
    if (Serial.available()) {
        String cmd = Serial.readStringUntil('\n');
        cmd.trim();
        if (cmd.length() > 0) {
            if (cmd.startsWith("CMD_JSON:")) {
                String jsonPart = cmd.substring(9);
                jsonPart.trim();
                procesarComandoServidor(jsonPart);
            } else if (cmd.startsWith("{") && cmd.indexOf("\"pending\"") > 0) {
                procesarComandoServidor(cmd);
            } else if (cmd.startsWith("TOKEN:")) {
                MP_ACCESS_TOKEN = cmd.substring(6);
                MP_ACCESS_TOKEN.trim();
                Serial.printf("\n[CONFIG] Nuevo Mercado Pago Access Token configurado.\n");
            } else if (cmd.startsWith("URL:")) {
                SERVER_URL = cmd.substring(4);
                SERVER_URL.trim();
                Serial.printf("\n[CONFIG] Nueva URL Servidor Kiosco: %s\n", SERVER_URL.c_str());
            } else if (cmd.equalsIgnoreCase("STATUS")) {
                Serial.printf("[ESTADO] WiFi: %s | Temp: %.1f °C | Servidor: %s | Ultimo ID: %s\n", 
                    (WiFi.status() == WL_CONNECTED ? "ONLINE" : "OFFLINE"), 
                    temperaturaActual,
                    SERVER_URL.c_str(),
                    ultimoCmdIdProcesado.c_str());
            } else {
                int f, c;
                if (parsearSlot(cmd, f, c) || cmd.indexOf('-') > 0 || cmd.indexOf('+') > 0) {
                    Serial.printf("[SERIAL DIRECT] Dispensando casilla %s...\n", cmd.c_str());
                    ejecutarDispensado(cmd, 85.00, "WEB-" + String(millis() % 100000));
                }
            }
        }
    }

    // 2. Monitoreo de comandos de dispensado en cola desde Página Web (Tarjeta / Saldo / Wallets)
    if (millis() - ultimaConsultaServidorMs >= INTERVALO_POLLING_SERVER) {
        ultimaConsultaServidorMs = millis();
        consultarServidorKiosco();
    }

    // 3. Monitoreo periódico de pagos directos en Mercado Pago
    if (millis() - ultimaConsultaMpMs >= INTERVALO_POLLING_MP) {
        ultimaConsultaMpMs = millis();
        consultarMercadoPago();
    }

    // 4. Monitoreo de temperatura cada 10 segundos
    if (millis() - ultimoLecturaTempMs >= 10000) {
        ultimoLecturaTempMs = millis();
        leerTemperatura();
        actualizarPantallaReposo();
    }
}
