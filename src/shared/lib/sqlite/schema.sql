PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  phone TEXT,
  business_name TEXT,
  avatar TEXT DEFAULT '🐟',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin','superadmin')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id TEXT PRIMARY KEY,
  actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  metadata TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by TEXT REFERENCES users(id) ON DELETE SET NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  token TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS farms (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  description TEXT,
  latitude REAL,
  longitude REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ponds (
  id TEXT PRIMARY KEY,
  farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Terpal',
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pond_cycles (
  id TEXT PRIMARY KEY,
  pond_id TEXT NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  fish_type TEXT NOT NULL,
  initial_stock INTEGER NOT NULL,
  current_stock INTEGER NOT NULL,
  target_days INTEGER DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','harvested','failed')),
  start_date TEXT NOT NULL,
  harvest_date TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS harvests (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL REFERENCES pond_cycles(id) ON DELETE CASCADE,
  amount_harvested INTEGER NOT NULL,
  weight_kg REAL,
  harvest_type TEXT NOT NULL CHECK (harvest_type IN ('partial','final')),
  harvest_date TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  pond_id TEXT REFERENCES ponds(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  amount REAL NOT NULL,
  expense_date TEXT NOT NULL DEFAULT (date('now')),
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_items (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  farm_id TEXT NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  stock_quantity REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL DEFAULT 'kg',
  unit_price REAL,
  min_stock_alert REAL NOT NULL DEFAULT 5,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS feeding_logs (
  id TEXT PRIMARY KEY,
  cycle_id TEXT NOT NULL REFERENCES pond_cycles(id) ON DELETE CASCADE,
  inventory_item_id TEXT REFERENCES inventory_items(id) ON DELETE SET NULL,
  feed_time TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  amount_kg REAL NOT NULL,
  unit_price REAL NOT NULL DEFAULT 0,
  total_cost REAL NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pond_id TEXT NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  device_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'online',
  battery_level REAL NOT NULL DEFAULT 100,
  hopper_level REAL NOT NULL DEFAULT 100,
  last_ping TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_feeding_schedules (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
  feed_time TEXT NOT NULL,
  dispense_amount_grams REAL NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS iot_sensor_devices (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pond_id TEXT NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  device_code TEXT NOT NULL UNIQUE,
  device_secret TEXT NOT NULL,
  name TEXT,
  status TEXT NOT NULL DEFAULT 'online',
  firmware_version TEXT,
  last_ping TEXT,
  battery_level REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS water_quality_readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pond_id TEXT NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  device_id TEXT REFERENCES iot_sensor_devices(id) ON DELETE SET NULL,
  temperature REAL,
  ph_level REAL,
  dissolved_oxygen REAL,
  salinity REAL,
  ammonia REAL,
  water_depth REAL,
  recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  source TEXT NOT NULL DEFAULT 'sensor' CHECK (source IN ('sensor','manual')),
  raw_payload TEXT
);

CREATE INDEX IF NOT EXISTS idx_farms_user ON farms(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ponds_farm ON ponds(farm_id);
CREATE INDEX IF NOT EXISTS idx_cycles_pond_status ON pond_cycles(pond_id, status);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, expense_date);
CREATE INDEX IF NOT EXISTS idx_wqr_pond_time ON water_quality_readings(pond_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_sensor_device_code ON iot_sensor_devices(device_code);
