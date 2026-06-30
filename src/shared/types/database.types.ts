export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      ponds: {
        Row: {
          id: string;
          farm_id: string;
          name: string;
          type: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          farm_id: string;
          name: string;
          type: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          farm_id?: string;
          name?: string;
          type?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      farms: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          address: string | null;
          description: string | null;
          latitude: number | null;
          longitude: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          address?: string | null;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          address?: string | null;
          description?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      pond_cycles: {
        Row: {
          id: string;
          pond_id: string;
          fish_type: string;
          initial_stock: number;
          current_stock: number;
          status: "active" | "harvested";
          start_date: string;
          target_days: number | null;
          harvest_date: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          pond_id: string;
          fish_type: string;
          initial_stock: number;
          current_stock: number;
          status?: "active" | "harvested";
          start_date?: string;
          target_days?: number | null;
          harvest_date?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          pond_id?: string;
          fish_type?: string;
          initial_stock?: number;
          current_stock?: number;
          status?: "active" | "harvested";
          start_date?: string;
          target_days?: number | null;
          harvest_date?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      harvests: {
        Row: {
          id: string;
          cycle_id: string;
          amount_harvested: number;
          weight_kg: number | null;
          harvest_type: "partial" | "final";
          harvest_date: string;
          notes: string | null;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          amount_harvested: number;
          weight_kg?: number | null;
          harvest_type: "partial" | "final";
          harvest_date?: string;
          notes?: string | null;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          amount_harvested?: number;
          weight_kg?: number | null;
          harvest_type?: "partial" | "final";
          harvest_date?: string;
          notes?: string | null;
        };
        Relationships: [];
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          pond_id: string | null;
          category: string;
          amount: number;
          expense_date: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          farm_id: string;
          pond_id?: string | null;
          category: string;
          amount: number;
          expense_date?: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_id?: string;
          pond_id?: string | null;
          category?: string;
          amount?: number;
          expense_date?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      inventory_items: {
        Row: {
          id: string;
          user_id: string;
          farm_id: string;
          name: string;
          category: string;
          stock_quantity: number;
          unit: string;
          unit_price: number | null;
          min_stock_alert: number;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string;
          farm_id: string;
          name: string;
          category: string;
          stock_quantity?: number;
          unit?: string;
          unit_price?: number | null;
          min_stock_alert?: number;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          farm_id?: string;
          name?: string;
          category?: string;
          stock_quantity?: number;
          unit?: string;
          unit_price?: number | null;
          min_stock_alert?: number;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      feeding_logs: {
        Row: {
          id: string;
          cycle_id: string;
          inventory_item_id: string | null;
          feed_time: string;
          amount_kg: number;
          unit_price: number;
          total_cost: number;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          cycle_id: string;
          inventory_item_id?: string | null;
          feed_time?: string;
          amount_kg: number;
          unit_price?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          cycle_id?: string;
          inventory_item_id?: string | null;
          feed_time?: string;
          amount_kg?: number;
          unit_price?: number;
          total_cost?: number;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      iot_devices: {
        Row: {
          id: string;
          user_id: string;
          pond_id: string;
          device_code: string;
          status: string;
          battery_level: number;
          hopper_level: number;
          last_ping: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pond_id: string;
          device_code: string;
          status?: string;
          battery_level?: number;
          hopper_level?: number;
          last_ping?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pond_id?: string;
          device_code?: string;
          status?: string;
          battery_level?: number;
          hopper_level?: number;
          last_ping?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      iot_feeding_schedules: {
        Row: {
          id: string;
          device_id: string;
          feed_time: string;
          dispense_amount_grams: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          feed_time: string;
          dispense_amount_grams?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          feed_time?: string;
          dispense_amount_grams?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      iot_sensor_devices: {
        Row: {
          id: string;
          user_id: string;
          pond_id: string;
          device_code: string;
          device_secret: string;
          name: string | null;
          status: "online" | "offline" | "error";
          firmware_version: string | null;
          last_ping: string | null;
          battery_level: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pond_id: string;
          device_code: string;
          device_secret: string;
          name?: string | null;
          status?: "online" | "offline" | "error";
          firmware_version?: string | null;
          last_ping?: string | null;
          battery_level?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pond_id?: string;
          device_code?: string;
          device_secret?: string;
          name?: string | null;
          status?: "online" | "offline" | "error";
          firmware_version?: string | null;
          last_ping?: string | null;
          battery_level?: number | null;
          created_at?: string;
        };
        Relationships: [];
      };
      water_quality_readings: {
        Row: {
          id: string;
          user_id: string;
          pond_id: string;
          device_id: string | null;
          temperature: number | null;     // °C
          ph_level: number | null;        // 0 – 14
          dissolved_oxygen: number | null; // ppm
          salinity: number | null;        // ppt
          ammonia: number | null;         // ppm
          water_depth: number | null;     // meter
          recorded_at: string;
          source: "sensor" | "manual";
          raw_payload: Record<string, unknown> | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          pond_id: string;
          device_id?: string | null;
          temperature?: number | null;
          ph_level?: number | null;
          dissolved_oxygen?: number | null;
          salinity?: number | null;
          ammonia?: number | null;
          water_depth?: number | null;
          recorded_at?: string;
          source?: "sensor" | "manual";
          raw_payload?: Record<string, unknown> | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          pond_id?: string;
          device_id?: string | null;
          temperature?: number | null;
          ph_level?: number | null;
          dissolved_oxygen?: number | null;
          salinity?: number | null;
          ammonia?: number | null;
          water_depth?: number | null;
          recorded_at?: string;
          source?: "sensor" | "manual";
          raw_payload?: Record<string, unknown> | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};

// ── Convenience row types ──────────────────────────────────────────────────
export type Farm = Database["public"]["Tables"]["farms"]["Row"];
export type Pond = Database["public"]["Tables"]["ponds"]["Row"];
export type PondCycle = Database["public"]["Tables"]["pond_cycles"]["Row"];
export type Harvest = Database["public"]["Tables"]["harvests"]["Row"];
export type Expense = Database["public"]["Tables"]["expenses"]["Row"];
export type InventoryItem = Database["public"]["Tables"]["inventory_items"]["Row"];
export type FeedingLog = Database["public"]["Tables"]["feeding_logs"]["Row"];
export type IotDeviceRow = Database["public"]["Tables"]["iot_devices"]["Row"];
export type IotFeedingScheduleRow = Database["public"]["Tables"]["iot_feeding_schedules"]["Row"];

// ── Water Quality Telemetry types ─────────────────────────────────────────
export type WaterQualityReading = Database["public"]["Tables"]["water_quality_readings"]["Row"];
export type WaterQualityInsert = Database["public"]["Tables"]["water_quality_readings"]["Insert"];
export type IotSensorDevice = Database["public"]["Tables"]["iot_sensor_devices"]["Row"];
export type IotSensorDeviceInsert = Database["public"]["Tables"]["iot_sensor_devices"]["Insert"];

// ── Parameter threshold constants (nilai normal untuk ikan budidaya umum) ──
export const WATER_QUALITY_THRESHOLDS = {
  temperature:      { min: 25,    max: 32,    unit: "°C"  },
  ph_level:         { min: 6.5,   max: 8.5,   unit: ""    },
  dissolved_oxygen: { min: 5,     max: 15,    unit: "ppm" },
  salinity:         { min: 0,     max: 35,    unit: "ppt" },
  ammonia:          { min: 0,     max: 0.025, unit: "ppm" },
  water_depth:      { min: 0.5,   max: 3,     unit: "m"   },
} as const;

export type WaterQualityParam = keyof typeof WATER_QUALITY_THRESHOLDS;

/** Status kualitas parameter berdasarkan threshold */
export function getParamStatus(
  param: WaterQualityParam,
  value: number | null | undefined
): "normal" | "warning" | "critical" | "no_data" {
  if (value === null || value === undefined) return "no_data";
  const t = WATER_QUALITY_THRESHOLDS[param];
  if (value < t.min || value > t.max) {
    // Jauh dari range = critical, dekat = warning
    const range = t.max - t.min;
    const deviation = Math.min(
      Math.abs(value - t.min),
      Math.abs(value - t.max)
    );
    return deviation > range * 0.2 ? "critical" : "warning";
  }
  return "normal";
}

