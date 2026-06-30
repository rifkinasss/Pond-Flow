import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/shared/types/database.types";

/**
 * POST /api/iot/telemetry
 *
 * Endpoint untuk hardware sensor IoT mengirim data kualitas air.
 * Hardware wajib mengirim header autentikasi:
 *   X-Device-Code   : kode unik perangkat (contoh: WQ-001)
 *   X-Device-Secret : secret key perangkat
 *
 * Body JSON:
 * {
 *   "temperature":       28.5,   // °C          (opsional)
 *   "ph_level":          7.2,    // 0-14        (opsional)
 *   "dissolved_oxygen":  6.8,    // ppm         (opsional)
 *   "salinity":          5.5,    // ppt         (opsional)
 *   "ammonia":           0.01,   // ppm         (opsional)
 *   "water_depth":       1.2,    // meter       (opsional)
 *   "battery_level":     85.0    // % (update status device, opsional)
 * }
 *
 * Response sukses: { success: true, reading_id: "uuid", recorded_at: "iso" }
 * Response error:  { error: "message" } dengan HTTP 4xx/5xx
 */
export async function POST(req: NextRequest) {
  // ── 1. Baca & validasi header autentikasi ──────────────────────────────
  const deviceCode   = req.headers.get("X-Device-Code");
  const deviceSecret = req.headers.get("X-Device-Secret");

  if (!deviceCode || !deviceSecret) {
    return NextResponse.json(
      { error: "Missing authentication headers: X-Device-Code and X-Device-Secret required" },
      { status: 401 }
    );
  }

  // ── 2. Gunakan Supabase Service Role (bypass RLS) ──────────────────────
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // ── 3. Cari & autentikasi device ──────────────────────────────────────
  const { data: device, error: deviceErr } = await supabase
    .from("iot_sensor_devices")
    .select("id, user_id, pond_id, device_secret, status")
    .eq("device_code", deviceCode)
    .single();

  if (deviceErr || !device) {
    return NextResponse.json(
      { error: "Device not found or not registered" },
      { status: 404 }
    );
  }

  if (device.device_secret !== deviceSecret) {
    return NextResponse.json(
      { error: "Invalid device secret" },
      { status: 403 }
    );
  }

  // ── 4. Parse body JSON ─────────────────────────────────────────────────
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  // Ekstrak field yang dikenali
  const {
    temperature,
    ph_level,
    dissolved_oxygen,
    salinity,
    ammonia,
    water_depth,
    battery_level,
    ...rest
  } = body;

  // Minimal 1 parameter harus ada
  const hasData = [temperature, ph_level, dissolved_oxygen, salinity, ammonia, water_depth]
    .some((v) => v !== undefined && v !== null);

  if (!hasData) {
    return NextResponse.json(
      { error: "At least one sensor parameter must be provided" },
      { status: 400 }
    );
  }

  // ── 5. Simpan pembacaan ────────────────────────────────────────────────
  const { data: reading, error: insertErr } = await supabase
    .from("water_quality_readings")
    .insert({
      user_id:          device.user_id,
      pond_id:          device.pond_id,
      device_id:        device.id,
      temperature:      typeof temperature === "number" ? temperature : null,
      ph_level:         typeof ph_level === "number" ? ph_level : null,
      dissolved_oxygen: typeof dissolved_oxygen === "number" ? dissolved_oxygen : null,
      salinity:         typeof salinity === "number" ? salinity : null,
      ammonia:          typeof ammonia === "number" ? ammonia : null,
      water_depth:      typeof water_depth === "number" ? water_depth : null,
      source:           "sensor",
      raw_payload:      { ...body },
    })
    .select("id, recorded_at")
    .single();

  if (insertErr || !reading) {
    console.error("[IoT Telemetry] Insert error:", insertErr);
    return NextResponse.json(
      { error: "Failed to save reading", detail: insertErr?.message },
      { status: 500 }
    );
  }

  // ── 6. Update status & last_ping device ───────────────────────────────
  await supabase
    .from("iot_sensor_devices")
    .update({
      last_ping:     new Date().toISOString(),
      status:        "online",
      ...(typeof battery_level === "number" ? { battery_level } : {}),
    })
    .eq("id", device.id);

  // ── 7. Response sukses ─────────────────────────────────────────────────
  return NextResponse.json({
    success:     true,
    reading_id:  reading.id,
    recorded_at: reading.recorded_at,
    pond_id:     device.pond_id,
  });
}

/**
 * GET /api/iot/telemetry
 * Health check — untuk memverifikasi endpoint aktif
 */
export async function GET() {
  return NextResponse.json({
    status:   "ok",
    endpoint: "PondFlow IoT Telemetry API",
    version:  "1.0.0",
    docs: {
      method:  "POST",
      headers: ["X-Device-Code", "X-Device-Secret"],
      body:    ["temperature", "ph_level", "dissolved_oxygen", "salinity", "ammonia", "water_depth", "battery_level"],
    },
  });
}
