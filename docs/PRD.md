# Product Requirements Document (PRD)
# PondFlow — Aplikasi Manajemen Keuangan Budidaya Ikan

| Atribut         | Detail                                          |
|-----------------|--------------------------------------------------|
| **Nama Produk** | PondFlow                                        |
| **Versi**       | 1.0.0                                           |
| **Status**      | Draft — Keputusan Teknis Final                  |
| **Author**      | NasLabs.id                                      |
| **Tanggal**     | 2025                                            |
| **Platform**    | Next.js (TSX) + PWA — Web & Mobile              |
| **Database**    | Supabase (PostgreSQL)                           |
| **Auth**        | Supabase Auth                                   |

---

## 1. Latar Belakang

Pelaku usaha budidaya ikan (aquaculture) skala kecil hingga menengah seringkali mengelola keuangan secara manual menggunakan buku catatan atau spreadsheet sederhana. Cara ini rentan terhadap kesalahan, tidak real-time, dan sulit menghasilkan analisis yang akurat.

**Masalah utama yang dihadapi:**
- Pencatatan pengeluaran (pakan, obat, listrik, tenaga kerja) yang tidak terstruktur
- Tidak ada perhitungan HPP (Harga Pokok Produksi) yang akurat per siklus panen
- Sulit membandingkan performa antar kolam atau antar siklus
- Tidak ada laporan keuangan yang bisa dijadikan dasar pengambilan keputusan bisnis

**PondFlow** hadir untuk menyelesaikan masalah ini dengan sistem pencatatan yang terstruktur, kalkulasi otomatis, dan laporan yang mudah dipahami.

---

## 2. Tujuan Produk

### 2.1 Tujuan Bisnis
- Membantu pelaku budidaya ikan meningkatkan efisiensi pengelolaan keuangan
- Menyediakan data akurat sebagai dasar pengambilan keputusan bisnis
- Mendorong pertumbuhan usaha budidaya yang lebih terukur dan profitable

### 2.2 Tujuan Teknis
- Membangun sistem pencatatan keuangan yang mudah digunakan (user-friendly)
- Mengotomatisasi perhitungan HPP, laba/rugi, dan laporan keuangan dasar
- Menyediakan arsitektur yang scalable untuk penambahan fitur di masa depan

---

## 3. Target Pengguna

### Primary User
- **Pemilik usaha budidaya ikan** skala kecil–menengah (kolam tanah, kolam terpal, keramba)
- Budidaya jenis: ikan lele, nila, mas, gurame, patin, bawal, udang, dll.

### Secondary User
- **Manajer operasional** yang mengawasi beberapa kolam sekaligus
- **Akuntan / pembukuan** yang membutuhkan laporan keuangan dari unit budidaya

### User Profile
| Dimensi | Deskripsi |
|---|---|
| Usia | 20–55 tahun |
| Tech-savvy | Rendah–Menengah (prioritas kemudahan UI) |
| Skala usaha | 1–50 kolam, multi-lokasi |
| Perangkat | Smartphone Android/iOS via PWA (utama), Web browser desktop (sekunder) |

---

## 4. Ruang Lingkup (Scope)

### 4.1 In Scope (Versi 1.0)
- ✅ Autentikasi pengguna (Supabase Auth — email/password)
- ✅ Manajemen lokasi / farm (multi-lokasi tambak)
- ✅ Manajemen data kolam per lokasi (nama, ukuran, jenis ikan, kapasitas)
- ✅ Pencatatan siklus budidaya (tanggal tebar benih → panen)
- ✅ Pencatatan pengeluaran operasional per kolam
- ✅ Pencatatan pemasukan (hasil penjualan panen)
- ✅ Manajemen stok pakan & saprokan (inventory)
- ✅ Perhitungan HPP otomatis per siklus panen
- ✅ Laporan laba/rugi per siklus dan per periode
- ✅ Dashboard ringkasan keuangan
- ✅ PWA (installable, mobile-friendly, offline-ready)
- ✅ AI Insight — rekomendasi & analisis otomatis pasca panen (Rule-based + Google Gemini free tier)

### 4.2 Out of Scope (Versi 1.0)
- ❌ Integrasi dengan platform e-commerce / marketplace ikan
- ❌ Manajemen pegawai / penggajian (payroll)
- ❌ Fitur sosial / community
- ❌ Prediksi harga pasar ikan (AI/ML)
- ❌ Kirim laporan otomatis via WhatsApp / email
- ❌ Multi-user collaboration (dipertimbangkan v2.0)

---

