# PondFlow — Self-hosted SQLite

PondFlow memakai SQLite persisten pada backend home server dan tidak lagi membutuhkan Supabase saat runtime.

## Komponen

- Database: SQLite dengan `better-sqlite3`
- Schema final: `src/shared/lib/sqlite/schema.sql`
- Data access: `src/shared/lib/sqlite/db.ts`
- Auth: password hash `bcryptjs` dan session JWT HTTP-only dengan `jose`
- Auth API: `src/app/api/auth/*`
- IoT API: `src/app/api/iot/telemetry`
- File database: `${PONDFLOW_DATA_DIR}/pondflow.sqlite`

## Menjalankan di home server

```bash
npm ci
cp .env.example .env.local
# isi AUTH_SECRET dengan random secret panjang
npm run build
npm run start
```

Gunakan reverse proxy seperti Caddy/Nginx/Traefik untuk HTTPS. Direktori data harus persistent dan tidak boleh hilang ketika container atau aplikasi diperbarui.

Verifikasi schema:

```bash
npm run db:verify
npm run db:backup

# jalankan setelah user mendaftar
npm run admin:promote -- admin@example.com
```

SQLite menggunakan WAL mode. Gunakan `npm run db:backup` untuk membuat salinan konsisten melalui SQLite backup API. Simpan direktori backup di storage terpisah dari server utama.

## Schema final

Tabel: `users`, `sessions`, `password_reset_tokens`, `farms`, `ponds`, `pond_cycles`, `harvests`, `expenses`, `inventory_items`, `feeding_logs`, `iot_devices`, `iot_feeding_schedules`, `iot_sensor_devices`, dan `water_quality_readings`.

SQLite tidak memiliki Row Level Security. Ownership ditegakkan di server menggunakan session user dan validasi relasi farm → pond → cycle. Setiap server action wajib mendapatkan user dari session sebelum query data.

## Perbedaan dari Supabase

- Supabase Auth digantikan auth lokal.
- Supabase Realtime digantikan client refresh/polling pada fitur IoT.
- Reset password menggunakan token 15 menit. Pengiriman email sengaja nonaktif; isi `PONDFLOW_SMTP_*`, `PONDFLOW_MAIL_FROM`, lalu ubah `PONDFLOW_MAIL_ENABLED=true` ketika mailer sudah siap.
- Supabase Storage digantikan persistent volume atau object storage S3-compatible.
- Telemetry IoT langsung membaca database lokal dan tidak memakai service-role key.

Migration SQL PostgreSQL lama tidak dipakai karena konflik dengan schema yang benar-benar digunakan aplikasi. Jika data lama diperlukan, export dari sistem lama lalu buat importer CSV/JSON dengan mapping ID dan relasi secara eksplisit.
