# AI Insight — PondFlow
## Spesifikasi Lengkap: Analisis & Rekomendasi Otomatis Pasca Panen

| Atribut | Detail |
|---|---|
| **Versi** | 1.0 |
| **Engine** | Rule-Based + Google Gemini 2.0 Flash (Free Tier) |
| **Biaya** | Rp 0 — Free tier Gemini mencukupi skala v1.0 |
| **Author** | NasLabs.id |

---

## 1. Filosofi Desain

AI Insight di PondFlow dirancang dengan prinsip **"Smart by Default, AI-Enhanced"**:

```
Data Siklus
    │
    ▼
[Layer 1] Rule Engine          ← Selalu jalan, offline, gratis
    │  Hasilkan: skor, flags, data terstruktur
    ▼
[Layer 2] Gemini API           ← Jalan jika online & kuota tersedia
    │  Ubah data menjadi narasi bahasa Indonesia yang natural
    ▼
[Fallback] Teks Statis         ← Jika Gemini gagal/offline
    │  Template kalimat dari rule engine
    ▼
Tampilkan ke User
```

**Keuntungan pendekatan ini:**
- User tetap dapat insight meski offline (rule engine)
- Tidak ada biaya tambahan — free tier Gemini 1.500 req/hari lebih dari cukup
- Dapat di-upgrade ke model berbayar kapan saja tanpa mengubah arsitektur

---

## 2. Rule Engine — Parameter & Threshold

Semua threshold berdasarkan standar budidaya ikan air tawar Indonesia (lele, nila, mas, gurame).

### 2.1 FCR (Feed Conversion Ratio)
> FCR = Total Pakan yang diberikan (kg) ÷ Total Panen (kg)

| Nilai FCR | Grade | Label | Warna |
|---|---|---|---|
| < 1.2 | A+ | Sangat Efisien | Hijau tua |
| 1.2 – 1.4 | A | Efisien | Hijau |
| 1.4 – 1.7 | B | Normal | Kuning |
| 1.7 – 2.0 | C | Di bawah rata-rata | Oranye |
| > 2.0 | D | Tidak Efisien | Merah |

**Insight yang dihasilkan (contoh):**
- FCR B: *"Konversi pakan normal. Masih ada ruang efisiensi ~0.2 poin — coba evaluasi waktu pemberian pakan (pagi & sore lebih efektif dari siang)."*
- FCR D: *"FCR sangat tinggi — setiap 2 kg pakan hanya menghasilkan 1 kg ikan. Kemungkinan penyebab: overfeeding, kualitas pelet rendah, atau kondisi air buruk yang menghambat nafsu makan."*

---

### 2.2 Margin Keuntungan (Profit Margin)
> Margin = (Laba Kotor ÷ Total Pendapatan) × 100%

| Margin | Grade | Label |
|---|---|---|
| > 35% | A | Sangat Profit |
| 25% – 35% | B | Profit Baik |
| 15% – 25% | C | Margin Tipis |
| 5% – 15% | D | Hampir BEP |
| < 5% | F | Rugi / BEP |

---

### 2.3 Proporsi Biaya Pakan
> Feed Cost Ratio = Total Biaya Pakan ÷ Total Biaya Produksi × 100%

| Rasio | Status | Insight |
|---|---|---|
| < 55% | Sehat | Struktur biaya seimbang |
| 55% – 65% | Normal | Rata-rata industri |
| 65% – 75% | Waspada | Pertimbangkan efisiensi pakan |
| > 75% | Kritis | Biaya pakan mendominasi — segera evaluasi |

---

### 2.4 Survival Rate (Tingkat Hidup)
> Survival Rate = (Estimasi Jumlah Panen ÷ Jumlah Benih Tebar) × 100%
> *(Estimasi jumlah panen = total berat panen ÷ bobot rata-rata per ekor)*

| SR | Grade | Label |
|---|---|---|
| > 90% | A | Sangat Baik |
| 80% – 90% | B | Baik |
| 70% – 80% | C | Normal |
| 60% – 70% | D | Di bawah standar |
| < 60% | F | Buruk — investigasi |

---

### 2.5 Efisiensi Waktu (Durasi Siklus)
> Dibandingkan antara `actual_duration` vs `target_duration`

| Deviasi | Status | Insight |
|---|---|---|
| ≤ 0 hari | On time | Tepat atau lebih cepat dari target |
| 1 – 7 hari | Slight delay | Sedikit terlambat, masih wajar |
| 8 – 14 hari | Delay | Evaluasi faktor penghambat pertumbuhan |
| > 14 hari | Significant delay | Kemungkinan masalah pakan, cuaca, atau penyakit |