## 5. Fitur & Kebutuhan Fungsional

### 5.1 Modul Manajemen Kolam

**FR-01: Data Kolam**
- User dapat menambah, mengedit, dan menonaktifkan data kolam
- Atribut kolam: nama, tipe (tanah/terpal/beton/keramba), ukuran (m²/m³), lokasi, status (aktif/tidak aktif)

**FR-02: Siklus Budidaya**
- User dapat membuat siklus baru per kolam (tebar benih)
- Atribut siklus: tanggal mulai, jenis ikan, jumlah benih (ekor), bobot awal benih (gram), harga benih (Rp/ekor), target panen
- Satu kolam bisa memiliki banyak siklus (historis tersimpan)

---

### 5.2 Modul Pencatatan Pengeluaran

**FR-03: Kategori Pengeluaran**

Aplikasi menyediakan kategori pengeluaran standar budidaya:

| Kode | Kategori | Contoh Item |
|---|---|---|
| EXP-01 | Benih | Benih lele, nila, dll. |
| EXP-02 | Pakan | Pelet, cacing, maggot |
| EXP-03 | Obat & Vitamin | Probiotik, kapur dolomit, antibiotik |
| EXP-04 | Kualitas Air | Aerator, pompa, listrik aerasi |
| EXP-05 | Tenaga Kerja | Upah harian/bulanan |
| EXP-06 | Listrik & Air | Tagihan listrik, biaya air |
| EXP-07 | Peralatan | Jaring, ember, seser (depresiasi) |
| EXP-08 | Sewa Lahan | Biaya sewa kolam/lahan |
| EXP-09 | Transportasi | Ongkos distribusi hasil panen |
| EXP-10 | Lain-lain | Pengeluaran tidak terkategori |

**FR-04: Input Pengeluaran**
- User mencatat pengeluaran dengan: tanggal, kategori, nama item, jumlah, satuan, harga satuan, total, dan keterangan opsional
- Pengeluaran bisa dihubungkan ke kolam tertentu atau dicatat sebagai pengeluaran umum (overhead)
- Mendukung pengeluaran berulang (recurring) — contoh: pakan harian

---

### 5.3 Modul Pencatatan Pemasukan

**FR-05: Input Pemasukan Panen**
- User mencatat hasil panen dengan: tanggal panen, kolam, siklus, total berat panen (kg), harga jual (Rp/kg), pembeli (opsional), total nilai penjualan
- Mendukung panen bertahap (partial harvest) dalam satu siklus

**FR-06: Pemasukan Non-Panen**
- User dapat mencatat pemasukan lain yang terkait bisnis (misal: jual benih, konsultasi, dll.)

---

### 5.4 Modul Perhitungan HPP

**FR-07: Kalkulasi HPP**

Formula HPP yang digunakan:

```
Total Biaya Produksi = Σ semua pengeluaran dalam 1 siklus
                       (benih + pakan + obat + listrik + TK + overhead)

HPP per Kg = Total Biaya Produksi / Total Hasil Panen (kg)

Laba Kotor = Total Pemasukan - Total Biaya Produksi

Margin (%) = (Laba Kotor / Total Pemasukan) × 100

Feed Conversion Ratio (FCR) = Total Pakan (kg) / Total Panen (kg)
```

- Kalkulasi dilakukan otomatis saat siklus ditandai "selesai/panen"
- User dapat melihat breakdown biaya per kategori

---

### 5.5 Modul Laporan

**FR-08: Laporan Per Siklus**
- Ringkasan satu siklus: total biaya, total pendapatan, laba/rugi, HPP/kg, FCR
- Breakdown pengeluaran per kategori (tabel + chart pie)

**FR-09: Laporan Periodik**
- Laporan bulanan / triwulanan / tahunan
- Grafik tren pemasukan vs pengeluaran
- Perbandingan antar kolam

**FR-10: Dashboard Utama**
- Ringkasan status semua kolam (aktif/panen/kosong)
- Total pemasukan & pengeluaran bulan berjalan
- Siklus yang sedang berjalan dengan estimasi hari menuju panen
- Alert: siklus yang sudah melewati target panen

**FR-11: Export Laporan**
- Export ke format PDF dan/atau Excel

---

### 5.6 Modul AI Insight

**FR-12: Rule-Based Insight Engine**

Sistem menganalisis data siklus secara otomatis menggunakan threshold standar budidaya ikan dan menghasilkan insight berbasis aturan (tidak butuh API eksternal):

