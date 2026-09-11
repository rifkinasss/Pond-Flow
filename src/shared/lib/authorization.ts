import { sqlite } from "@/shared/lib/sqlite/db";

export function ownsFarm(userId: string, farmId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM farms WHERE id = ? AND user_id = ?").get(farmId, userId));
}

export function ownsPond(userId: string, pondId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM ponds p JOIN farms f ON f.id = p.farm_id WHERE p.id = ? AND f.user_id = ?").get(pondId, userId));
}

export function ownsCycle(userId: string, cycleId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM pond_cycles c JOIN ponds p ON p.id = c.pond_id JOIN farms f ON f.id = p.farm_id WHERE c.id = ? AND f.user_id = ?").get(cycleId, userId));
}

export function ownsInventoryItem(userId: string, itemId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM inventory_items WHERE id = ? AND user_id = ?").get(itemId, userId));
}

export function ownsFeeder(userId: string, deviceId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM iot_devices WHERE id = ? AND user_id = ?").get(deviceId, userId));
}

export function ownsSensor(userId: string, deviceId: string) {
  return Boolean(sqlite.prepare("SELECT 1 FROM iot_sensor_devices WHERE id = ? AND user_id = ?").get(deviceId, userId));
}
