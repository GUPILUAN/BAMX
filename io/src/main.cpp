#include <WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_MAX31865.h>
#include <time.h>
#include <WiFiClientSecure.h>

// --- CONFIGURACIÓN ---
const char* ssid        = WIFI_SSID;
const char* password    = WIFI_PASSWORD;
const char* mqtt_server = MQTT_BROKER_URL;
const int   mqtt_port   = MQTT_PORT;
const char* mqtt_user   = MQTT_USERNAME;
const char* mqtt_pass   = MQTT_PASSWORD;
const int sensorID = 1;

WiFiClientSecure espClient;
PubSubClient client(espClient);

// --- CONFIGURACIÓN MAX31865 ---

#define RNOMINAL 100.0     // PT100 nominal 0°C
#define RREF 430.0         // Resistencia de referencia MAX31865
#define RTD_WIRES MAX31865_2WIRE

// Crear los pines del MAX31865
#define PIN_CS  27 // GPIO27 CS
#define PIN_MOSI 14 // GPIO14 SDI 
#define PIN_MISO 12 // GPIO12 SDO
#define PIN_SCK 13 // GPIO13 CLK
Adafruit_MAX31865 rtd = Adafruit_MAX31865(PIN_CS, PIN_MOSI, PIN_MISO, PIN_SCK);

// --- VARIABLES ---
double globalTemperatureC;
unsigned long lastMsg = 0;
char msg[100];  // buffer para JSON

// --- FUNCIONES WIFI ---
void setupWifi() {
    WiFi.begin(ssid, password);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED) {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
}

// --- FUNCIONES MQTT ---
void reconnect() {
    while (!client.connected()) {
        Serial.print("Connecting to MQTT...");
        String clientId = "ESP32SensorCliente-" + String(sensorID);
        espClient.setInsecure();  // Deshabilitar verificación de certificado
        if (client.connect(clientId.c_str(), mqtt_user, mqtt_pass)) {
            Serial.println("Connected to MQTT broker!");
        } else {
            Serial.print("failed, rc=");
            Serial.print(client.state());
            Serial.println(" trying again in 5s");
            delay(5000);
        }
    }
}

// --- FUNCIONES TEMPERATURA ---
float getTemperatureC() {
    uint16_t rtd_raw = rtd.readRTD();
    float ratio = rtd_raw / 32768.0;
    float resistance = RREF * ratio;
    float tempC = rtd.temperature(RNOMINAL, RREF);

    Serial.print("RTD raw value: "); Serial.println(rtd_raw);
    Serial.print("Ratio: "); Serial.println(ratio, 8);
    Serial.print("Resistance: "); Serial.println(resistance, 8);
    Serial.print("Temperature: "); Serial.println(tempC, 2);

    // Revisar fallos
    uint8_t fault = rtd.readFault();
    if (fault) {
        Serial.print("MAX31865 Fault: 0x"); Serial.println(fault, HEX);
        if (fault & MAX31865_FAULT_HIGHTHRESH) Serial.println(" - RTD High Threshold");
        if (fault & MAX31865_FAULT_LOWTHRESH)  Serial.println(" - RTD Low Threshold");
        if (fault & MAX31865_FAULT_REFINLOW)   Serial.println(" - REFIN- < 0.85 x Bias");
        if (fault & MAX31865_FAULT_REFINHIGH)  Serial.println(" - REFIN- > 0.85 x Bias");
        if (fault & MAX31865_FAULT_RTDINLOW)   Serial.println(" - RTDIN- < 0.85 x Bias");
        if (fault & MAX31865_FAULT_OVUV)       Serial.println(" - Under/Over voltage");
        rtd.clearFault();
    }

    return tempC;
}

// --- SETUP ---
void setup() {
    Serial.begin(115200);
    pinMode(LED_BUILTIN, OUTPUT);

    setupWifi();

    if (!rtd.begin(RTD_WIRES)) {
        Serial.println("Failed to initialize MAX31865. Check wiring!");
        while (1) delay(10);
    }

    rtd.enable50Hz(false); // 60Hz
    client.setServer(mqtt_server, mqtt_port);
}

// --- LOOP ---
void loop() {
    if (!client.connected()) reconnect();
    client.loop();

    unsigned long now = millis();
    if (now - lastMsg > 5000) { 
        lastMsg = now;

        globalTemperatureC = getTemperatureC();

        // Crear JSON con 2 decimales
        snprintf(msg, sizeof(msg), "{\"sensor_id\" : %d, \"temperature\": %.2f}", sensorID, globalTemperatureC);

        // Tópico dinámico
        String topic = "bamx/sensors/temperature";

        Serial.print("Publishing to topic: ");
        Serial.println(topic);
        Serial.print("Message: ");
        Serial.println(msg);

        client.publish(topic.c_str(), msg);

        // LED indicador de envío
        digitalWrite(LED_BUILTIN, LOW);
        delay(200);
        digitalWrite(LED_BUILTIN, HIGH);
    }
}
