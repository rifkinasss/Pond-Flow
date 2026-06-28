# Arsitektur Sistem — PondFlow

| Atribut    | Detail                                              |
|------------|------------------------------------------------------|
| **Status** | Final v1.0                                           |
| **Stack**  | Next.js 14 (App Router, TSX) + Supabase + Gemini AI  |
| **Deploy** | Vercel (Web) + PWA (Mobile via browser)              |

---

## 1. Stack Teknologi

| Layer         | Teknologi                        | Keterangan                                      |
|---------------|----------------------------------|-------------------------------------------------|
| **Framework** | Next.js 14 (App Router)          | Web-first, SSR + CSR, TypeScript                |
| **Language**  | TypeScript (TSX)                 | Full type safety di seluruh codebase            |
| **Styling**   | Tailwind CSS                     | Utility-first, mobile-responsive                |
| **UI Components** | shadcn/ui                    | Aksesibel, composable, mudah dikustomisasi      |
| **Database**  | Supabase (PostgreSQL)            | Managed DB, realtime, RLS built-in              |
| **Auth**      | Supabase Auth                    | Email/password; siap untuk OAuth di v1.5        |
| **Storage**   | Supabase Storage                 | Upload gambar kolam / dokumen (opsional)        |
| **PWA**       | next-pwa                         | Service worker, installable, offline cache      |
| **Charts**    | Recharts                         | Grafik laporan (pie, line, bar)                 |
| **Forms**     | React Hook Form + Zod            | Validasi form type-safe                         |
| **State**     | Zustand                          | Global state ringan (active farm, user session) |
| **Icons**     | Lucide React                     | Icon library konsisten                          |
| **Export**    | jsPDF + xlsx (SheetJS)           | Export laporan ke PDF & Excel                   |
| **AI Engine** | Rule-Based + Google Gemini 2.0 Flash | Insight & rekomendasi pasca panen (free tier) |
| **Hosting**   | Vercel                           | Deploy otomatis dari Git, edge network          |

---

## 2. Arsitektur Sistem (High-Level)

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (Browser / PWA)                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │Dashboard │  │  Ponds   │  │ Finance  │  │ Reports  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
│                                              ┌───────────┐  │
│                                              │ AI Insight│  │
│                                              │Rule Engine│  │
│                                              └─────┬─────┘  │
│                    Next.js App Router (TSX)        │        │
│               React Server Components + Client Components   │
└──────────────────────────┬──────────────────────┬──────────┘
                           │ HTTPS                 │ HTTPS (async)