---

### 2.6 Tren HPP (vs Siklus Sebelumnya)
> Dibandingkan HPP/kg siklus saat ini vs rata-rata 3 siklus terakhir di kolam yang sama.

| Perubahan HPP | Status |
|---|---|
| Turun > 10% | Efisiensi meningkat — bagus |
| Turun 0–10% | Sedikit membaik |
| Naik 0–10% | Sedikit memburuk — perhatikan |
| Naik 10–25% | Meningkat signifikan — investigasi |
| Naik > 25% | Kenaikan drastis — ada anomali |

---

## 3. Scoring System — Skor Siklus

Setiap siklus mendapat **Skor Gabungan** dari semua parameter:

```
Skor = (FCR_grade × 30%) + (Margin_grade × 35%) + (SR_grade × 20%) + (FCR_cost_grade × 15%)
```

| Skor | Grade | Arti |
|---|---|---|
| 85 – 100 | 🏆 A | Siklus Sangat Baik |
| 70 – 84 | ✅ B | Siklus Baik |
| 55 – 69 | ⚠️ C | Perlu Perbaikan |
| < 55 | 🔴 D | Siklus Bermasalah |

---

## 4. Workflow Lengkap AI Insight

```
┌─────────────────────────────────────────────────────────────┐
│  USER: Klik "Tutup Siklus & Lihat Laporan"                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 1: Kalkulasi HPP (Sinkron, di browser)                │
│                                                             │
│  • Ambil semua expense yang linked ke cycle_id              │
│  • Hitung: total_expense, total_income, HPP/kg              │
│  • Hitung: FCR, margin%, survival_rate                      │
│  • Simpan ke tabel harvest_reports (Supabase)               │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 2: Rule Engine (Sinkron, di browser)                  │
│                                                             │
│  • Evaluasi setiap parameter vs threshold                   │
│  • Hasilkan: array of InsightFlag[]                         │
│  • Hitung: composite_score, grade (A/B/C/D)                 │
│  • Siapkan: fallback_text (teks statis per insight)         │
│                                                             │
│  Output JSON:                                               │
│  {                                                          │
│    grade: "B",                                              │
│    score: 74,                                               │
│    flags: [                                                 │
│      { param: "fcr", value: 1.6, grade: "B",               │
│        message: "Konversi pakan normal..." },               │
│      { param: "margin", value: 18, grade: "C",             │
│        message: "Margin tipis..." }                         │
│    ],                                                       │
│    cycle_summary: { fish_type, duration, hpp_per_kg, ... }  │
│  }                                                          │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 3: Cek Koneksi & Kuota Gemini (Async)                 │
│                                                             │
│  ┌── Online & kuota OK ──────────────────────────────────┐  │
│  │                                                        │  │
│  │  Kirim ke Next.js API Route: POST /api/ai/insight      │  │
│  │                                                        │  │
│  │  Prompt ke Gemini:                                     │  │
│  │  "Kamu adalah ahli budidaya ikan. Berikan analisis     │  │
│  │   singkat dan rekomendasi konkret berdasarkan data     │  │
│  │   siklus berikut: [JSON data]. Gunakan bahasa          │  │
│  │   Indonesia sederhana. Format: [narasi 3 kalimat]      │  │
│  │   lalu [3 bullet rekomendasi aksi]."                   │  │
│  │                                                        │  │
│  │  Response Gemini → simpan ke ai_insights tabel         │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌── Offline / Limit Tercapai / Error ───────────────────┐  │
│  │  Gunakan fallback_text dari Rule Engine                │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────┐
│  STEP 4: Render Halaman Laporan + AI Insight                │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  🏆 SKOR SIKLUS: B (74/100)                         │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  📊 HPP/kg: Rp 18.500  |  Margin: 18%  |  FCR: 1.6 │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  🤖 ANALISIS AI                                      │    │
│  │  "Siklus ini menghasilkan keuntungan namun margin    │    │
│  │   masih di bawah target 25%. Komponen terbesar       │    │
│  │   adalah pakan (68% dari total biaya)..."            │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  ✅ REKOMENDASI UNTUK SIKLUS BERIKUTNYA              │    │
│  │  • Kurangi frekuensi pakan di atas pukul 12 siang   │    │
│  │  • Pertimbangkan pelet protein tinggi untuk FCR ↓   │    │
│  │  • Target harga jual minimal Rp 21.000/kg           │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │  📈 TREN vs 3 SIKLUS TERAKHIR                       │    │
│  │  HPP: Rp17k → Rp17.5k → Rp18k → Rp18.5k (↑ naik)  │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

---

## 5. Prompt Engineering — Template Gemini

### System Prompt
```
Kamu adalah konsultan ahli budidaya ikan air tawar yang berpengalaman
di Indonesia. Tugasmu menganalisis data hasil panen dan memberikan
rekomendasi praktis yang bisa langsung diterapkan oleh peternak.

