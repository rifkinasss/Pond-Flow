-- ============================================================
-- PondFlow — Migration 002: Water Quality Telemetry
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- Fitur: Pemantauan Kualitas Air Realtime dari Sensor IoT
-- Hardware sensor mengirim data ke POST /api/iot/telemetry
-- ============================================================

-- ============================================================
-- 1. TABEL: water_quality_readings
-- Menyimpan pembacaan sensor kualitas air per kolam
-- ============================================================
CREATE TABLE IF NOT EXISTS water_quality_readings (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pond_id            UUID        NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  device_id          UUID        REFERENCES iot_devices(id) ON DELETE SET NULL,

  -- Parameter kualitas air
  temperature        NUMERIC(5,2),        -- Suhu air dalam °C (contoh: 28.50)
  ph_level           NUMERIC(4,2),        -- Kadar pH 0.00 – 14.00
  dissolved_oxygen   NUMERIC(5,2),        -- Oksigen Terlarut dalam ppm
  salinity           NUMERIC(6,3),        -- Salinitas dalam ppt (parts per thousand)
  ammonia            NUMERIC(7,5),        -- Amonia NH3 dalam ppm (contoh: 0.02500)
  water_depth        NUMERIC(5,2),        -- Kedalaman air dalam meter

  -- Metadata
  recorded_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  source             TEXT        NOT NULL DEFAULT 'sensor'
                                 CHECK (source IN ('sensor', 'manual')),

  -- Opsional: raw payload dari hardware untuk debugging
  raw_payload        JSONB
);

-- ============================================================
-- 2. TABEL: iot_sensor_devices
-- Device sensor kualitas air (terpisah dari iot_devices feeder)
-- ============================================================
CREATE TABLE IF NOT EXISTS iot_sensor_devices (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pond_id            UUID        NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  device_code        TEXT        NOT NULL UNIQUE,   -- Kode unik hardware, misal: WQ-001
  device_secret      TEXT        NOT NULL,           -- Secret key untuk autentikasi API
  name               TEXT,                           -- Nama deskriptif, misal: "Sensor Kolam Utara"
  status             TEXT        NOT NULL DEFAULT 'online'
                                 CHECK (status IN ('online', 'offline', 'error')),
  firmware_version   TEXT,
  last_ping          TIMESTAMPTZ,
  battery_level      NUMERIC(5,2),                  -- 0.00 – 100.00 %
  created_at         TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. INDEXES untuk query performa tinggi
-- ============================================================

-- Ambil pembacaan terbaru per kolam (paling sering diquery)
CREATE INDEX IF NOT EXISTS idx_wqr_pond_time
  ON water_quality_readings (pond_id, recorded_at DESC);

-- Filter berdasarkan user untuk RLS check
CREATE INDEX IF NOT EXISTS idx_wqr_user
  ON water_quality_readings (user_id);

-- Device lookup by code (untuk auth API)
CREATE INDEX IF NOT EXISTS idx_sensor_device_code
  ON iot_sensor_devices (device_code);

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE water_quality_readings   ENABLE ROW LEVEL SECURITY;
ALTER TABLE iot_sensor_devices       ENABLE ROW LEVEL SECURITY;

-- water_quality_readings: user hanya baca data kolamnya sendiri
CREATE POLICY "wqr: own ponds" ON water_quality_readings
  FOR ALL USING (auth.uid() = user_id);

-- iot_sensor_devices: user hanya kelola device miliknya
CREATE POLICY "sensor_devices: own" ON iot_sensor_devices
  FOR ALL USING (auth.uid() = user_id);

-- Service role (untuk API endpoint hardware) bisa insert tanpa RLS
-- API route menggunakan Supabase Service Key, bukan user JWT

-- ============================================================
-- 5. REALTIME PUBLIKASI
-- Aktifkan agar Supabase Realtime broadcast perubahan ke frontend
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE water_quality_readings;
ALTER PUBLICATION supabase_realtime ADD TABLE iot_sensor_devices;

-- ============================================================
-- 6. FUNGSI HELPER: get_latest_water_quality(pond_id)
-- Ambil 1 baris terbaru untuk setiap kolam — digunakan di dashboard
-- ============================================================
CREATE OR REPLACE FUNCTION get_latest_water_quality(p_pond_id UUID)
RETURNS SETOF water_quality_readings
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT *
  FROM water_quality_readings
  WHERE pond_id = p_pond_id
  ORDER BY recorded_at DESC
  LIMIT 1;
$$;

-- ============================================================
-- 7. FUNGSI HELPER: get_water_quality_stats(pond_id, hours)
-- Statistik agregasi untuk chart 24 jam / 7 hari
-- ============================================================
CREATE OR REPLACE FUNCTION get_water_quality_stats(
  p_pond_id UUID,
  p_hours   INT DEFAULT 24
)
RETURNS TABLE (
  bucket        TIMESTAMPTZ,
  avg_temp      NUMERIC,
  avg_ph        NUMERIC,
  avg_do        NUMERIC,
  avg_salinity  NUMERIC,
  avg_ammonia   NUMERIC,
  reading_count BIGINT
)
LANGUAGE sql STABLE SECURITY DEFINER AS $$
  SELECT
    date_trunc('hour', recorded_at)   AS bucket,
    ROUND(AVG(temperature)::NUMERIC, 2)       AS avg_temp,
    ROUND(AVG(ph_level)::NUMERIC, 2)          AS avg_ph,
    ROUND(AVG(dissolved_oxygen)::NUMERIC, 2)  AS avg_do,
    ROUND(AVG(salinity)::NUMERIC, 3)          AS avg_salinity,
    ROUND(AVG(ammonia)::NUMERIC, 5)           AS avg_ammonia,
    COUNT(*)                                  AS reading_count
  FROM water_quality_readings
  WHERE pond_id = p_pond_id
    AND recorded_at >= now() - (p_hours || ' hours')::INTERVAL
  GROUP BY bucket
  ORDER BY bucket ASC;
$$;

-- ============================================================
-- Selesai!
-- Tabel, index, RLS, realtime, dan fungsi helper siap.
-- ============================================================
-- CATATAN UNTUK PENGEMBANG:
--   • Hardware sensor mengirim data ke: POST /api/iot/telemetry
--   • Header yang diperlukan: X-Device-Code + X-Device-Secret
--   • Payload JSON: { temperature, ph_level, dissolved_oxygen,
--                     salinity, ammonia, water_depth }
-- ============================================================