┌──────────────────────────▼──────────────┐  ┌────▼────────────────┐
│              SUPABASE                   │  │  GOOGLE GEMINI API   │
│                                         │  │                      │
│  ┌────────┐  ┌──────────┐  ┌────────┐  │  │  gemini-2.0-flash    │
│  │  Auth  │  │PostgreSQL│  │Realtime│  │  │  Free Tier           │
│  │(JWT,   │  │(database)│  │(ws)    │  │  │  1.500 req/day       │
│  │  RLS)  │  └──────────┘  └────────┘  │  │                      │
│  └────────┘  ┌──────────┐              │  │  Input: cycle JSON   │
│              │ Storage  │              │  │  Output: narasi +    │
│              │ (files)  │              │  │  rekomendasi aksi    │
│              └──────────┘              │  └──────────────────────┘
└─────────────────────────────────────────┘
```

---

## 3. Struktur Folder Next.js

```
src/
├── app/                            # Next.js App Router
│   ├── (auth)/                     # Route group — halaman auth (tanpa layout utama)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── register/
│   │       └── page.tsx
│   ├── (dashboard)/                # Route group — halaman utama (butuh login)
│   │   ├── layout.tsx              # Layout dengan sidebar & navbar
│   │   ├── page.tsx                # Dashboard utama
│   │   ├── farms/
│   │   │   ├── page.tsx            # Daftar lokasi/farm
│   │   │   └── [farmId]/
│   │   │       └── page.tsx        # Detail satu farm
│   │   ├── ponds/
│   │   │   ├── page.tsx            # Daftar kolam
│   │   │   └── [pondId]/
│   │   │       ├── page.tsx        # Detail kolam
│   │   │       └── cycles/
│   │   │           └── [cycleId]/
│   │   │               └── page.tsx  # Detail siklus
│   │   ├── finance/
│   │   │   ├── expenses/
│   │   │   │   └── page.tsx        # List & form pengeluaran
│   │   │   └── income/
│   │   │       └── page.tsx        # List & form pemasukan
│   │   ├── inventory/
│   │   │   └── page.tsx            # Stok pakan & saprokan
│   │   └── reports/
│   │       └── page.tsx            # Laporan HPP & laba/rugi
│   ├── api/                        # API Routes (Next.js)
│   │   ├── reports/
│   │   │   └── export/
│   │   │       └── route.ts        # Generate PDF / Excel
│   │   └── ai/
│   │       └── insight/
│   │           └── route.ts        # Proxy ke Gemini API (server-side, key aman)
│   ├── layout.tsx                  # Root layout
│   └── globals.css
│
├── features/                       # Domain-driven feature modules
│   ├── auth/
│   │   ├── components/             # LoginForm, RegisterForm
│   │   ├── hooks/                  # useUser, useSession
│   │   └── actions/                # Server actions: signIn, signOut, signUp
│   ├── farm/
│   │   ├── components/             # FarmCard, FarmForm, FarmList
│   │   ├── hooks/                  # useFarms, useFarm
│   │   └── actions/                # createFarm, updateFarm, deleteFarm
│   ├── pond/
│   │   ├── components/             # PondCard, PondForm, CycleForm
│   │   ├── hooks/                  # usePonds, useCycles
│   │   └── actions/                # createPond, startCycle, closeCycle
│   ├── finance/
│   │   ├── components/             # ExpenseForm, IncomeForm, TransactionList
│   │   ├── hooks/                  # useExpenses, useIncome
│   │   └── actions/                # addExpense, addIncome
│   ├── inventory/
│   │   ├── components/             # InventoryTable, StockForm, StockAlert
│   │   ├── hooks/                  # useInventory
│   │   └── actions/                # addStock, consumeStock
│   ├── report/
│   │   ├── components/             # HPPSummary, ProfitChart, ExportButton
│   │   ├── hooks/                  # useHarvestReport, usePeriodReport
│   │   └── utils/                  # calculateHPP, calculateFCR
│   └── ai-insight/
│       ├── components/             # InsightCard, ScoreBadge, RecommendationList
│       ├── hooks/                  # useAiInsight
│       ├── engine/                 # ruleEngine.ts, scoring.ts, thresholds.ts
│       └── actions/                # generateInsight.ts (call ke API route)
│
├── shared/                         # Shared di seluruh aplikasi
│   ├── components/
│   │   ├── ui/                     # shadcn/ui base components
│   │   ├── layout/                 # Sidebar, Navbar, MobileNav
│   │   └── common/                 # LoadingSpinner, EmptyState, ConfirmDialog
│   ├── hooks/                      # useToast, useMediaQuery
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase browser client
│   │   │   ├── server.ts           # Supabase server client (SSR)
│   │   │   └── middleware.ts       # Auth middleware helper
│   │   └── utils.ts                # cn(), formatCurrency(), formatDate()
│   └── types/
│       └── database.types.ts       # Auto-generated dari Supabase CLI
│
└── middleware.ts                   # Next.js middleware — proteksi route
```

---

## 4. Skema Database (Supabase / PostgreSQL)

### Row Level Security (RLS)
Semua tabel dilindungi RLS: **user hanya bisa mengakses data miliknya sendiri** melalui relasi ke `auth.users`.

```sql
-- TABEL UTAMA --

