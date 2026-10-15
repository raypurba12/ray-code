# AGENTS.md — Instruksi Permanen untuk Coding Agent (Raycode)

> **WAJIB DIBACA SETIAP SESI BARU.** Sebelum menulis kode apapun, baca `docs/PROJECT_STATUS.md` dan `docs/WORKLOG.md` secara berurutan. Dokumen tersebut adalah single source of truth untuk status proyek, audit, dan keputusan yang masih berjalan.

---

## 1. Aturan Sesi Baru (Persistent Memory)

1. **Baca dulu, baru coding.** Urutan wajib setiap sesi (termasuk setelah OpenCode ditutup/dibuka):
   ```
   1. docs/PROJECT_STATUS.md  → pahami arsitektur + status VERIFIED / IN PROGRESS / BLOCKED / NOT STARTED
   2. docs/WORKLOG.md          → pahami sesi terakhir, perintah test yang sudah dijalankan, masalah belum selesai
   3. AGENTS.md (file ini)     → patuhi aturan keamanan & konvensi
   ```
2. **Jangan anggap audit lama masih benar.** Setiap temuan di `docs/PROJECT_STATUS.md` yang bertanda `NEEDS RE-VERIFY` atau berumur >1 sesi harus diverifikasi ulang dengan membaca file aktual (`Read`) atau menjalankan test (`bash`) sebelum dikutip.
3. **Jangan menimpa informasi penting.** Jika memperbarui `PROJECT_STATUS.md` atau `WORKLOG.md`, pertahankan bagian yang masih valid. Jangan hapus konteks historis (PRD, Rancangan Pantau Pesanan) tanpa diskusi.
4. **Jangan mengubah kode aplikasi hanya untuk membuat dokumentasi terlihat benar.** Dokumentasi menyesuaikan kode, bukan sebaliknya.
5. **Jangan mencatat rahasia.** Dilarang menulis password, API key, token, atau nilai `.env` ke dokumentasi atau commit.

---

## 2. Stack — Hasil Inspeksi Repository (Verified 2026-10-10)

| Layer | Teknologi | File Bukti |
|---|---|---|
| Backend | PHP 8.2, Laravel 12.67, Inertia Laravel 3.3 | `composer.json:8-12`, `bootstrap/app.php:11` |
| Frontend | React 19.2.8, React-DOM 19.2.8, @inertiajs/react 3.7.0 | `package.json:22-28` |
| Build | Vite 7.0.7 + laravel-vite-plugin 2.0, SSR opsional via `resources/js/ssr.tsx` | `vite.config.ts:6-8`, `.env.example:85-86` (`APP_SSR=false`) |
| Style | Tailwind CSS 4 + @tailwindcss/vite 4.0 | `package.json:11-16`, `vite.config.ts:15` |
| Animasi | Framer Motion 13.1.1, lucide-react 1.34.0 | `package.json:25-26` |
| DB | MySQL 8 (prod) / SQLite (dev, `:memory:` di testing) | `.env.example:23-32`, `phpunit.xml:26-27` |
| Auth & Session | Laravel Session `database` driver, role `admin` / `client` via `users.role` | `app/Models/User.php:50-53`, `app/Http/Middleware/EnsureUserIsAdmin.php:12` |
| Payment | Midtrans Snap (HTTP direct, re-use token 14 menit, `midtrans_order_id` idempoten) | `app/Services/MidtransService.php:31`, `config/midtrans.php:1` |
| WA Notif | Fonnte / Generic Gateway / wa.me fallback via `WhatsappService` | `app/Services/WhatsappService.php:1`, `config/services.php` |
| Queue/Cache | `database` (dev), belum Redis | `.env.example:42-44` |
| Testing | PHPUnit 11.5.50, 15 tests (Feature + Unit) | `phpunit.xml:1`, `tests/Feature/*.php` |
| Code Style | Laravel Pint | `composer.json:17`, `composer.json:49` |

