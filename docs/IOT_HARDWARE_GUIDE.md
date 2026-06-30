# Panduan Hardware IoT — Auto-Feeder & Water Quality Sensor (ESP32)

> **PondFlow Hardware Documentation v2.0**  
> Diperbarui: Juni 2026 | Platform: ESP32-WROOM-32  
> Dokumen ini mencakup dua perangkat prototype skala kecil untuk 1 kolam.

---

## 📑 Daftar Isi

1. [Gambaran Sistem](#1-gambaran-sistem)
2. [Perangkat 1 — Auto-Feeder](#2-perangkat-1--auto-feeder)
3. [Perangkat 2 — Water Quality Sensor Station](#3-perangkat-2--water-quality-sensor-station)
4. [Ringkasan Biaya](#4-ringkasan-biaya)
5. [Panduan Kalibrasi Sensor](#5-panduan-kalibrasi-sensor)
6. [Integrasi dengan PondFlow API](#6-integrasi-dengan-pondflow-api)
7. [Tips Deployment Lapangan](#7-tips-deployment-lapangan)

---

## 1. Gambaran Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                       KOLAM BUDIDAYA                        │
│                                                             │
│   ┌──────────────┐              ┌──────────────────────┐   │
│   │  AUTO-FEEDER │              │  WATER QUALITY       │   │
│   │  ESP32       │              │  SENSOR STATION      │   │
│   │              │              │  ESP32               │   │
│   │  • Servo     │              │  • DS18B20 (suhu)    │   │
│   │  • Motor DC  │              │  • pH 4502C          │   │
│   │  • Hopper    │              │  • DO Sensor         │   │
│   │  • HC-SR04   │              │  • TDS/Salinitas     │   │
│   └──────┬───────┘              │  • MQ-135 (NH3)      │   │
│          │ WiFi                 │  • Ultrasonik Depth  │   │
└──────────┼─────────────────────-└──────────┬───────────┘   │
           │                                 │ WiFi           │
           ▼                                 ▼               │
    ┌──────────────────────────────────────────────────┐
    │              SUPABASE (Backend)                  │
    │                                                  │
    │  iot_devices          water_quality_readings     │
    │  iot_feeding_schedules iot_sensor_devices        │
    └──────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  PondFlow App   │
                    │  Dashboard IoT  │
                    │  AI Prediction  │
                    └─────────────────┘
```

---

## 2. Perangkat 1 — Auto-Feeder

Melontar pakan ke kolam secara otomatis berdasarkan jadwal atau perintah manual dari dashboard PondFlow.

### 2.1 Bill of Materials (BOM)

| # | Komponen | Spesifikasi | Qty | Estimasi Harga |
|---|----------|-------------|:---:|---------------:|
| 1 | **ESP32 DevKit V1** | ESP32-WROOM-32, 38-pin, 240MHz dual-core | 1 | Rp 45.000 |
| 2 | **Servo Motor** | MG995 / MG996R — torsi 9–11 kg·cm, 5V | 1 | Rp 35.000 |
| 3 | **Motor DC + Driver** | Motor DC 12V + L298N Dual H-Bridge | 1 set | Rp 30.000 |
| 4 | **Ultrasonik HC-SR04** | Deteksi level pakan di tabung (hopper %), 2–400cm | 1 | Rp 8.000 |
| 5 | **Baterai LiPo 18650** | 2× 18650 3.7V 3000mAh + holder seri | 1 set | Rp 30.000 |
| 6 | **Modul Charger TP4056** | Micro-USB charger + protection board | 1 | Rp 8.000 |
| 7 | **Boost Converter XL6009** | Step-up 3.7–5V → 5V stabil untuk servo | 1 | Rp 12.000 |
| 8 | **Tabung Hopper** | PVC pipe 4" + end cap, atau ember plastik 5L | 1 | Rp 25.000 |
| 9 | **Casing Waterproof IP65** | Box ABS 15×10×7cm | 1 | Rp 30.000 |
| 10 | **LED + Resistor + Kapasitor** | Indikator status + filtering power | 1 set | Rp 10.000 |
| 11 | **Kabel Jumper + PCB Stripboard** | Wiring internal | 1 set | Rp 12.000 |
| | | | **Total** | **±Rp 245.000** |

### 2.2 Wiring / Pin Mapping

```
ESP32 Pin   Fungsi            Terhubung ke
─────────────────────────────────────────────────────
GPIO 18  →  Servo Signal   → MG995 (kabel oranye)
GPIO 19  →  L298N IN1      → Motor DC arah 1
GPIO 21  →  L298N IN2      → Motor DC arah 2
GPIO 22  →  L298N ENA      → PWM kecepatan motor
GPIO 23  →  HC-SR04 TRIG   → Trigger ultrasonik
GPIO 25  →  HC-SR04 ECHO   → Echo ultrasonik
GPIO 2   →  LED Indikator  → Resistor 220Ω → GND

3.3V     →  HC-SR04 VCC
5V       →  Servo VCC (dari boost converter)
5V       →  L298N VCC Logic
GND      →  Semua GND (common ground)
```

### 2.3 Diagram Alur Firmware

```
BOOT
  │
  ▼
Konek WiFi ──(gagal)──► Deep Sleep 30s → Retry
  │
  ▼
Subscribe Supabase Realtime
channel: "public:iot_devices"
filter:  device_code = "FDR-001"
  │
  ├── Event: status = "feeding"
  │     │
  │     ▼
  │   Aktifkan servo/motor DC
  │   Durasi ∝ amount_grams / flow_rate
  │     │
  │     ▼
  │   Baca HC-SR04 → hitung hopper_level %
  │     │
  │     ▼
  │   PATCH iot_devices: status="online", hopper_level=N
  │
  └── Timer setiap 5 menit:
        PATCH iot_devices: battery_level=N, last_ping=now()
```

### 2.4 Firmware Arduino (C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// ── Konfigurasi (isi sesuai setup lapangan) ─────────────────
const char* WIFI_SSID     = "WiFi_Tambak";
const char* WIFI_PASS     = "password";
const char* SUPABASE_URL  = "https://<PROJECT>.supabase.co";
const char* SUPABASE_KEY  = "<ANON_KEY>";
const char* DEVICE_CODE   = "FDR-001";
const char* POND_ID       = "<pond-uuid>";

// ── Pin definitions ──────────────────────────────────────────
#define PIN_SERVO    18
#define PIN_MOTOR_1  19
#define PIN_MOTOR_2  21
#define PIN_MOTOR_EN 22
#define PIN_TRIG     23
#define PIN_ECHO     25
#define PIN_LED       2

// ── Baca level hopper via ultrasonik ────────────────────────
int readHopperLevel() {
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  float distanceCm = duration * 0.034 / 2.0;

  // Jarak 5cm = penuh (100%), jarak 40cm = kosong (0%)
  int level = map((int)distanceCm, 40, 5, 0, 100);
  return constrain(level, 0, 100);
}

// ── Lontar pakan ─────────────────────────────────────────────
void dispense(int grams) {
  int durationMs = (grams / 50) * 1000; // 50g/detik

  // Aktifkan motor DC
  digitalWrite(PIN_MOTOR_1, HIGH);
  digitalWrite(PIN_MOTOR_2, LOW);
  analogWrite(PIN_MOTOR_EN, 200); // PWM 0-255
  delay(durationMs);

  // Stop motor
  analogWrite(PIN_MOTOR_EN, 0);
  digitalWrite(PIN_MOTOR_1, LOW);
}

// ── Kirim telemetry ke Supabase ──────────────────────────────
void sendTelemetry(const char* status, int battery, int hopper) {
  HTTPClient http;
  String url = String(SUPABASE_URL) +
               "/rest/v1/iot_devices?device_code=eq." + DEVICE_CODE;

  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_KEY);
  http.addHeader("Authorization", String("Bearer ") + SUPABASE_KEY);

  StaticJsonDocument<128> doc;
  doc["status"]        = status;
  doc["battery_level"] = battery;
  doc["hopper_level"]  = hopper;
  doc["last_ping"]     = "now()";

  String body;
  serializeJson(doc, body);
  http.PATCH(body);
  http.end();
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_MOTOR_1, OUTPUT);
  pinMode(PIN_MOTOR_2, OUTPUT);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  while (WiFi.status() != WL_CONNECTED) delay(500);
  digitalWrite(PIN_LED, HIGH); // LED nyala = WiFi OK
}

void loop() {
  // Cek perintah dari Supabase (polling sederhana)
  // TODO: Ganti dengan WebSocket Supabase Realtime untuk efisiensi lebih baik
  int hopper  = readHopperLevel();
  int battery = 85; // TODO: baca dari voltage divider ADC

  // Simulasi cek perintah dispense
  // (implementasi WebSocket lebih baik, tapi polling cukup untuk prototype)
  sendTelemetry("online", battery, hopper);
  delay(300000); // 5 menit
}
```

---

## 3. Perangkat 2 — Water Quality Sensor Station

Mengukur 6 parameter kualitas air secara otomatis dan mengirim ke endpoint PondFlow.

### 3.1 Bill of Materials (BOM)

| # | Komponen | Parameter | Spesifikasi | Qty | Estimasi Harga |
|---|----------|-----------|-------------|:---:|---------------:|
| 1 | **ESP32 DevKit V1** | — | ESP32-WROOM-32, 38-pin | 1 | Rp 45.000 |
| 2 | **DS18B20 Waterproof** | 🌡️ Suhu (°C) | Rentang -55~+125°C, akurasi ±0.5°C, OneWire | 1 | Rp 25.000 |
| 3 | **Modul pH 4502C + probe** | 🧪 pH (0–14) | Analog output 0–3.3V, rentang pH 0–14 | 1 | Rp 85.000 |
| 4 | **DFRobot DO Sensor** | 💨 DO (ppm) | Gravity Analog DO, akurasi ±0.2mg/L | 1 | Rp 450.000 |
| 5 | **TDS Sensor Module** | 🧂 Salinitas (ppt) | Analog TDS, konversi ke salinitas via rumus | 1 | Rp 18.000 |
| 6 | **MQ-135 Gas Sensor** | ☠️ Amonia (ppm) | Deteksi NH3 tidak langsung, perlu kalibrasi | 1 | Rp 20.000 |
| 7 | **HY-SRF05 Ultrasonik** | 📏 Kedalaman (m) | Waterproof, rentang 2–450cm | 1 | Rp 45.000 |
| 8 | **ADS1115 ADC 16-bit** | — | Resolusi 16-bit via I²C, 4 channel | 1 | Rp 25.000 |
| 9 | **RTC DS3231** | — | Real-time clock presisi ±2ppm, I²C | 1 | Rp 20.000 |
| 10 | **Baterai 2× 18650** | — | 7.4V 3000mAh + holder | 1 set | Rp 35.000 |
| 11 | **Solar Panel 6V/1W** | — | 80×60mm, untuk charging outdoor | 1 | Rp 30.000 |
| 12 | **TP4056 + Boost 5V** | — | Charger + regulator | 1 set | Rp 20.000 |
| 13 | **Casing Waterproof IP67** | — | Box ABS 20×15×10cm | 1 | Rp 45.000 |
| 14 | **Konektor Aviation GX16** | — | Tahan air untuk kabel sensor ke box | 4 | Rp 30.000 |
| 15 | **Resistor + misc** | — | Pull-up, filtering | 1 set | Rp 10.000 |
| | | | | **Total** | **±Rp 903.000** |

> 💡 **Alternatif hemat DO sensor**: Sensor DO dari AliExpress ±Rp 150.000  
> (akurasi lebih rendah ±0.5mg/L, cukup untuk monitoring kasar)

### 3.2 Wiring / Pin Mapping

```
ESP32 Pin   Fungsi              Terhubung ke
────────────────────────────────────────────────────────────────
GPIO 4   →  OneWire Data     → DS18B20 DATA (+ 4.7kΩ pull-up ke 3.3V)

GPIO 21  →  I²C SDA          → ADS1115 SDA, DS3231 SDA
GPIO 22  →  I²C SCL          → ADS1115 SCL, DS3231 SCL

ADS1115 A0 → pH Output       → Modul pH 4502C (pin "Po")
ADS1115 A1 → DO Output       → DFRobot DO sensor (pin analog)
ADS1115 A2 → TDS Output      → TDS Sensor Module (analog out)
ADS1115 A3 → MQ-135 Output   → MQ-135 (pin "A" analog)

GPIO 5   →  HY-SRF05 TRIG   → Ultrasonik trigger
GPIO 18  →  HY-SRF05 ECHO   → Ultrasonik echo
GPIO 2   →  LED Status       → Resistor 220Ω → GND

3.3V     →  DS18B20 VCC, ADS1115 VCC, DS3231 VCC
5V       →  pH Modul VCC, DO Sensor VCC, TDS VCC, MQ-135 VCC
GND      →  Semua GND (common ground wajib!)
```

### 3.3 Diagram Alur Firmware

```
BOOT
  │
  ▼
Init sensor (OneWire, I²C, ADS1115, RTC)
  │
  ▼
Konek WiFi ──(gagal)──► Simpan ke buffer SD/SPIFFS → Retry
  │
  ▼
Loop utama (setiap 5 menit):
  │
  ├─ Baca DS18B20    → temperature (°C)
  ├─ Baca ADS A0     → rawPH → kalibrasi → ph_level
  ├─ Baca ADS A1     → rawDO → kalibrasi → dissolved_oxygen (ppm)
  ├─ Baca ADS A2     → rawTDS → konversi → salinity (ppt)
  ├─ Baca ADS A3     → rawNH3 → kalibrasi → ammonia (ppm)
  ├─ Baca HY-SRF05   → jarak cm → water_depth (m)
  ├─ Baca ADC GPIO34 → voltage divider → battery_level (%)
  │
  ▼
POST /api/iot/telemetry
  Headers: X-Device-Code, X-Device-Secret
  Body: { temperature, ph_level, dissolved_oxygen,
          salinity, ammonia, water_depth, battery_level }
  │
  ├─ HTTP 200 ─► LED hijau 1 detik → Deep Sleep 5 menit
  └─ HTTP 4xx ─► LED merah blink → Log error → Retry 60s
```

### 3.4 Firmware Arduino (C++)

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>
#include <ADS1X15.h>
#include <RTClib.h>

// ── Konfigurasi ──────────────────────────────────────────────
const char* WIFI_SSID    = "WiFi_Tambak";
const char* WIFI_PASS    = "password";
const char* API_ENDPOINT = "https://pondflow.app/api/iot/telemetry";
const char* DEVICE_CODE  = "WQ-001";
const char* DEV_SECRET   = "<secret_dari_dashboard_pondflow>";

const int SLEEP_MINUTES  = 5;   // Interval pengiriman data

// ── Pin definitions ──────────────────────────────────────────
#define PIN_ONEWIRE   4
#define PIN_TRIG      5
#define PIN_ECHO     18
#define PIN_LED       2
#define PIN_BATTERY  34  // ADC untuk baca tegangan baterai

// ── Inisialisasi library ─────────────────────────────────────
OneWire          oneWire(PIN_ONEWIRE);
DallasTemperature tempSensor(&oneWire);
ADS1115          ads(0x48);  // I²C address ADS1115
RTC_DS3231       rtc;

// ── Konstanta kalibrasi (sesuaikan di lapangan) ──────────────
// pH: y = m * voltage + b (kalibrasi 2 titik)
const float PH_CAL_M = -5.70;
const float PH_CAL_B = 21.34;

// DO: mengikuti tabel saturasi berdasarkan suhu
// Salinitas: TDS (ppm) / 1000 * 0.64 (faktor TDS→salinitas)
const float TDS_TO_SALINITY = 0.00064;

// MQ-135 Amonia: estimasi kasar, perlu kalibrasi gas standar
const float NH3_SENSITIVITY = 0.04; // ppm per mV

// Kedalaman: tinggi box sensor dari dasar kolam (cm)
const float SENSOR_HEIGHT_CM = 200.0;

// ── Baca suhu air ─────────────────────────────────────────────
float readTemperature() {
  tempSensor.requestTemperatures();
  float t = tempSensor.getTempCByIndex(0);
  return (t == -127.0) ? NAN : t;
}

// ── Baca pH ──────────────────────────────────────────────────
float readPH() {
  int16_t raw = ads.readADC(0);
  float voltage = ads.toVoltage(raw);
  return PH_CAL_M * voltage + PH_CAL_B;
}

// ── Baca Dissolved Oxygen ────────────────────────────────────
float readDO(float tempC) {
  int16_t raw = ads.readADC(1);
  float voltage = ads.toVoltage(raw);
  // Rumus konversi DFRobot (dari datasheet, disesuaikan suhu)
  float doSaturation = 14.62 - 0.3898 * tempC + 0.006969 * tempC * tempC;
  float doPercent = voltage / 3.3;
  return doSaturation * doPercent;
}

// ── Baca Salinitas ───────────────────────────────────────────
float readSalinity() {
  int16_t raw = ads.readADC(2);
  float voltage = ads.toVoltage(raw);
  float tds_ppm = voltage * 1000.0; // Konversi kasar, kalibrasi manual
  return tds_ppm * TDS_TO_SALINITY;  // → ppt
}

// ── Baca Amonia ──────────────────────────────────────────────
float readAmmonia() {
  int16_t raw = ads.readADC(3);
  float voltage = ads.toVoltage(raw) * 1000.0; // → mV
  return max(0.0f, voltage * NH3_SENSITIVITY - 0.02f);
}

// ── Baca Kedalaman Air ───────────────────────────────────────
float readWaterDepth() {
  digitalWrite(PIN_TRIG, HIGH);
  delayMicroseconds(10);
  digitalWrite(PIN_TRIG, LOW);

  long duration = pulseIn(PIN_ECHO, HIGH, 30000);
  float distanceCm = duration * 0.034 / 2.0;
  float depthCm = SENSOR_HEIGHT_CM - distanceCm;
  return max(0.0f, depthCm / 100.0f); // → meter
}

// ── Baca Level Baterai ───────────────────────────────────────
float readBatteryLevel() {
  int raw = analogRead(PIN_BATTERY);
  float voltage = raw / 4095.0 * 3.3 * 2.0; // Voltage divider 1:1
  // 8.4V = 100%, 6.0V = 0% (2x18650 seri)
  return constrain((voltage - 6.0) / (8.4 - 6.0) * 100.0, 0, 100);
}

// ── Kirim data ke PondFlow API ───────────────────────────────
bool sendTelemetry(float temp, float ph, float doVal,
                   float sal, float nh3, float depth, float batt) {
  if (WiFi.status() != WL_CONNECTED) return false;

  HTTPClient http;
  http.begin(API_ENDPOINT);
  http.addHeader("Content-Type",   "application/json");
  http.addHeader("X-Device-Code",  DEVICE_CODE);
  http.addHeader("X-Device-Secret", DEV_SECRET);
  http.setTimeout(10000);

  StaticJsonDocument<256> doc;
  if (!isnan(temp))  doc["temperature"]       = round(temp * 10) / 10.0;
  if (!isnan(ph))    doc["ph_level"]          = round(ph * 100) / 100.0;
  if (!isnan(doVal)) doc["dissolved_oxygen"]  = round(doVal * 10) / 10.0;
  if (!isnan(sal))   doc["salinity"]          = round(sal * 1000) / 1000.0;
  if (!isnan(nh3))   doc["ammonia"]           = round(nh3 * 10000) / 10000.0;
  if (!isnan(depth)) doc["water_depth"]       = round(depth * 100) / 100.0;
  doc["battery_level"] = round(batt * 10) / 10.0;

  String body;
  serializeJson(doc, body);

  int code = http.POST(body);
  http.end();

  Serial.printf("[WQ] POST %s → HTTP %d\n", API_ENDPOINT, code);
  return (code == 200);
}

void setup() {
  Serial.begin(115200);
  pinMode(PIN_LED, OUTPUT);
  pinMode(PIN_TRIG, OUTPUT);
  pinMode(PIN_ECHO, INPUT);

  Wire.begin();
  tempSensor.begin();
  ads.begin();
  ads.setGain(0); // ±6.144V range untuk sensor analog 0-5V

  WiFi.begin(WIFI_SSID, WIFI_PASS);
  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 20) {
    delay(500);
    retry++;
  }
}

void loop() {
  digitalWrite(PIN_LED, HIGH);

  float temp  = readTemperature();
  float ph    = readPH();
  float doVal = readDO(isnan(temp) ? 28.0 : temp);
  float sal   = readSalinity();
  float nh3   = readAmmonia();
  float depth = readWaterDepth();
  float batt  = readBatteryLevel();

  bool ok = sendTelemetry(temp, ph, doVal, sal, nh3, depth, batt);

  digitalWrite(PIN_LED, LOW);

  if (ok) {
    // Sukses → deep sleep hemat daya
    esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_MINUTES * 60 * 1000000ULL);
    esp_deep_sleep_start();
  } else {
    // Gagal → coba lagi 60 detik kemudian
    delay(60000);
  }
}
```

---

## 4. Ringkasan Biaya

| Perangkat | Estimasi Biaya |
|-----------|:--------------:|
| Auto-Feeder (1 unit) | **Rp 245.000** |
| Water Quality Station (1 unit) | **Rp 903.000** |
| **Total 1 set / 1 kolam** | **± Rp 1.148.000** |

| Skala | Total Hardware |
|-------|:--------------:|
| 1 kolam (1 set) | ± Rp 1.150.000 |
| 5 kolam | ± Rp 5.750.000 |
| 10 kolam | ± Rp 11.500.000 |

> Biaya di atas belum termasuk:
> - Biaya fabrikasi PCB custom (opsional, ±Rp 200K/unit)
> - Frame / mounting hardware di tepi kolam (bambu/besi, ±Rp 50K/unit)
> - Buffer solution untuk kalibrasi pH & DO (±Rp 30K/set)

---

## 5. Panduan Kalibrasi Sensor

### 5.1 Kalibrasi Sensor pH

Diperlukan **2 buffer solution**: pH 4.0 dan pH 7.0 (tersedia di Tokopedia ±Rp 15.000/botol).

```
Prosedur:
1. Celupkan probe ke buffer pH 7.0 → tunggu 1 menit → catat tegangan (V7)
2. Cuci probe dengan air DI → celupkan ke buffer pH 4.0 → catat tegangan (V4)
3. Hitung:
   slope (m) = (7.0 - 4.0) / (V7 - V4)
   intercept (b) = 7.0 - m * V7
4. Update konstanta PH_CAL_M dan PH_CAL_B di firmware

Contoh: V7=2.50V, V4=3.05V
   m = (7-4)/(2.50-3.05) = 3/(-0.55) = -5.45
   b = 7 - (-5.45 × 2.50) = 7 + 13.63 = 20.63
```

### 5.2 Kalibrasi Sensor DO

```
Prosedur kalibrasi 2 titik:
1. Kalibrasi udara (100%): letakkan probe di udara terbuka,
   tunggu 10 menit → catat tegangan (= saturasi 100%)
2. Kalibrasi nol (0%): rendam probe di air yang sudah
   dikurangi oksigennya (larutkan natrium sulfit Na2SO3)
   → catat tegangan (= 0 ppm)
3. Rumus: DO = (V - V_zero) / (V_sat - V_zero) × DO_saturasi(T)
```

### 5.3 Kalibrasi Sensor TDS / Salinitas

```
1. Gunakan larutan referensi KCl (tersedia di toko kimia)
   atau air mineral bersih sebagai baseline 0 ppm
2. Ukur tegangan pada air referensi → catat sebagai baseline
3. Sesuaikan faktor konversi di firmware
```

### 5.4 Kalibrasi MQ-135 (Amonia)

> ⚠️ MQ-135 adalah sensor gas, bukan probe cair. Deteksi amonia dari air kolam bersifat **tidak langsung** — sensor diletakkan di atas permukaan air untuk mendeteksi gas NH3 yang menguap.

```
1. Panaskan sensor 48 jam pertama (burn-in) sebelum kalibrasi
2. Baca nilai baseline di udara bersih → simpan sebagai R0
3. Gunakan tabel datasheet Rs/R0 untuk konversi ke ppm
4. Untuk akurasi lebih tinggi: gunakan probe ISE amonia (Rp 800K–2jt)
```

### 5.5 Sensor Suhu DS18B20

> Tidak perlu kalibrasi manual — akurasi pabrik ±0.5°C sudah cukup untuk monitoring tambak.

---

## 6. Integrasi dengan PondFlow API

### 6.1 Mendaftarkan Water Quality Sensor

Sebelum hardware aktif, daftarkan device di Supabase SQL Editor:

```sql
-- Ganti nilai sesuai data aktual
INSERT INTO iot_sensor_devices (
  user_id,
  pond_id,
  device_code,
  device_secret,
  name
) VALUES (
  'your-user-uuid',           -- dari Supabase Auth → Users
  'pond-uuid',                -- dari tabel ponds
  'WQ-001',                   -- kode yang diprogram ke ESP32
  'rahasia_yang_kuat_32char',  -- sama dengan DEV_SECRET di firmware
  'Sensor Kolam Utara'
);
```

### 6.2 Endpoint API Water Quality

```
POST https://pondflow.app/api/iot/telemetry

Headers:
  X-Device-Code:   WQ-001
  X-Device-Secret: rahasia_yang_kuat_32char
  Content-Type:    application/json

Body:
{
  "temperature":       28.5,    // °C       — wajib jika tersedia
  "ph_level":           7.2,    // 0-14     — wajib jika tersedia
  "dissolved_oxygen":   6.8,    // ppm      — wajib jika tersedia
  "salinity":           5.5,    // ppt      — wajib jika tersedia
  "ammonia":            0.012,  // ppm      — wajib jika tersedia
  "water_depth":        1.20,   // meter    — wajib jika tersedia
  "battery_level":     85.0     // %        — opsional
}

Response sukses (200):
{
  "success":     true,
  "reading_id":  "uuid",
  "recorded_at": "2026-06-29T04:00:00Z",
  "pond_id":     "pond-uuid"
}
```

### 6.3 Endpoint Telemetry Auto-Feeder (via Supabase REST)

```
PATCH https://<PROJECT>.supabase.co/rest/v1/iot_devices?device_code=eq.FDR-001

Headers:
  apikey:        <SUPABASE_ANON_KEY>
  Authorization: Bearer <SUPABASE_ANON_KEY>
  Content-Type:  application/json

Body:
{
  "status":        "online",
  "battery_level": 88,
  "hopper_level":  65,
  "last_ping":     "now()"
}
```

---

## 7. Tips Deployment Lapangan

### Perlindungan Hardware

- Semua kabel sensor ke casing menggunakan **konektor aviation GX16** (tahan air, mudah dilepas untuk maintenance)
- Tambahkan **silica gel** di dalam casing untuk menyerap kelembaban
- Cat casing dengan **warna putih / reflektif** agar tidak terlalu panas di bawah terik matahari
- Pasang di tiang bambu/besi **30–50cm di atas permukaan air** agar tidak kena percikan

### Power Management

- Auto-feeder: baterai 18650 bertahan ±3 hari tanpa charging (tergantung frekuensi lontar)
- Water quality: dengan deep sleep 5 menit + solar panel 6V/1W → bisa berjalan tanpa charging saat cuaca cerah
- Pasang solar panel menghadap **selatan** (di Indonesia) dengan kemiringan 15°

### Keamanan Firmware

- **Jangan** hardcode password WiFi ke kode yang di-upload ke GitHub
- Simpan kredensial di `secrets.h` (masukkan ke `.gitignore`)
- Ganti `DEV_SECRET` setiap 6 bulan
- Aktifkan HTTPS (sudah aktif di endpoint PondFlow)

### Troubleshooting Umum

| Masalah | Kemungkinan Penyebab | Solusi |
|---------|---------------------|--------|
| pH selalu 7.0 | Probe kering / rusak | Rendam probe di KCl 3M semalaman |
| DO selalu 0 | Membran probe sobek | Ganti membran kit (tersedia di DFRobot) |
| Suhu -127°C | Koneksi OneWire putus | Cek resistor 4.7kΩ pull-up |
| HTTP 403 | Device secret salah | Cek `device_secret` di tabel Supabase |
| HTTP 404 | Device code belum didaftarkan | Jalankan SQL INSERT di atas |
| Data tidak muncul di dashboard | Supabase Realtime belum aktif | Jalankan `ALTER PUBLICATION supabase_realtime ADD TABLE water_quality_readings` |
