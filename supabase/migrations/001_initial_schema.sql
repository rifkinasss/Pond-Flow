-- ============================================================
-- PondFlow — Initial Schema Migration
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ============================================================
-- 1. PROFILES (extend Supabase Auth users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile saat user register
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'display_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. FARMS (Lokasi / Tambak)
-- ============================================================
CREATE TABLE IF NOT EXISTS farms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. PONDS (Kolam)
-- ============================================================
CREATE TABLE IF NOT EXISTS ponds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id      UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('tanah','terpal','beton','keramba')),
  size_m2      NUMERIC,
  capacity_kg  NUMERIC,
  status       TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. CYCLES (Siklus Budidaya)
-- ============================================================
CREATE TABLE IF NOT EXISTS cycles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id              UUID NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  fish_type            TEXT NOT NULL,
  seed_count           INT,
  seed_weight_gram     NUMERIC,
  seed_price_per_unit  NUMERIC,
  start_date           DATE NOT NULL,
  target_harvest_date  DATE,
  status               TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','harvested','failed')),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. EXPENSES (Pengeluaran)
-- ============================================================
CREATE TABLE IF NOT EXISTS expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  pond_id        UUID REFERENCES ponds(id),
  cycle_id       UUID REFERENCES cycles(id),
  category       TEXT NOT NULL,
  item_name      TEXT NOT NULL,
  quantity       NUMERIC NOT NULL,
  unit           TEXT NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_amount   NUMERIC GENERATED ALWAYS AS (quantity * price_per_unit) STORED,
  date           DATE NOT NULL,
  notes          TEXT,
  is_deleted     BOOLEAN NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 6. INCOMES (Pemasukan)
-- ============================================================
CREATE TABLE IF NOT EXISTS incomes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  cycle_id          UUID REFERENCES cycles(id),
  type              TEXT NOT NULL DEFAULT 'harvest' CHECK (type IN ('harvest','other')),
  harvest_weight_kg NUMERIC,
  price_per_kg      NUMERIC,
  total_amount      NUMERIC NOT NULL,
  buyer             TEXT,
  date              DATE NOT NULL,
  notes             TEXT,
  is_deleted        BOOLEAN NOT NULL DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 7. INVENTORY ITEMS (Stok Pakan & Saprokan)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('feed','medicine','equipment','other')),
  unit           TEXT NOT NULL,
  current_stock  NUMERIC NOT NULL DEFAULT 0,
  minimum_stock  NUMERIC NOT NULL DEFAULT 0,
  price_per_unit NUMERIC,
  last_updated   TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. INVENTORY TRANSACTIONS (Keluar/Masuk Stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS inventory_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('in','out')),
  quantity     NUMERIC NOT NULL,
  reference_id UUID,
  date         DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Auto-update current_stock saat ada transaksi
CREATE OR REPLACE FUNCTION update_inventory_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.type = 'in' THEN
    UPDATE inventory_items SET current_stock = current_stock + NEW.quantity, last_updated = now()
    WHERE id = NEW.item_id;
  ELSE
    UPDATE inventory_items SET current_stock = GREATEST(current_stock - NEW.quantity, 0), last_updated = now()
    WHERE id = NEW.item_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_inventory_transaction ON inventory_transactions;
CREATE TRIGGER on_inventory_transaction
  AFTER INSERT ON inventory_transactions
  FOR EACH ROW EXECUTE FUNCTION update_inventory_stock();

-- ============================================================
-- 9. HARVEST REPORTS (Laporan HPP — generated)
-- ============================================================
CREATE TABLE IF NOT EXISTS harvest_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  total_expense   NUMERIC NOT NULL,
  total_income    NUMERIC NOT NULL,
  hpp_per_kg      NUMERIC NOT NULL,
  gross_profit    NUMERIC NOT NULL,
  margin_percent  NUMERIC NOT NULL,
  fcr             NUMERIC,
  generated_at    TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 10. AI INSIGHTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id              UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  harvest_report_id     UUID REFERENCES harvest_reports(id),
  composite_score       NUMERIC NOT NULL,
  grade                 TEXT NOT NULL,
  flags                 JSONB NOT NULL DEFAULT '[]',
  ai_analysis           TEXT,
  ai_recommendations    JSONB,
  ai_model              TEXT DEFAULT 'gemini-2.0-flash',
  ai_generated_at       TIMESTAMPTZ,
  used_fallback         BOOLEAN NOT NULL DEFAULT false,
  generated_at          TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 11. ROW LEVEL SECURITY (RLS)
-- User hanya bisa akses data miliknya sendiri
-- ============================================================
ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE farms                ENABLE ROW LEVEL SECURITY;
ALTER TABLE ponds                ENABLE ROW LEVEL SECURITY;
ALTER TABLE cycles               ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses             ENABLE ROW LEVEL SECURITY;
ALTER TABLE incomes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items      ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE harvest_reports      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights          ENABLE ROW LEVEL SECURITY;

-- Profiles: user hanya bisa baca/ubah profil sendiri
CREATE POLICY "profiles: own" ON profiles
  FOR ALL USING (auth.uid() = id);

-- Farms: user hanya bisa akses farm miliknya
CREATE POLICY "farms: own" ON farms
  FOR ALL USING (auth.uid() = user_id);

-- Helper function: cek apakah farm_id milik user yang login
CREATE OR REPLACE FUNCTION owns_farm(farm_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM farms WHERE id = farm_id AND user_id = auth.uid())
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Ponds: melalui farm
CREATE POLICY "ponds: via farm" ON ponds
  FOR ALL USING (owns_farm(farm_id));

-- Cycles: melalui pond → farm
CREATE POLICY "cycles: via pond" ON cycles
  FOR ALL USING (
    EXISTS (SELECT 1 FROM ponds WHERE id = cycles.pond_id AND owns_farm(ponds.farm_id))
  );

-- Expenses & Incomes: via farm_id langsung
CREATE POLICY "expenses: own" ON expenses
  FOR ALL USING (owns_farm(farm_id));

CREATE POLICY "incomes: own" ON incomes
  FOR ALL USING (owns_farm(farm_id));

-- Inventory
CREATE POLICY "inventory_items: own" ON inventory_items
  FOR ALL USING (owns_farm(farm_id));

CREATE POLICY "inventory_transactions: via item" ON inventory_transactions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM inventory_items WHERE id = inventory_transactions.item_id AND owns_farm(inventory_items.farm_id))
  );

-- Harvest reports & AI insights: via cycle → pond → farm
CREATE POLICY "harvest_reports: via cycle" ON harvest_reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles c
      JOIN ponds p ON p.id = c.pond_id
      WHERE c.id = harvest_reports.cycle_id AND owns_farm(p.farm_id)
    )
  );

CREATE POLICY "ai_insights: via cycle" ON ai_insights
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM cycles c
      JOIN ponds p ON p.id = c.pond_id
      WHERE c.id = ai_insights.cycle_id AND owns_farm(p.farm_id)
    )
  );

-- ============================================================
-- Selesai! Semua tabel, trigger, dan RLS sudah siap.
-- ============================================================