**Struktur Penting:**
```
app/Http/Controllers/
├── Admin/ (Dashboard, Order, Project, Service, JokiService, Portfolio, etc.)
├── Client/ (Dashboard, Project, Order, Invoice, Message)
├── Auth/AuthController.php
├── SitemapController.php, TrackOrderController.php, HomeController.php
resources/js/
├── Pages/Public/ (Home, Services, Portfolio, Blog, Pricing, Estimator, TrackOrder, CaraPesan)
├── Pages/Admin/ & Pages/Client/
├── Components/layout/ (PublicLayout, AdminLayout, ClientLayout) + SeoHead.tsx
docs/
├── PRD.md (audit 11 Sep 2026, masih relevan sebagai backlog)
├── Rancangan_Pantau_Pesanan.md (desain fitur pantau + QRIS)
├── PROJECT_STATUS.md (status terkini — WAJIB dibaca)
├── WORKLOG.md (log sesi — WAJIB dibaca)
```

---

## 3. Aturan Keamanan (Wajib)

- **Signature Midtrans** harus `hash_equals(SHA512(order_id+status_code+gross_amount+serverKey), signature_key)` dan reject `401` jika gagal — lihat `app/Services/MidtransService.php:100` dan `app/Http/Controllers/Api/MidtransWebhookController.php:27`. Jangan pernah melonggarkan menjadi warning/log saja.
- **Gross amount check** wajib sebelum update status invoice — `MidtransWebhookController.php:49`. Return `422` jika mismatch.
- **Idempoten webhook** — jika `status=paid && payment_status=settlement` return `Already settled 200`, jangan update lagi — `MidtransWebhookController.php:55`.
- **CSRF exception** hanya untuk `api/midtrans/webhook` — `bootstrap/app.php:19`. Jangan tambah exception lain tanpa review.
- **File download** harus cek `project.user_id === auth()->id() || isAdmin()` DAN `file.project_id === project.id` — `Client/ProjectController.php:32,42`.
- **Jangan expose data sensitif di pantau publik.** `TrackOrderController.php:39-47` sudah masking WA; jangan tampilkan email/WA full, harga internal, atau path storage.
- **Throttle** yang sudah ada jangan dihapus: `estimator.lead 10/60` (`routes/web.php:38`), `track 10/1`, `contact 3/1`, `login 5/1` (`routes/web.php:40-49,67-69`). Penambahan endpoint baru wajib pakai throttle.
- **Jangan klaim fitur aman hanya karena dokumentasi menyatakan aman.** Harus verifikasi dengan membaca kode aktual atau menjalankan test.

---

## 4. Testing & Verifikasi (Wajib)

- **Jangan klaim test berhasil tanpa menjalankannya.** Jalankan `php artisan test` (atau `php artisan test --compact`) dan catat hasil aktual di `docs/WORKLOG.md` sebelum menandai status `VERIFIED`.
- **Coverage saat ini rendah (15 tests).** Setiap perubahan pada `Order`, `Invoice`, `MidtransWebhook`, `Auth`, `TrackOrder` harus disertai test atau minimal menjalankan `tests/Feature/MidtransWebhookTest.php`, `OrderTest.php`, `AuthTest.php`.
- **Gunakan `RefreshDatabase` + SQLite `:memory:`** sesuai `phpunit.xml:26-27`. Jangan pakai MySQL di test kecuali eksplisit.
- **Verifikasi manual untuk payment:** gunakan Snap Sandbox (`MIDTRANS_IS_PRODUCTION=false` di `.env.example:73`) dan `POST /api/midtrans/webhook` dengan signature SHA512 yang benar, bukan mock yang mengabaikan `gross_amount`.
- **Jangan ubah `phpunit.xml` untuk menyembunyikan failure** (mis. mengubah `BCRYPT_ROUNDS` atau `CACHE_STORE` tanpa alasan).

---

## 5. Coding Conventions

