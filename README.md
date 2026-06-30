# 🐟 PondFlow

Aplikasi Mobile & PWA manajemen keuangan budidaya ikan. Catat pengeluaran, pemasukan, hitung HPP otomatis, dapatkan rekomendasi AI pasca panen, dan push notifikasi otomatis. Dibangun dengan Next.js 14, Supabase, Google Gemini, dan Capacitor (Android & iOS).

## Fitur Utama

- 📊 **Dasbor Analisis Tren Finansial**: Grafik tren keuangan interaktif dengan kustomisasi filter waktu (Minggu Ini, Bulan Ini, 6 Bulan Terakhir, dan Tahun Ini).
- 🔔 **Notifikasi Otomatis (PWA & Mobile)**: Sistem push notifikasi lokal otomatis di desktop (PWA) dan HP (Android/iOS via Capacitor) untuk memberikan peringatan stok menipis, batas panen, dan jadwal pakan harian.
- 🕒 **Sistem Salam Terlokalisasi**: Ucapan selamat pagi/siang/sore/malam yang otomatis sinkron dengan waktu lokal perangkat pengguna serta mendukung bahasa Indonesia & Inggris.
- 📈 **Hitung HPP Otomatis**: Memantau biaya operasional dan memperkirakan keuntungan bersih di setiap siklus kolam.
- 🤖 **Rekomendasi AI Pasca Panen**: Rekomendasi taktis berbasis kecerdasan buatan dari Google Gemini untuk meningkatkan hasil budidaya ikan berikutnya.

## Panduan Memulai

### Prasyarat
- Node.js (v18 ke atas)
- Akun & Database Supabase
- Google Gemini API Key

### Instalasi & Menjalankan Lokal

1. Klon repositori ini:
   ```bash
   git clone https://github.com/rifkinasss/Pond-Flow.git
   cd Pond-Flow
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```
3. Konfigurasikan berkas `.env.local` dengan mengisi variabel lingkungan yang dibutuhkan (gunakan `.env.example` sebagai referensi).
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Build untuk Mobile (Capacitor)

1. Lakukan build aplikasi Next.js dan sinkronisasi Capacitor:
   ```bash
   npm run mobile
   ```
2. Untuk membuka proyek native di Android Studio / Xcode:
   - **Android**: `npx cap open android`
   - **iOS**: `npx cap open ios`

## Rencana Pengembangan Selanjutnya (Roadmap)

### Versi v1.1.0 (Minor Update)
- 🔒 **Autentikasi OTP (One-Time Password)**: Integrasi verifikasi kode OTP via WhatsApp atau Email untuk login/pendaftaran yang lebih praktis dan aman di perangkat mobile.
- 📄 **Ekspor Laporan Keuangan (PDF & Excel)**: Fitur satu-klik untuk mencetak pencatatan transaksi keuangan, HPP, dan performa panen menjadi berkas laporan profesional siap cetak.

### Versi Pengembangan Lanjutan (Future Backlog)
- 📸 **Scan Nota Belanja Otomatis (AI OCR)**: Cukup ambil foto nota/kuitansi belanja pakan atau obat-obatan, AI Gemini akan secara otomatis membaca data teks dan mencatat nominal pengeluaran ke database.
- 📈 **Prediksi Panen & Simulasi Keuntungan AI**: Perhitungan simulasi kelayakan tebar benih dan proyeksi laba bersih berdasarkan input perkiraan pakan dan masa pemeliharaan menggunakan model AI.
- 📅 **Pengingat Pakan & Rekomendasi Takaran**: Alarm terjadwal harian via notifikasi disertai rekomendasi kalkulasi berat pakan ideal berdasarkan umur benih ikan saat itu untuk menghemat FCR.
- 🌊 **Dashboard Realtime Kualitas Air (IoT)**: Integrasi sensor kualitas air kolam (pH, Suhu, Kadar Oksigen) dengan notifikasi darurat realtime jika kondisi air memburuk.
- 📊 **Kalkulator FCR (Feed Conversion Ratio)**: Menghitung efisiensi konsumsi pakan terhadap berat total ikan saat panen untuk membantu evaluasi pakan terbaik.
- 🦠 **Diagnosis Penyakit Ikan dengan AI**: Ambil foto kondisi fisik ikan yang bergejala sakit, AI Gemini akan mendeteksi jenis penyakit dan memberikan rekomendasi obat serta tindakan karantina.
- 🌦️ **Integrasi Cuaca & Peringatan Dini Kolam**: Peringatan otomatis berdasarkan perkiraan cuaca setempat untuk memotong takaran pakan saat hujan guna menjaga kadar pH air.
- 🤝 **B2B Hub Penjualan Panen (Marketplace)**: Menghubungkan langsung petambak yang siap panen dengan pembeli skala besar (B2B) untuk memotong rantai tengkulak.
- 👥 **Akses Multi-Role (Owner & Staff)**: Hak akses terpisah di mana pemilik dapat melihat data keuangan sensitif, sementara staf lapangan hanya dapat menginput catatan harian pakan/kematian ikan.

