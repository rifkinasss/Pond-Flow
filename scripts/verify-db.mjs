import Database from "better-sqlite3";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const dataDir = process.env.PONDFLOW_DATA_DIR || path.join(process.cwd(), "data");
const file = path.join(dataDir, "pondflow.sqlite");
mkdirSync(dataDir, { recursive: true });
const db = new Database(file);
db.pragma("foreign_keys = ON");
db.exec(readFileSync(path.join(process.cwd(), "src/shared/lib/sqlite/schema.sql"), "utf8"));
const expected = ["users", "sessions", "farms", "ponds", "pond_cycles", "harvests", "expenses", "inventory_items", "feeding_logs", "iot_devices", "iot_sensor_devices", "water_quality_readings"];
const tables = new Set(db.prepare("SELECT name FROM sqlite_master WHERE type = 'table'").all().map((row) => row.name));
const missing = expected.filter((name) => !tables.has(name));
if (missing.length) { console.error(`Tabel kurang: ${missing.join(", ")}`); process.exit(1); }
console.log(`SQLite OK: ${file}`);
console.log(`Tabel tervalidasi: ${expected.length}`);