- **Backend:** Ikuti style Laravel Pint (`php artisan pint` sebelum commit). Gunakan `strict` validation di Controller, `fillable` eksplisit di Model, dan `withQueryString()` untuk pagination Inertia.
- **Frontend:** React 19 + TypeScript 7 (`typescript ^7.0.2`). Gunakan `SeoHead.tsx` untuk setiap halaman publik (jangan duplikasi `<Head>` manual). Tailwind 4 dengan `cssCodeSplit: true` — jangan inline style besar.
- **Vite chunks:** Pertahankan `manualChunks` di `vite.config.ts:27-36` (`motion`, `icons`, `axios`, `vendor`). Jangan bundle `framer-motion` ke `vendor` utama (merusak LCP).
- **SSR:** Hormati `APP_SSR` / `VITE_SSR` env. Jika `false`, `vite.config.ts:6` menonaktifkan SSR. Jangan force-build SSR di shared hosting.
- **DB:** Tambah migrasi baru, jangan edit migrasi lama yang sudah ter-commit. Gunakan `order_code` dan `public_token` via `Project::booted()` (`app/Models/Project.php:15-27`).
- **Inertia shared props:** Jangan hapus `HandleInertiaRequests` sharing `auth, flash, invoice_payload, settings` tanpa mengaudit semua `usePage().props`.

---

## 6. Larangan Mengubah Fitur Tidak Terkait

- **Jangan mengubah** fitur di luar scope tugas yang diminta. Jika diminta memperbaiki `Invoice PDF`, jangan ikut mengubah `SeoHead`, `PublicLayout`, atau `JokiService` dalam commit yang sama.
- **Jangan menghapus** file `docs/PRD.md` dan `docs/Rancangan_Pantau_Pesanan.md` — keduanya adalah arsip keputusan Sprint 1-3. Jika ada yang sudah tidak relevan, tandai `DEPRECATED` di `PROJECT_STATUS.md`, jangan hapus file.
- **Jangan meng-override `.gitignore`** untuk memasukkan `lh-*.json`, `gambar/`, `public/images/*.webp` (kecuali disepakati untuk pipeline image). Aturan saat ini di `.gitignore:28-34` sengaja mengecualikan build artifact.
- **Jangan mengubah** `composer.json:35-46` script `setup`/`dev` tanpa menguji `composer setup` dari fresh clone.

---

## 7. Alur Kerja Standar

1. Baca `docs/PROJECT_STATUS.md` → pilih item `P0` teratas yang `NOT STARTED`/`IN PROGRESS` atau sesuai instruksi user.
2. Baca `docs/WORKLOG.md` → cek apakah item tersebut sudah ada sesi sebelumnya, lanjutkan dari `Unresolved`.
3. Verifikasi file terkait dengan `Read` (jangan asumsi).
4. Buat `TodoWrite` jika tugas >3 langkah.
5. Implementasi minimal, satu concern per commit.
6. Jalankan `php artisan test` dan `php artisan pint --test` (jika tersedia) — catat output.
7. Update `docs/WORKLOG.md` dengan tanggal, file yang diubah, keputusan, perintah test + hasil aktual, unresolved.
8. Update `docs/PROJECT_STATUS.md` hanya untuk item yang benar-benar diverifikasi (ubah `NOT STARTED → VERIFIED` atau `IN PROGRESS` dengan bukti).

---

## 8. Referensi Cepat

- Akun seed: `admin@raycode.dev / password`, `client@raycode.dev / password` (`README.md:98`)
- Endpoint pantau: `GET /pantau-pesanan?code=RAY-YYYYMMDD-XXXX`, `POST /track/{code}/pay` (`routes/web.php:39-45`)
- Webhook: `POST /api/midtrans/webhook` (`routes/api.php:6`)
- Sitemap: `GET /sitemap.xml` (`app/Http/Controllers/SitemapController.php:12`), Robots: `GET /robots.txt` (`routes/web.php:54`)

> Jika instruksi di `AGENTS.md` bertentangan dengan permintaan user, utamakan keamanan dan verifikasi, lalu minta klarifikasi.