-- Profil user (extend Supabase Auth)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Lokasi / Farm
CREATE TABLE farms (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  address     TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Kolam
CREATE TABLE ponds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id      UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  type         TEXT NOT NULL CHECK (type IN ('tanah','terpal','beton','keramba')),
  size_m2      NUMERIC,
  capacity_kg  NUMERIC,
  status       TEXT DEFAULT 'active' CHECK (status IN ('active','inactive')),
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Siklus Budidaya
CREATE TABLE cycles (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pond_id              UUID NOT NULL REFERENCES ponds(id) ON DELETE CASCADE,
  fish_type            TEXT NOT NULL,
  seed_count           INT,
  seed_weight_gram     NUMERIC,
  seed_price_per_unit  NUMERIC,
  start_date           DATE NOT NULL,
  target_harvest_date  DATE,
  status               TEXT DEFAULT 'active' CHECK (status IN ('active','harvested','failed')),
  notes                TEXT,
  created_at           TIMESTAMPTZ DEFAULT now()
);

-- Pengeluaran
CREATE TABLE expenses (
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
  is_deleted     BOOLEAN DEFAULT false,
  created_at     TIMESTAMPTZ DEFAULT now()
);

-- Pemasukan
CREATE TABLE incomes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id           UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  cycle_id          UUID REFERENCES cycles(id),
  type              TEXT DEFAULT 'harvest' CHECK (type IN ('harvest','other')),
  harvest_weight_kg NUMERIC,
  price_per_kg      NUMERIC,
  total_amount      NUMERIC NOT NULL,
  buyer             TEXT,
  date              DATE NOT NULL,
  notes             TEXT,
  is_deleted        BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Stok Inventori
CREATE TABLE inventory_items (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  farm_id        UUID NOT NULL REFERENCES farms(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  category       TEXT NOT NULL CHECK (category IN ('feed','medicine','equipment','other')),
  unit           TEXT NOT NULL,
  current_stock  NUMERIC DEFAULT 0,
  minimum_stock  NUMERIC DEFAULT 0,
  price_per_unit NUMERIC,
  last_updated   TIMESTAMPTZ DEFAULT now()
);

-- Transaksi Inventori
CREATE TABLE inventory_transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id      UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('in','out')),
  quantity     NUMERIC NOT NULL,
  reference_id UUID,    -- opsional: cycle_id
  date         DATE NOT NULL,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT now()
);

-- Laporan HPP (disimpan saat siklus ditutup)
CREATE TABLE harvest_reports (
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
```

---

## 5. Auth Flow

```
User buka app
    │
    ├─ [Belum login] ──► /login ──► Supabase Auth signInWithPassword()
    │                                  └─► JWT disimpan di cookie (SSR-safe)
    │                                  └─► Redirect ke /dashboard
    │
    └─ [Sudah login] ──► middleware.ts cek session
                            ├─ Valid ──► Lanjut ke halaman yang diminta
                            └─ Expired ──► Redirect ke /login
```

- Session di-refresh otomatis via Supabase client
- Middleware Next.js memproteksi semua route di `(dashboard)/`
- RLS Supabase memastikan isolasi data antar user di level database

---

## 6. PWA Configuration

File `public/manifest.json`:
```json
{
  "name": "PondFlow",
  "short_name": "PondFlow",
  "description": "Manajemen keuangan budidaya ikan",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0ea5e9",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- `next-pwa` mengaktifkan service worker otomatis di production
- Cache strategy: **Network First** untuk data, **Cache First** untuk asset statis
- Offline: halaman terakhir yang dikunjungi tetap bisa dilihat

---

## 7. Environment Variables

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # Hanya untuk server-side (API routes)
GEMINI_API_KEY=AIza...             # Google Gemini — server-side only, jangan NEXT_PUBLIC_
```

---

*PondFlow ARCHITECTURE.md v1.0 — NasLabs.id*
