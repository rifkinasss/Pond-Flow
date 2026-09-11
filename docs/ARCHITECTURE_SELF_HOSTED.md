# PondFlow — Arsitektur Self-hosted

PondFlow berjalan sebagai satu aplikasi Next.js pada home server. Server menyajikan UI, Server Actions, API IoT, autentikasi, dan database SQLite dari host yang sama.

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

`src/shared/lib/sqlite/schema.sql` adalah satu sumber schema. `src/shared/lib/sqlite/db.ts` menjadi akses database terpusat. Ownership data ditegakkan di server menggunakan session user dan relasi farm → pond → cycle karena SQLite tidak memiliki RLS.

SQLite berjalan dengan foreign keys dan WAL mode. Letakkan `PONDFLOW_DATA_DIR` pada persistent volume, gunakan HTTPS reverse proxy, backup terjadwal, dan jalankan `npm run db:verify` setelah deployment.

Hardware mengirim `X-Device-Code` dan `X-Device-Secret` ke `POST /api/iot/telemetry`. Supabase Auth, Supabase Realtime, dan Supabase Storage tidak lagi digunakan saat runtime. Realtime IoT menggunakan data SSR dan polling/refresh client.

Schema PostgreSQL lama tidak dipakai karena memiliki konflik (`cycles` vs `pond_cycles` dan dua versi `expenses`). Migrasi data lama harus dilakukan melalui export/import dengan mapping ID dan relasi.
