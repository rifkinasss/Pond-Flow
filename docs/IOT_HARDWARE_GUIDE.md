# Panduan Integrasi Hardware IoT Auto-Feeder dengan PondFlow

Dokumen ini disusun sebagai panduan teknis bagi pengembang perangkat keras (*Hardware/IoT Engineer*) untuk menghubungkan perangkat mikrokontroler pelontar pakan otomatis di lapangan dengan sistem PondFlow via **Supabase Realtime & REST API**.

---

## 📋 1. Skema Tabel Database Supabase

Pastikan script SQL berikut telah dijalankan di Supabase Editor Anda:

```sql
-- 1. TABEL PERANGKAT IOT (iot_devices)
CREATE TABLE public.iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pond_id UUID NOT NULL REFERENCES public.ponds(id) ON DELETE CASCADE,
    device_code VARCHAR(50) NOT NULL UNIQUE, -- Serial Number / API Key Alat (Cth: FEEDER-EX101)
    status VARCHAR(20) DEFAULT 'online',    -- 'online', 'offline', 'feeding'
    battery_level INT DEFAULT 100,           -- Telemetry Baterai (0 - 100%)
    hopper_level INT DEFAULT 100,            -- Telemetry Sisa Pelet Tabung (%)
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABEL JADWAL PAKAN OTOMATIS (iot_feeding_schedules)
CREATE TABLE public.iot_feeding_schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.iot_devices(id) ON DELETE CASCADE,
    feed_time TIME NOT NULL,                 -- Jam lontar (Cth: '07:00:00')
    dispense_amount_grams INT DEFAULT 500,   -- Takaran lontar dalam gram
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔌 2. Alur Integrasi Mikrokontroler (ESP32 / Arduino)

### A. Telemetry Heartbeat (Mengirim Status Baterai, Sisa Pelet & ID Kolam)
Setiap 1–5 menit, ESP32 harus mengirimkan HTTP PATCH ke Supabase REST API dengan menyertakan Identitas Perangkat (`device_code`) dan ID Kolam (`pond_id`):

- **Endpoint**: `https://<PROJECT-ID>.supabase.co/rest/v1/iot_devices?device_code=eq.FEEDER-EX101`
- **Method**: `PATCH`
- **Headers**:
  - `apikey`: `<SUPABASE_ANON_KEY>`
  - `Authorization`: `Bearer <SUPABASE_ANON_KEY>`
  - `Content-Type`: `application/json`
- **Payload Body**:
  ```json
  {
    "pond_id": "b3f2a890-1234-5678-90ab-cdef12345678",
    "device_code": "FEEDER-EX101",
    "battery_level": 88,
    "hopper_level": 65,
    "status": "online",
    "last_ping": "NOW()"
  }
  ```

---

### B. Mendengarkan Perintah Lontar Pakan Realtime (*Remote Dispense*)
Mikrokontroler mendengarkan event perubahan data via Supabase Realtime WebSocket di channel `public:iot_devices` terfilter berdasarkan `device_code` dan `pond_id`.

- Ketika petambak menekan tombol **"Lontar Pakan"** di web dashboard PondFlow, kolom `status` pada row perangkat akan berubah menjadi `'feeding'`.
- **Logika Perangkat**:
  1. ESP32 mendeteksi `status == 'feeding'` pada `pond_id` terkait.
  2. Putar motor pelontar pakan (servo / stepper) selama Durasi Takaran (misal 5 detik untuk lontar 0.5 kg).
  3. Setelah selesai melontar, ESP32 mengirim HTTP PATCH untuk mengubah `status` kembali ke `'online'` dan mengurangi `hopper_level`.

---

## 🤖 3. Contoh Code ESP32 (Arduino C++)

Berikut adalah contoh sketsa C++ lengkap dengan identifikasi ID Kolam:

```cpp
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "WIFI_TAMBAK_SSID";
const char* password = "WIFI_PASSWORD";

// KREDENSIAL PERANGKAT & KOLAM BUDIDAYA
const char* deviceCode = "FEEDER-EX101";
const char* pondId = "b3f2a890-1234-5678-90ab-cdef12345678"; // ID Kolam dari PondFlow Web
const char* supabaseUrl = "https://<PROJECT-ID>.supabase.co/rest/v1/iot_devices?device_code=eq.FEEDER-EX101";
const char* supabaseKey = "YOUR_SUPABASE_ANON_KEY";

const int MOTOR_PIN = 26; // Pin Motor Pelontar Pakan

void setup() {
  Serial.begin(115200);
  pinMode(MOTOR_PIN, OUTPUT);
  digitalWrite(MOTOR_PIN, LOW);

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi Terhubung!");
}

void sendTelemetry(int battery, int hopper) {
  if(WiFi.status() == WL_CONNECTED){
    HTTPClient http;
    http.begin(supabaseUrl);
    http.addHeader("Content-Type", "application/json");
    http.addHeader("apikey", supabaseKey);
    http.addHeader("Authorization", String("Bearer ") + supabaseKey);

    String jsonPayload = "{\"pond_id\":\"" + String(pondId) + 
                         "\",\"device_code\":\"" + String(deviceCode) + 
                         "\",\"battery_level\":" + String(battery) + 
                         ",\"hopper_level\":" + String(hopper) + 
                         ",\"status\":\"online\"}";
    
    int httpResponseCode = http.PATCH(jsonPayload);
    Serial.print("Telemetry Sent Code: ");
    Serial.println(httpResponseCode);
    http.end();
  }
}

void loop() {
  // Kirim telemetry rutin (baterai, isi tabung, ID kolam) setiap 5 menit
  sendTelemetry(90, 75);
  delay(300000); // 5 menit
}
```