| Parameter | Threshold Optimal | Insight yang Dihasilkan |
|---|---|---|
| FCR (Feed Conversion Ratio) | < 1.4 (excellent), 1.4–1.7 (normal), > 1.7 (buruk) | Efisiensi pakan, rekomendasi jenis/frekuensi pakan |
| Margin Keuntungan | > 30% (bagus), 20–30% (cukup), < 20% (waspada) | Analisis komponen biaya terbesar, saran efisiensi |
| Biaya Pakan / Total Biaya | < 60% (sehat), > 70% (tinggi) | Proporsi pakan terhadap total biaya produksi |
| Survival Rate | > 85% (bagus), 70–85% (normal), < 70% (buruk) | Estimasi tingkat hidup benih, rekomendasi manajemen |
| Durasi Siklus | Dibanding target panen | Apakah siklus lebih lama dari rencana, penyebab & solusi |
| Tren HPP | Bandingkan dengan siklus sebelumnya | Apakah HPP naik/turun dibanding historis |

**FR-13: AI Narrative (Google Gemini Free Tier)**

Rule engine menghasilkan data terstruktur → dikirim ke Gemini API → Gemini mengubahnya menjadi narasi bahasa Indonesia yang mudah dipahami.

- Engine: **Google Gemini 2.0 Flash** (gratis, 1.500 request/hari)
- Input: ringkasan data siklus + hasil rule engine (JSON)
- Output: paragraf narasi 3–5 kalimat + bullet poin rekomendasi aksi
- Fallback: jika Gemini tidak tersedia (offline/limit), tampilkan insight rule-based saja dalam format teks statis

**FR-14: Tampilan AI Insight di Laporan Siklus**

Setelah siklus ditutup, halaman laporan menampilkan:
1. **Kartu Skor Siklus** — nilai A/B/C/D berdasarkan kombinasi FCR + margin + survival rate
2. **Highlight Utama** — 2–3 insight terpenting dengan ikon dan warna (hijau/kuning/merah)
3. **Narasi AI** — paragraf analisis dari Gemini
4. **Rekomendasi Aksi** — daftar langkah konkret untuk siklus berikutnya
5. **Perbandingan Historis** — tren HPP & FCR dibanding 3 siklus terakhir (jika ada)

**FR-15: Insight Dashboard (Live Cycle)**

Selama siklus berjalan (belum panen), dashboard menampilkan:
- Estimasi HPP sementara berdasarkan pengeluaran yang sudah dicatat
- Alert dini: "Pengeluaran pakan sudah 68% dari total — di atas rata-rata siklus sebelumnya"
- Countdown hari menuju target panen

---

## 6. Kebutuhan Non-Fungsional

| ID | Kategori | Kebutuhan |
|---|---|---|
| NFR-01 | Usability | UI harus sederhana; bisa dioperasikan oleh pengguna dengan literasi digital rendah |
| NFR-02 | Performance | Halaman utama & form input harus load < 2 detik |
| NFR-03 | Availability | Mendukung mode offline (data tersimpan lokal, sync saat online) |
| NFR-04 | Data Integrity | Semua transaksi tidak bisa dihapus permanen (soft delete), hanya diarsipkan |
| NFR-05 | Security | Data keuangan user bersifat privat, tidak bisa diakses pihak lain |
| NFR-06 | Scalability | Arsitektur harus mendukung penambahan fitur multi-user di versi berikutnya |
| NFR-07 | Compatibility | Mendukung Android 8.0+ dan browser modern (Chrome, Firefox, Safari) |

---

## 7. Alur Pengguna (User Flow)

### Flow Utama: Siklus Budidaya Penuh

```
[1] User buka app
    └─> [2] Tambah/pilih Kolam
          └─> [3] Mulai Siklus Baru
                ├─> [4a] Catat Pengeluaran (berulang selama siklus)
                │         (pakan, obat, listrik, dll.)
                ├─> [4b] Monitor Progress + Live HPP Estimate
                │         └─> Alert dini jika biaya melebihi rata-rata
                └─> [5] Tandai Panen
                      └─> [6] Input Data Panen (berat, harga jual)
                            └─> [7] Sistem hitung HPP + jalankan Rule Engine
                                  └─> [8] Kirim data ke Gemini API (async)
                                        └─> [9] Tampilkan Laporan + AI Insight
                                              ├─> Skor Siklus (A/B/C/D)
                                              ├─> Narasi Analisis
                                              ├─> Rekomendasi Aksi
                                              └─> [10] Export / Share Laporan
```

---

## 8. Model Data (Konseptual)

### Entitas Utama

