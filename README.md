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

## Rencana Pengembangan Selanjutnya (Roadmap v1.1.0 - Minor)

- 🔒 **Autentikasi OTP (One-Time Password)**: Integrasi verifikasi kode OTP via WhatsApp atau Email untuk login/pendaftaran yang lebih aman dan praktis di perangkat mobile.

