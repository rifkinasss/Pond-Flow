export interface IotDevice {
  id: string;
  pond_id: string;
  pond_name: string;
  device_code: string;
  status: "online" | "offline" | "feeding";
  battery_level: number; // 0 - 100%
  hopper_level: number; // 0 - 100% (sisa pakan di tabung)
  last_feeding?: string;
  daily_dispensed_kg: number;
}

export interface FeedingSchedule {
  id: string;
  device_id: string;
  time: string; // HH:mm
  dispense_amount_grams: number;
  is_active: boolean;
}