```
User (via Supabase Auth)
├── id (uuid), email, created_at
└── profiles: display_name, avatar_url

Farm (Lokasi / Usaha)
├── id, user_id, name, address, description, created_at

Pond (Kolam)
├── id, farm_id, name, type (tanah|terpal|beton|keramba)
├── size_m2, capacity_kg, status (active|inactive), created_at

Cycle (Siklus Budidaya)
├── id, pond_id, fish_type, seed_count, seed_weight_gram
├── seed_price_per_unit, start_date, target_harvest_date
├── status (active | harvested | failed), notes

Expense (Pengeluaran)
├── id, cycle_id (nullable), pond_id, farm_id
├── category, item_name, quantity, unit, price_per_unit
├── total_amount, date, notes, is_deleted

Income (Pemasukan)
├── id, cycle_id (nullable), farm_id, type (harvest | other)
├── harvest_weight_kg, price_per_kg, total_amount
├── buyer, date, notes, is_deleted

InventoryItem (Stok Pakan & Saprokan)
├── id, farm_id, name, category (feed|medicine|equipment|other)
├── unit, current_stock, minimum_stock, price_per_unit
├── last_updated

InventoryTransaction (Keluar/Masuk Stok)
├── id, item_id, type (in | out), quantity
├── reference_id (nullable -> cycle_id), date, notes

HarvestReport (Laporan HPP — generated)
├── id, cycle_id, total_expense, total_income
├── hpp_per_kg, gross_profit, margin_percent, fcr
├── generated_at
```

---

## 9. Metrik Keberhasilan (Success Metrics)

| Metrik | Target (6 bulan) |
|---|---|
| User aktif bulanan (MAU) | 500 pengguna |
| Siklus budidaya tercatat | > 1.000 siklus |
| Retensi pengguna bulan ke-2 | > 60% |
| Rating kepuasan (CSAT) | ≥ 4.2 / 5.0 |
| Waktu input pengeluaran | < 30 detik per entri |

---

## 10. Asumsi & Risiko

### Asumsi
- Pengguna memiliki smartphone Android dengan akses internet minimal
- Data harga pakan dan obat diinput manual oleh user (tidak ada integrasi harga pasar)
- Satu akun = satu usaha budidaya (single-tenant untuk v1.0)

### Risiko

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pengguna malas input data harian | Tinggi | Sederhanakan form, tambah fitur "quick entry" & pengingat |
| Koneksi internet tidak stabil di daerah tambak | Menengah | Implementasi offline-first dengan local storage |
| Variasi jenis usaha (tambak udang, keramba, dll.) | Menengah | Desain kategori yang fleksibel & customizable |
| Akurasi data rendah karena estimasi | Rendah | Tambahkan panduan & contoh pengisian di UI |

---

## 11. Roadmap

### Versi 1.0 — MVP *(Target: Q3 2025)*
- Manajemen kolam & siklus budidaya
- Pencatatan pengeluaran & pemasukan
- Kalkulasi HPP otomatis
- Dashboard & laporan dasar
- Export PDF/Excel

### Versi 1.5 — Enhancement *(Target: Q4 2025)*
- Reminder / notifikasi jadwal pakan dan panen
- Template pengeluaran berulang (recurring)
- Perbandingan performa antar siklus

### Versi 2.0 — Scale *(Target: Q1 2026)*
- Multi-user & role management (pemilik, operator, akuntan)
- Cloud sync & backup otomatis
- Integrasi dengan aplikasi akuntansi (Accurate, dll.)
- Analitik lanjutan & rekomendasi efisiensi biaya

---

## 12. Keputusan Teknis (OQ — Resolved)

| # | Pertanyaan | Keputusan |
|---|---|---|
| OQ-01 | Platform apa? | ✅ **Next.js (TSX) + PWA** — Web-first, installable di mobile |
| OQ-02 | Perlu autentikasi? | ✅ **Ya — Supabase Auth** (email/password, extensible ke OAuth) |
| OQ-03 | Multi-lokasi? | ✅ **Ya** — entitas `Farm` sebagai root, satu user bisa punya banyak Farm |
| OQ-04 | Laporan via WA/email? | 🔜 **Tidak untuk v1.0** — dipertimbangkan v1.5 |
| OQ-05 | Stok pakan (inventory)? | ✅ **Ya** — modul `inventory` dengan tracking stok masuk/keluar |

---

*Dokumen ini adalah living document — akan diperbarui seiring perkembangan project.*

*PondFlow PRD v1.0 — Tanamin Bumi Nusantara*
