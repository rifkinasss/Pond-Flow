-- ============================================================
-- PondFlow — Migration 003: Fix Expenses Table Schema
-- Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Hapus tabel expenses lama beserta dependency-nya
DROP TABLE IF EXISTS expenses CASCADE;

-- Buat ulang tabel expenses dengan skema yang sesuai dengan kode Next.js
CREATE TABLE IF NOT EXISTS expenses (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  pond_id        UUID REFERENCES ponds(id) ON DELETE SET NULL,
  category       TEXT NOT NULL,
  amount         NUMERIC NOT NULL,
  expense_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  description    TEXT,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Aktifkan RLS
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policy: User hanya bisa mengelola data pengeluaran milik mereka sendiri
CREATE POLICY "expenses: own" ON expenses
  FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Publikasikan ke Supabase Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE expenses;
