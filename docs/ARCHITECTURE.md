# PondFlow — Arsitektur

## Ringkasan

PondFlow adalah Next.js App Router yang berjalan sebagai satu aplikasi web/PWA pada home server. Server menyajikan UI, Server Actions, API IoT, autentikasi, dan database SQLite dari host yang sama.

```text
Browser / PWA / Capacitor
          │ HTTPS
          ▼
Reverse Proxy → Next.js Home Server
                    ├── Server Components & Server Actions
                    ├── Local Auth (bcryptjs + jose cookie session)
                    ├── API IoT Telemetry
                    └── better-sqlite3 → pondflow.sqlite
```

## Batas modul

- `src/features/*`: use case dan komponen per domain.
- `src/shared/lib/sqlite/schema.sql`: satu sumber schema database.
- `src/shared/lib/sqlite/db.ts`: akses database terpusat.
- `src/shared/lib/auth.ts`: user, password hash, dan session.
- `src/shared/lib/app/server.ts`: facade server untuk halaman/actions.
- `src/shared/lib/app/client.ts`: facade browser untuk auth API.
- `src/app/api/auth/*`: endpoint login, register, logout, me, dan forgot password.
- `src/shared/lib/admin.ts`: guard untuk role `admin` dan `superadmin`.

## Ownership dan keamanan

SQLite tidak menyediakan RLS. Server harus selalu mengambil user dari session terlebih dahulu, kemudian membatasi query dengan `user_id` atau memvalidasi relasi farm/pond/cycle. `AUTH_SECRET` tidak boleh memakai nilai default pada production. Database dan device secret tidak boleh diekspos ke client.

## Operasional

SQLite dijalankan dengan foreign keys dan WAL mode. Letakkan `PONDFLOW_DATA_DIR` pada persistent volume. Gunakan HTTPS reverse proxy dan backup terjadwal. Jalankan `npm run db:verify` setelah deployment.

## IoT

Hardware mengirim `X-Device-Code` dan `X-Device-Secret` ke `POST /api/iot/telemetry`. Reading dan status device disimpan dalam database lokal. Supabase Auth, Realtime, dan Storage tidak digunakan saat runtime.

## Schema dan migration

Schema final mengikuti tabel yang dipanggil kode aplikasi: `users`, `sessions`, `farms`, `ponds`, `pond_cycles`, `harvests`, `expenses`, `inventory_items`, `feeding_logs`, `iot_devices`, `iot_sensor_devices`, dan `water_quality_readings`. Schema PostgreSQL lama memiliki konflik (`cycles` vs `pond_cycles` dan dua versi `expenses`), sehingga data lama harus di-export/import dengan mapping ID dan relasi.

Role pertama dibuat melalui `npm run admin:promote -- email@example.com` setelah akun terdaftar. Login tetap satu halaman; sidebar admin tampil berdasarkan role session.