Gunakan bahasa Indonesia yang sederhana dan mudah dipahami.
Hindari istilah teknis yang tidak perlu. Bersikap positif tapi jujur.
```

### User Prompt Template
```
Berikut data hasil panen siklus budidaya ikan:

Jenis Ikan   : {fish_type}
Durasi Siklus: {duration} hari (target: {target_duration} hari)
Jumlah Benih : {seed_count} ekor

HASIL FINANSIAL:
- HPP/kg       : Rp {hpp_per_kg}
- Harga Jual   : Rp {price_per_kg}/kg
- Margin       : {margin_percent}%
- Total Profit : Rp {gross_profit}

EFISIENSI PRODUKSI:
- FCR          : {fcr} (optimal < 1.4)
- Survival Rate: {survival_rate}%
- Biaya Pakan  : {feed_cost_ratio}% dari total biaya

PENILAIAN SISTEM:
- Skor Siklus  : {score}/100 (Grade {grade})
- Flag Masalah : {flags_summary}

Berikan:
1. Analisis singkat (3–4 kalimat) tentang performa siklus ini
2. Tepat 3 rekomendasi aksi konkret untuk siklus berikutnya
   (format: mulai dengan kata kerja, spesifik, bisa langsung dilakukan)
```

### Expected Output Format
```json
{
  "analysis": "Siklus ini...",
  "recommendations": [
    "Kurangi frekuensi pemberian pakan...",
    "Gunakan probiotik pada minggu ke-3...",
    "Targetkan penjualan pada bobot 250–300 gram..."
  ]
}
```

---

## 6. Tabel Database Tambahan

```sql
-- Menyimpan hasil AI Insight per siklus
CREATE TABLE ai_insights (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cycle_id        UUID NOT NULL REFERENCES cycles(id) ON DELETE CASCADE,
  harvest_report_id UUID REFERENCES harvest_reports(id),

  -- Rule Engine Output
  composite_score NUMERIC NOT NULL,      -- 0–100
  grade           TEXT NOT NULL,         -- A/B/C/D/F
  flags           JSONB NOT NULL,        -- array InsightFlag[]

  -- AI Narrative (Gemini)
  ai_analysis     TEXT,                  -- narasi dari Gemini
  ai_recommendations JSONB,             -- array string rekomendasi
  ai_model        TEXT DEFAULT 'gemini-2.0-flash',
  ai_generated_at TIMESTAMPTZ,

  -- Fallback flag
  used_fallback   BOOLEAN DEFAULT false, -- true jika Gemini tidak tersedia

  generated_at    TIMESTAMPTZ DEFAULT now()
);
```

---

## 7. Estimasi Pemakaian Gemini Free Tier

| Skenario | Request/Bulan | Status |
|---|---|---|
| 10 user, masing-masing 5 siklus/bulan | 50 req | ✅ Aman |
| 50 user, masing-masing 3 siklus/bulan | 150 req | ✅ Aman |
| 200 user, masing-masing 4 siklus/bulan | 800 req | ✅ Aman |
| 500 user, masing-masing 5 siklus/bulan | 2.500 req | ⚠️ Upgrade ke paid |

**Batas free tier Gemini 2.0 Flash:** 1.500 req/hari = ~45.000 req/bulan
→ Sangat cukup hingga ratusan user aktif.

---

## 8. Upgrade Path (Masa Depan)

Jika kebutuhan meningkat atau ingin model lebih powerful:

| Kondisi | Rekomendasi |
|---|---|
| > 500 MAU | Tetap free tier, masih aman |
| Butuh analisis lebih mendalam | Gemini 1.5 Pro (berbayar, ~$0.00125/req) |
| Ingin model lokal / privasi penuh | Ollama + Llama 3 (self-hosted, gratis) |
| Enterprise | OpenAI GPT-4o Mini (~$0.00015/req) |

---

*PondFlow AI Insight Spec v1.0 — NasLabs.id*
