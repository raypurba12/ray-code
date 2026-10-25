# PROJECT_STATUS — Raycode Studio Platform

> **Last Verified:** 2026-10-25 (PERF A2 fix `initRevealEngine`: rect reads turun **1.194 → 48–136**, reveal desktop/mobile/broken-IO **21/21**, reduced-motion aman, `npm run build` OK, `php artisan test --compact` **65 passed (264 assertions)**; dampak TBT/LCP live menunggu deploy) + 2026-10-25 (TTFB live pasca-deploy `644857b`: TTFB curl warm **0,21–0,25 s** vs first-hit cold **1,07–1,09 s**; Lighthouse 2 run skor **69/74**, TTFB **240/990 ms**, TBT **470/320 ms**, CLS 0,001, semua route kunci 200; catatan: efek cache belum dipisahkan dari build baru + cold start hosting) + 2026-10-25 (TTFB: `deploy.sh` langkah 7/7 membangun `config:cache` + `route:cache` setelah `optimize:clear` — `route:cache` OK dengan 110 route (closure terserialisasi Laravel 12), `bash -n deploy.sh` OK, `php artisan test --compact` **65 passed (264 assertions)**) + 2026-10-25 (PERF A1/A5/A7: Chrome headless membuktikan homepage **tidak memuat video** (0 request `.mp4`) dan tidak memuat gambar tak terpakai; `raycode-faq.webp` kini punya varian 600w `69.654 B` via `srcSet` + `width/height` 900×600; `npm run build` OK, `php artisan test --compact` **65 passed (264 assertions)**) + 2026-10-24 (Audit alur deploy logo: document root = `~/public_html` bukan `~/ray-code/public`; `deploy.sh` diperluas menyalin aset statis non-build + backup selektif — dry-run sandbox lulus, `php artisan test` **65 passed (264 assertions)** setelah `extension=zip` aktif di Laragon; Lighthouse live **skor 81** setelah build `fea4fb6` ter-deploy. **Deploy produksi sudah berjalan sendiri via cron `auto-deploy.sh` (commit `edeb2ff`): `https://raycode.my.id/ray-logo.png` = 200 dan md5-nya identik dengan repo**) + 2026-10-17 (PERF A3 mousemove: `getBoundingClientRect` dipindah ke dalam rAF, hapus handler spotlight duplikat ServiceCard/WorkCard, cache rect drag Before/After, fix link-drag mouse via `onDragStart` di anchor — puppeteer 6/6, `php artisan test` 64 passed + 1 skipped) + 2026-10-16 (UTC+7, sesi Blog Cover Upload, Fix `/admin/portfolios` blank, Login khusus admin, Hover fill card layanan, Audit + P0/P1 Pantau Pesanan: bayar per-invoice/noindex/unduh file/WA notif/histori foto/ringkasan/stepper/countdown/salin, Fix upload foto admin nested-form + meta csrf, Deploy batch ke GitHub)**  
> **Branch:** `main` — HEAD `644857b` == `origin/main` (diperbarui 2026-10-25; memuat `deploy.sh` 7/7 + build `Home-CyEmfl40.js`; catatan lama `feature/admin-improvements-phase-2`/`a26a02b` sudah tidak berlaku). Bukti server mengikuti `main`: push `edeb2ff` → cron `auto-deploy.sh` menjalankan `deploy.sh` tanpa perintah manual dan aset statis dari repo langsung muncul di `raycode.my.id`.  
> **Verified by:** 2026-10-16 — `php artisan test` 64 passed + 1 skipped (251 assertions) + `npm run build` OK + `pint --test` passed + emulasi upload HTTP nyata (lihat `docs/WORKLOG.md`; riwayat lama: inspeksi `npm run build` 1.106 MB/58 file + `public/images` 4,1 MB + `portfolio_videos` 5,2 MB + `vite.config.ts`)  
> **Aturan:** Jangan anggap baris di dokumen ini benar jika bertanda `NEEDS RE-VERIFY` atau berumur >1 sesi tanpa cek ulang `Read`/`bash`.

---

## 1. Ringkasan Arsitektur (Verified 2026-10-10)

| Layer | Detail Verified | Bukti File |
|---|---|---|
| **Backend** | PHP 8.2, Laravel 12.67, Inertia Laravel 3.3 | `composer.json:8-12`, `bootstrap/app.php:11` |
| **Frontend** | React 19.2.8, React-DOM 19.2.8, @inertiajs/react 3.7.0, Vite 7.0.7, TypeScript 7.0.2 | `package.json:22-28` |
| **Style** | Tailwind CSS 4 + @tailwindcss/vite 4, code-split `vendor/motion/icons/axios` | `vite.config.ts:15,27-36` |
| **Build** | Vite SSR opsional via `resources/js/ssr.tsx`, toggle `APP_SSR=false` / `VITE_SSR=false` | `vite.config.ts:6`, `.env.example:85-86` |
| **DB** | MySQL 8 (prod) / SQLite (dev + testing `:memory:`) | `.env.example:23-27`, `phpunit.xml:26-27` |
| **Auth** | Session `database` driver, role `admin`/`client` via `users.role`, middleware `admin` | `app/Models/User.php:50`, `app/Http/Middleware/EnsureUserIsAdmin.php:12` |
| **Payment** | Midtrans Snap direct HTTP (tanpa SDK), re-use `snap_token` 14 menit, `midtrans_order_id` idempoten | `app/Services/MidtransService.php:31`, `config/midtrans.php:1` |
| **WA** | Fonnte / Generic Gateway / `wa.me` fallback | `app/Services/WhatsappService.php:1`, `config/services.php` |
| **Queue/Cache** | `database` driver (belum Redis) | `.env.example:42-44` |

**Struktur Controller (34 file, verified `routes/web.php:1`):**
- Public: `Home, Service, Portfolio, Blog, Pricing, Faq, Estimator, Contact, TrackOrder, Sitemap`
- Auth: `Auth\AuthController` (login/register/logout + `showForgotPassword`, `sendResetLinkEmail`, `showResetPassword`, `resetPassword`)
- Client: `Dashboard, Project, Order, Invoice, Message` (`prefix dashboard`)
- Admin: `Dashboard, Order, Project, Service, JokiService, Portfolio, User, Testimonial, PricingPlan, Faq, Blog, Setting, Homepage, Estimator, Message` (`prefix admin`)
- API: `Api\MidtransWebhookController`

**Pages (41 file):** `Public/Home, Services/Index|Show|Reguler, Portfolio/Index|Show, Blog/Index|Show, Pricing, Estimator, TrackOrder, Contact, CaraPesan, Faq` + `Client/Dashboard, ProjectShow, Order, Invoices, InvoiceShow, Messages` + `Admin/*` + `Auth/Login, Register, ForgotPassword, ResetPassword`

**Migrasi (26 file):** `users (password_reset_tokens), services, portfolios, pricing_plans, testimonials, faqs, blog_posts, projects, invoices, messages, settings+contacts, joki_services, estimator_leads, project_files, + midtrans_order_id, type ENUM('package','joki'), order_code RAY-YYYYMMDD-XXXX, kind ENUM('dp','final','full')` — `database/migrations:1`

**Models:** `User, Service, Portfolio, PricingPlan, Testimonial, Faq, BlogPost, Project (order_code+public_token booted), ProjectUpdate, ProjectFile, Invoice (dp/final/full), Message, ContactMessage, Setting, JokiService, EstimatorLead`

---

## 2. Status Implementasi Fitur

> Legenda: `VERIFIED` = sudah baca file + (jika perlu) jalankan test. `IN PROGRESS` = ada kode tapi belum lengkap. `NOT STARTED` = belum ada kode. `BLOCKED` = butuh keputusan/env eksternal. `NEEDS RE-VERIFY` = temuan lama belum dicek ulang.

| Fitur | Status | Bukti / Catatan Verifikasi 2026-10-10 |
|---|---|---|
| **Auth login (khusus admin) + logout** + throttle 5/1 + session regenerate; **register dinonaktifkan** (redirect `/login`) | `VERIFIED` (2026-10-16) | `AuthController.php` (`Auth::validate` → cek `isAdmin` → `Auth::login`; `showRegister`/`register` redirect), tombol login disembunyikan di `PublicLayout.tsx` (desktop+mobile), link Daftar dihapus dari `Login.tsx`/`ForgotPassword.tsx`, CTA order `Estimator.tsx` → `/cara-pesan`; `tests/Feature/AuthTest.php` (client ditolak, register tidak membuat user) — full suite 48 passed (118 assertions) |
| **Password reset / forgot** `password.request/email/reset/update` + throttle 5/1, token 60m `password_reset_tokens` | `VERIFIED` | `AuthController.php:66-125` (showForgot, sendResetLink, showReset, reset), `routes/web.php:72-77`, `ForgotPassword.tsx:1`, `ResetPassword.tsx:1`, `Login.tsx:79` link Lupa, `routes.ts:20`, `PasswordResetTest.php:1` 7 passed, `npm run build` includes `ForgotPassword-DLgldE-d.js` + `ResetPassword-4M5LvNt4.js` |
| **Email verify** `MustVerifyEmail` | `NOT STARTED` (opsional P0-2) | `User.php` belum `MustVerifyEmail`, route `email/verify/*` belum ada — tidak diblokir, tapi client masih bisa login tanpa verify; dijadwalkan setelah P0-3 jika diperlukan enforce `verified` middleware |
| **Service paket vs Joki satuan** (unifikasi `type ENUM`) | `IN PROGRESS` | `Service.php` sudah punya `type`, migrasi `2026_09_11_000002_add_type_to_services.php` & `migrate_joki_to_services.php` VERIFIED, tapi `Admin/JokiServiceController` + `Admin/ServiceController` masih terpisah, perlu merge UI — `NEEDS RE-VERIFY` setelah commit |
| **Portfolio + Blog** (slug, sitemap) | `VERIFIED` | `PortfolioController.php`, `BlogController.php`, `SitemapController.php:24-38` |
| **Estimator + Leads** (honeypot `website`, IP throttle 10/jam) | `VERIFIED` | `EstimatorController.php:50-84`, `routes/web.php:38`, throttle `10,60` |
| **Order Client** (`POST /dashboard/order`) | `VERIFIED` | `Client/OrderController.php`, `tests/Feature/OrderTest.php:48` passed |
| **Admin Order Manual** (WA → create User+Project+Invoice DP 50% + Snap) | `VERIFIED` | `Admin/OrderController.php:34-133`, `routes/web.php:102-103`, DP label `dp 50%` |
| **Project + order_code `RAY-YYYYMMDD-XXXX`** + `public_token` | `VERIFIED` | `Project.php:15-27 booted()`, migrasi `2026_09_11_000006` |
| **Pantau Pesanan publik** `GET /pantau-pesanan?code=` + masking WA + multi-invoice + `X-Robots-Tag: noindex` + ringkasan pembayaran + stepper + countdown token + salin kode/link | `VERIFIED` (2026-10-16) | `TrackOrderController.php` (`paymentUrl` hanya jika `snap_token_expires_at` future; payload `summary` total/paid/remaining + `snapTokenExpiresAt`), `resources/js/Pages/Public/TrackOrder.tsx` (`SeoHead noIndex`, stepper, `SnapCountdown`, `router.reload` refresh, clipboard), throttle `30,1`/`10,1` |
| **Pay QRIS** `POST /track/{code}/pay` + short `GET /pay/{code}` + param `invoice` per kartu + fallback unpaid terlama + re-use token + RateLimiter 5/10m | `VERIFIED` (2026-10-16) | `TrackOrderController.php:114-155` (fix: sebelumnya selalu unpaid terbaru → tombol "Bayar DP" bisa membuat token invoice FINAL), hidden field `invoice` di `TrackOrder.tsx` 2 form bayar, test `TrackOrderTest.php` 6 passed, `MidtransService.php:31` |
| **Invoice PDF** `GET /invoice/{code}/pdf` + kind dp/final/full + `X-Robots-Tag: noindex` | `VERIFIED` aman (signed + auth fallback) | `TrackOrderController.php:157-189` VERIFIED: `hasValidSignature()` atau `auth owner/admin` else 403 (copy 403 diperbarui — dashboard client nonaktif); signed URL 30 menit via `URL::temporarySignedRoute` di `TrackOrderController.php:62` & `Admin/OrderController.php:107`; test `InvoicePdfSecurityTest.php:1` 5 passed |
| **Unduh file hasil di pantau** — signed 30m per file + zip (semua file yang diupload admin; fallback pesan bila php-zip absen) | `VERIFIED` (2026-10-16) | `routes/web.php` (`track.files.download`, `track.files.zip`, throttle `30,1`), `TrackOrderController` `downloadFile()`/`downloadFilesZip()` (signed ATAU owner/admin, cek `file.project_id`), payload `files`/`filesZipUrl` di `index()`; UI `TrackOrder.tsx` section "File Hasil"; test `TrackOrderTest.php` +3 (zip test dulu skip: php-zip belum di-enable di lokal — **RESOLVED 2026-10-24**, `extension=zip` aktif di php.ini Laragon, test ZIP jalan dan lulus) |
| **Notifikasi WA otomatis status/progress** ke klien (status berubah / progress berubah saja, try-catch non-blocking) | `VERIFIED` (2026-10-16) | `WhatsappService` `buildProjectUpdateMessage()`/`notifyProjectUpdate()` (skip bila tanpa phone); hook `Admin/OrderController@updateStatus` (bandingkan status lama) & `Admin/ProjectController@update` (progress berubah + note); test `AdminProjectNotificationTest.php` 4 passed |
| **Histori progres di pantau** — foto + notes + tanggal otomatis dari upload admin di `/admin/projects` | `VERIFIED` (2026-10-16) | Migrasi `2026_10_16_000000_add_project_update_id_to_project_files.php` (dijalankan di DB dev), `Admin/ProjectController@uploadFile` (gambar via `ImageOptimizer` 1600px, selalu create `ProjectUpdate` "Progres v{n} diunggah" + link file), `ProjectFile.projectUpdate()` (nama `update()` fatal — bentrok `Model::update()`), `TrackOrderController@index` payload `updates[].files[]` (signed `track.files.preview` inline + `track.files.download`), route `track.files.preview` throttle `60,1`, UI timeline `TrackOrder.tsx` (thumbnail klik preview + chip unduh); test `ProjectTimelineTest.php` 3 passed — full suite 63 passed, 1 skipped (230 assertions) |
| **Invoice DP/Final generate** + resend WA | `VERIFIED` | `Admin/OrderController.php:160-316` |
| **Midtrans Webhook** strict SHA512 + gross_amount check + idempoten + fallback parse | `VERIFIED` aman | `MidtransWebhookController.php:27,49,55`, `MidtransService.php:100-110`, `tests/Feature/MidtransWebhookTest.php` 4 tests passed |
| **File Deliverable** upload admin + download client + zip | `VERIFIED` | `Client/ProjectController.php:30-65` cek `project.user_id === auth && file.project_id === project.id` |
| **Testimoni client** `POST /dashboard/projects/{project}/testimonial` `is_approved=false` | `VERIFIED` | `Client/ProjectController.php:67-93` |
| **Sitemap + Robots** | `VERIFIED` | `SitemapController.php:13` (static `lastmod` now pakai latest `Service/Portfolio max updated_at`), `routes/web.php:53-58` robots `Allow:/ Disallow:/admin,/dashboard`, `sitemap.xml` dynamic |  
| **SeoHead** | `VERIFIED` | `SeoHead.tsx:1` now OG+Twitter+canonical+`og:site_name/locale`+ `hreflang id/en/x-default`+ `robots`/`noIndex`+ JSON-LD `Organization`+`WebSite` base + `BreadcrumbList` + custom `FAQPage` (`Faq.tsx:25`) + `BlogPosting` (`Blog/Show.tsx:17`) via `jsonLd` prop; `app.blade.php:2` `lang="{{ app()->getLocale() }}"` dynamic |
| **Contact** `POST /contact` throttle 3/1 + honeypot `website` | `VERIFIED` | `ContactController.php:16-19` honeypot `if filled website → success palsu`, `Contact.tsx:22` `website:''` + hidden field `absolute -left-[9999px]`, `ContactHoneypotTest.php:1` 3 passed, `Contact-BHy8Ikru.js` build |
| **Messaging Client↔Admin** | `VERIFIED` | `Client/MessageController`, `Admin/MessageController` |
| **Admin UX Phase 1 Selesai (Breadcrumb, Toast, ConfirmModal, HelpTooltip, Asterisk, Bulk)** | `VERIFIED` | `PRD_Admin_Improvements.md` Quick Wins 100%: `AdminBreadcrumb` di header, `ToastProvider` auto-catch flash, `ConfirmProvider` + `useConfirm` global (0 browser confirm), `HelpTooltip` + required asterisk `*` di form, bulk action role & delete di `Users.tsx` + route `admin.users.bulk`. `npm run build` pass, 35 tests pass (termasuk 5 tests baru di `AdminBulkUserTest.php`). |
| **Blog cover upload admin** (file JPG/PNG/WebP/GIF/BMP/AVIF, validasi ketat + resize/WebP) | `VERIFIED` (2026-10-16) | `app/Services/ImageOptimizer.php` (getimagesize whitelist, non-gambar/korup/SVG ditolak, tanpa fallback simpan mentah), `BlogController.php` (`cover_file`+`remove_cover`, hapus cover lama), `Blog.tsx` (picker+preview+cancel), `BlogCoverUploadTest.php` 9 passed; fix PUT-multipart PHP saat edit+file via `POST` + `_method=put` (`Blog.tsx`) — bukti empiris di WORKLOG 2026-10-16 |
| **Fix `/admin/portfolios` blank putih** (props paginator diperlakukan array) | `VERIFIED` (2026-10-16) | Bug pre-existing sejak commit awal: `Portfolios.tsx` kini pakai `portfolios.data.map` / `portfolios.total` sesuai serialisasi paginator Inertia; `AdminPortfoliosPageTest.php` 3 passed (`has('portfolios.data', 1)` + `where('portfolios.data.0.title')`), full suite 47 passed (118 assertions), build OK |
| **Hover fill card layanan `/services`** (biru bottom→top, light+dark, focus-visible, reduced-motion) | `VERIFIED` (build 2026-10-16; visual browser pending) | `app.css` blok `.service-card-hover`/`.service-card-hover-light` ditulis ulang: `scaleY(0)→scaleY(1)` + `origin bottom` 500ms, fill `brand-600` di kedua mode, chip kaca, text transition 450ms, `:has(:focus-visible)`; `Services/Index.tsx` card Paket dark-aware (token `bg-card`/`text-ink`/`border-line`); dipakai juga oleh `Services/Reguler.tsx` |
| **Git & Workspace** | `VERIFIED` (2026-10-16) | Working tree bersih sesi ini: seluruh pekerjaan di-commit ke branch `feature/admin-improvements-phase-2` (batch 2026-10-16: auth admin-only, blog cover, portfolios fix, hover, pantau P0/P1/timeline, fix upload admin) + push ke `origin` — lihat §6 |

---

## 3. Audit Production Readiness

Audit ini adalah kelanjutan dari `docs/PRD.md` (11 Sep 2026) + verifikasi ulang 10 Okt 2026. Temuan lama yang sudah diperbaiki ditandai `RESOLVED`.

### P0 — Blocker Sebelum Go-Live

| # | Item | Status | Bukti Verifikasi 2026-10-10 | Aksi Berikutnya |
|---|---|---|---|---|
| P0-1 | **Security headers + Invoice PDF authz** — PDF `GET /invoice/{code}/pdf` tanpa `auth` / `signed` + belum ada CSP/HSTS | `VERIFIED` (2026-10-10) | `TrackOrderController.php:138` now `hasValidSignature() \|\| auth owner/admin` + `SecurityHeaders.php:1` (CSP, HSTS, X-Frame etc.) + `bootstrap/app.php:18-24` web append `SecurityHeaders`; signed PDF `TrackOrderController.php:57`, `Admin/OrderController.php:107,252,300`; FE `TrackOrder.tsx:173` pakai `inv.pdfUrl` signed; test 5 passed `InvoicePdfSecurityTest.php:1` | Selesai — tinggal commit + pint format minor |
| P0-2 | **Password reset + email verify** | `VERIFIED` (password reset, 2026-10-10) | `AuthController.php:66-125` 4 method, `routes/web.php:72-77` 4 route (`password.request/email/reset/update`) throttle `5,1` + `passwords.users` expire 60m `config/auth.php:98`, `ForgotPassword.tsx:1` + `ResetPassword.tsx:1`, `Login.tsx:79` link, `PasswordResetTest.php:1` 7 passed | Email verify `MustVerifyEmail` masih `NOT STARTED` (opsional) — password reset sudah unblock client `wa@raycode.guest`; email verify dijadwalkan jika butuh enforce `verified` middleware |
| P0-2b | **Vite host fix** (putih kosong `[::1]:5173`) | `VERIFIED` (2026-10-10) | `vite.config.ts:13` `host 127.0.0.1 + hmr`, `public/hot` `http://127.0.0.1:5173` → dihapus fallback ke `build` manifest, `SecurityHeaders.php:11` CSP allow `localhost/127.0.0.1/[::1]` | Selesai — `Invoke-WebRequest /` now `build/assets/app-*.js` no vite client error |
| P0-3 | **Honeypot/CAPTCHA Contact** — `ContactController@store` tanpa honeypot vs Estimator sudah ada | `VERIFIED` (2026-10-10) | `ContactController.php:16` honeypot `filled('website') → success palsu` + `Contact.tsx:22` hidden `website` + `ContactHoneypotTest.php:1` 3 passed (sukses tanpa honeypot, honeypot filled tidak save, throttle 3,1) | Selesai — Turnstile opsional ditunda |
| P0-4 | **Analytics + Cookie Consent** — 0 tracking | `VERIFIED` (2026-10-10) | `.env.example:88` `GA_MEASUREMENT_ID/VITE_GA` + `PLAUSIBLE_DOMAIN` + `GOOGLE_SITE_VERIFICATION`, `config/services.php:50` `analytics`, `app.blade.php:25` consent_mode default denied + gtag/plausible conditional, `analytics.ts:1` `trackEvent/hasConsent/grant/deny` + `CookieConsent.tsx:1` banner UU PDP + `PublicLayout.tsx:8` include, CSP `SecurityHeaders.php:36` allow `googletagmanager/google-analytics/plausible`, tracker `Estimator.tsx:79` `estimator_submit`, `Contact.tsx:30` `contact_wa_click/contact_submit`, `TrackOrder.tsx:59` `track_lookup` + `183` `snap_pay_*`, `InvoiceShow.tsx:41` `snap_*`; build `analytics-Dxuvjdq7.js 0.79k` | Selesai — isi env `GA_MEASUREMENT_ID` untuk aktif, kosong = disable |
| P0-5 | **JSON-LD Organization/Breadcrumb/FAQ/BlogPosting + hreflang** | `VERIFIED` (2026-10-10) | `SeoHead.tsx:3` `BreadcrumbItem` + `12` props `robots/jsonLd/breadcrumbs/noIndex`, `SeoHead.tsx:22` base `Organization`+`WebSite` + `breadcrumbs`→`BreadcrumbList`, `SeoHead.tsx:48` `hreflang id/en/x-default` + `og:site_name/locale`, `SeoHead.tsx:60` `script ld+json`; `app.blade.php:2` `lang="{{ app()->getLocale() }}"`; `SitemapController.php:19` `latest max updated_at`; `Faq.tsx:25` `FAQPage` jsonLd + breadcrumbs, `Blog/Show.tsx:17` `BlogPosting` + breadcrumbs; build `SeoHead-Cxm9QxBX.js 2.84k`, client injected via `Head` (APP_SSR=false → JS) | Selesai — SSR=false jadi JSON-LD client-side (Google JS render), jika butuh server-side butuh `APP_SSR=true` + runner |

**Sisa P0 PRD (status 10 Okt):**
- Campus games hapus — `RESOLVED VERIFIED` (file D di git status)
- `lh-*.json` & `gambar/` raw bengkak — `RESOLVED VERIFIED` (`.gitignore:28` + git status D)
- Midtrans hardening (signature strict 401, gross_amount 422, idempoten, re-use token 14m) — `RESOLVED VERIFIED` (`MidtransWebhookController.php:27,49,55` + `MidtransService.php:36` + 4 tests passed)

### P1 — Minggu 1 Setelah Launch (High ROI)

| # | Item | Status | Catatan Verifikasi |
|---|---|---|---|
| P1-1 | **CI/CD GitHub Actions** (`ci.yml` pint+test+build, `deploy.yml`) + `dependabot.yml` | `NOT STARTED` | `glob .github/**/*` 0 hasil — VERIFIED belum ada |
| P1-2 | **Coverage 60%** — butuh `SitemapTest, ContactTest, EstimatorThrottleTest, PolicyTest` + `vitest` FE | `NOT STARTED` | `tests/Feature/*` hanya 4 file (Auth, Order, MidtransWebhook, Example) — VERIFIED rendah |
| P1-3 | **PWA minimal** `manifest.webmanifest` + `vite-plugin-pwa` + offline cache | `NOT STARTED` | `public/manifest.json` tidak ada, `package.json:1` tanpa `vite-plugin-pwa` — VERIFIED 0% |
| P1-4 | **Image pipeline** — `sharp 0.35.3` installed tapi 0 usage, `.gitignore` `public/images/*.webp` bahaya deploy 404 | `NOT STARTED` | `package.json:17` VERIFIED `sharp` ada tapi tidak dipakai; `.gitignore:33` `public/images/*.webp` VERIFIED — fresh clone akan 404 |
| P1-5 | **.env harden** `SENTRY_DSN`, `SESSION_SECURE_COOKIE=true` (prod), `Asia/Jakarta` timezone, hapus `env()` fallback terkecuali `config()` | `IN PROGRESS` | `.env.example:85` `APP_SSR` sudah ada, tapi belum ada SENTRY/GA/SESSION_SECURE; `WhatsappService.php:98,113` masih `env()` fallback (partial fixed di `MidtransService.php:19` sudah `config()`) |

**Sisa audit Pantau Pesanan (2026-10-16 — Follow-up 4: P0; Follow-up 5: unduh file + notifikasi WA; Follow-up 6: histori foto/notes/tanggal; Follow-up 7: ringkasan pembayaran, stepper, refresh/"sudah bayar", countdown token, tombol salin):**
- **P1 selesai semua** (5 item Follow-up 7: ringkasan total–dibayar–sisa, stepper status, tombol refresh, countdown token Snap mm:ss + auto-reload, tombol salin kode/link) — full suite 64 passed, 1 skipped (250 assertions).
- **P2 tersisa:** route `track.lookup` POST tidak dipakai FE (FE pakai `router.get` 30/1); dua link PDF redundan per invoice; prop legacy `invoice`/`paymentUrl` top-level; log lookup gagal + limit per-code 3/menit (rancangan §7).
- **Catatan Follow-up 6:** file lama (sebelum migrasi `project_update_id`) tetap tampil di section "File Hasil" tapi tidak di timeline — sengaja tanpa backfill; verifikasi browser upload foto → timeline belum dijalankan manual.
- **Fix Follow-up 8 (2026-10-16):** upload foto admin sempat tidak pernah tersimpan karena form upload ter-nested di dalam form "Save changes" di `Admin/Projects.tsx` (nested form → submit saling bentrok, visit upload dibatalkan) — kini form upload jadi `<div>` + tombol `type="button"`; `app.blade.php` ditambah `<meta name="csrf-token">` karena 2 form bayar native di `TrackOrder.tsx` bergantung padanya (sebelumnya akan 419). Dibuktikan dengan emulasi upload HTTP nyata (file WebP tersimpan + timeline entry + progress bump), data uji dibersihkan. Full suite 64 passed, 1 skipped (251 assertions).

### P2 — Bulan 1 (Polish, Scale)

| # | Item | Status | Catatan |
|---|---|---|---|
| P2-1 | Search (`scout/meilisearch`) + RSS `/blog/rss.xml` + Breadcrumbs + Related Portfolio | `NOT STARTED` | — |
| P2-2 | Newsletter `subscribers` + double opt-in + footer form | `NOT STARTED` | — |
| P2-3 | Legal pages `/privacy`, `/terms` (wajib Midtrans/UU PDP) + cookie consent page | `NOT STARTED` | — |
| P2-4 | Redis cache+queue + query `remember(3600)` + CDN purge hook | `NOT STARTED` | `QUEUE_CONNECTION=database` verified `.env.example:42` |
| P2-5 | Backup `spatie/laravel-backup` + scheduler `schedule:run` cron + `queue:work` supervisor | `NOT STARTED` | `routes/console.php` hanya `inspire` — VERIFIED no scheduler |
| P2-6 | A11y audit (axe/lighthouse) — skip link, focus trap mobile menu, `aria-live` Toast | `NOT STARTED` | `PublicLayout.tsx` partial `aria-current` VERIFIED, tapi skip link belum ada |
| P2-7 | ESLint/Prettier + Husky + Pint strict | `NOT STARTED` | hanya `laravel/pint` tanpa ESLint — VERIFIED `package.json` |
| P2-8 | Observability Sentry + Telescope/Pulse (local) + Slack `failed_jobs` alert | `NOT STARTED` | — |

---

## 4. Risiko Keamanan (Yang Sudah Diverifikasi)

| Risiko | Tingkat | File & Baris | Mitigasi Saat Ini | Sisa |
|---|---|---|---|---|
| **Invoice PDF tanpa auth** — tebak `RAY-YYYYMMDD-XXXX` bisa download semua invoice | HIGH → **FIXED** | `TrackOrderController.php:138` now signed/auth | Signed 30m `URL::temporarySignedRoute` + auth fallback `project.user_id === auth()->id() \|\| isAdmin()` + throttle `30,1` | `VERIFIED` via `InvoicePdfSecurityTest.php:1` (4 kasus: guest 403, guest signed 200, owner 200, other 403) |
| **PDF & pay link tidak rate-limit per-code cukup** — brute force tebak kode | MEDIUM | `TrackOrderController.php:115`, `routes/web.php:40-46` | Global `30,1` & `10,1` per IP + `RateLimiter 5/10m` di `pay()` | Tambah lock per `code` 3/menit seperti Rancangan_pantau 7. |
| **Contact flood** — tanpa honeypot/captcha | MEDIUM → **FIXED** | `ContactController.php:16` + `Contact.tsx:22` | `throttle:3,1` + honeypot `website` (hidden `absolute -left-[9999px]`, bot filled → 200 tapi tidak `ContactMessage::create`) + `ContactHoneypotTest.php:1` | `VERIFIED` 3 passed, Turnstile opsional |
| **No security headers** — CSP untuk `snap.js`, `fonts.googleapis.com` | MEDIUM → **FIXED** | `app/Http/Middleware/SecurityHeaders.php:1` + `bootstrap/app.php:22` web append | `X-Content-Type-Options`, `X-Frame SAMEORIGIN`, `Referrer-Policy`, `Permissions-Policy`, `HSTS prod`, `CSP` (snap + fonts + vite), `X-Powered-By` remove; header `InvoicePdfSecurityTest.php:65` verified on `GET /` | Done — CSP tidak strict blocking, `snap.js` tetap jalan |
| **No Policy** — `Admin/UserController` `updateRole/destroy` bisa hapus diri sendiri / demote last admin | MEDIUM | `Admin/UserController.php` (belum di-read detail, tapi grep Policy 0 file) | Middleware `admin` saja | Butuh Policy/Gate |
| **Missing password reset** — client terkunci | MEDIUM → **FIXED** | `AuthController.php:76`, `routes/web.php:73` | `Password::sendResetLink` + `Password::reset` + `password_reset_tokens` expire 60m `config/auth.php:99`, throttle `5,1`, `PasswordResetTest.php:1` 7 passed | `VERIFIED` — tested valid/invalid token, throttled, link `MAIL_MAILER=log` di `storage/logs/laravel.log` |
| **Vite hot `[::1]:5173` putih kosong** | HIGH → **FIXED** | `vite.config.ts:13`, `public/hot` | Host `127.0.0.1` + hapus hot fallback build, CSP allow loopback | `VERIFIED` `Invoke-WebRequest /` now `build/assets/app-*.js` |
| **Midtrans webhook** | LOW (sudah aman) | `MidtransWebhookController.php:27,49,55` | `hash_equals` + `422` + idempoten | `-` |
| **File download** | LOW (sudah aman) | `Client/ProjectController.php:32` | `user_id === auth()->id() \|\| isAdmin()` + `file.project_id === project.id` + `Storage::exists` | `-` |

**Konfigurasi Wajib Sebelum Prod:**

- Tanpa rahasia: `.env.example` harus berisi **key kosong** atau placeholder demo saja (sudah: `SB-Mid-server-DemoServerKey...`).
- Env yang **belum ada** (tambahkan ke `.env.example` saat implementasi, jangan commit nilai asli):
  `APP_TIMEZONE=Asia/Jakarta`, `SESSION_SECURE_COOKIE=true` (prod), `TRUSTED_PROXIES=*`, `SENTRY_DSN`, `VITE_GA_ID`/`VITE_PLAUSIBLE_DOMAIN`, `GOOGLE_SITE_VERIFICATION`, `REDIS_*` jika pindah dari `database`, `MAIL_FROM_ADDRESS`, `VITE_SSR_PORT`.

---

## 5. Hasil Test (Verified Actual Run)

**Perintah:** `php artisan test --compact` + `npm run build`  
**Tanggal:** 2026-10-10 (sesi P0-3, setelah honeypot Contact)  
**Hasil:** `Tests: 30 passed (67 assertions) Duration: 16.46s` — **VERIFIED bukan klaim** (P0-2: 27 passed 17.27s)

Rincian yang diverifikasi (`Read` file test + `bash`):

| Suite | File | Jumlah | Status |
|---|---|---|---|
| Feature | `AuthTest.php` (6) | login page, login valid, admin redirect, invalid password, register, logout | passed |
| Feature | `MidtransWebhookTest.php` (4) | reject invalid signature 401, settlement paid 200, idempoten Already settled, gross_amount mismatch 422 | passed |
| Feature | `OrderTest.php` (3) | view order page, place order, estimator lead store | passed |
| Feature | `InvoicePdfSecurityTest.php` (5) **P0-1** | guest tanpa signature 403, guest signed 200, owner auth 200, other user 403, security_headers present | passed |
| Feature | `PasswordResetTest.php` (7) **P0-2** | view forgot 200, request link + DB token, invalid email error, view reset 200, reset valid token + Hash check, invalid token error, throttled 5,1 | passed |
| Feature | `ContactHoneypotTest.php` (3) **BARU P0-3** | sukses tanpa honeypot + DB save, honeypot filled tidak save tapi 200, throttle 3,1 | passed |
| Feature | `ExampleTest.php` (1) | `GET /` 200 | passed |
| Unit | `ExampleTest.php` (1) | `assertTrue` | passed |

**Build:** `npm run build` 2026-10-10 **passed** — `Contact-BHy8Ikru.js 10.17k` (honeypot hidden field), total 2883 modules — verified via `bash`.

**phpunit.xml:** `DB_CONNECTION=sqlite :memory:` + `CACHE_STORE=array` + `QUEUE sync` — benar untuk test.

**Style:** `.\vendor\bin\pint --test` masih `fail` — ditunda ke sesi pint batch.

---

## 6. Kondisi Git & Workspace (Verified 2026-10-16)

- **Branch deploy:** `feature/admin-improvements-phase-2` (origin/main masih `6d5b1e7` initial; commit deploy sebelumnya — `bc8fca2` fix production assets, `6d84c0a` hapus gambar unused — juga di branch ini).
- **Log terbaru (batch 2026-10-16):**
  - `3cd76a0` chore: ignore manual build deploy archives (build.zip/rar)
  - `ae472f2` feat: restrict login to admin only, disable registration, hide login CTA
  - `6b4ae8f` feat: blog cover upload with strict image optimization (WebP, whitelist)
  - `9abf82e` fix: admin portfolios paginator + PUT multipart, services hover fill light/dark
  - `a26a02b` feat(pantau): per-invoice payment, file download/preview/zip, WA notifications, progress timeline, admin upload fixes
- **Artefak build (strategi berubah 2026-10-16):** `public/build` sekarang **di-track di git** — hosting (rapidplex) tidak punya node/npm (verified `which npm` kosong). Setiap perubahan frontend wajib `npm run build` lokal lalu commit `public/build` sebelum push. Upload manual `build.zip` tidak dipakai lagi (arsip lama tetap di-gitignore).
- **Auto-deploy:** cron hosting menjalankan `auto-deploy.sh` tiap 5 menit (fetch → bandingkan HEAD vs `origin/<branch>` → `deploy.sh` = pull + `migrate --force` + `optimize:clear` + `config:cache` + `route:cache`; log `~/raycode-deploy.log`). SSH dari luar diblokir hosting (port 22/2222/65002 tertutup — verified 2026-10-16) → workflow GitHub Actions SSH dihapus.
- **Document root ≠ folder proyek (VERIFIED 2026-10-24):** domain melayani file dari `~/public_html`, sedangkan Laravel dijalankan dari `~/ray-code` (`Panduan_Deploy_Raycode.md:12`). `deploy.sh` sejak 2026-10-24 punya langkah **3/7** yang menyalin aset statis non-build (`public/*.png|webp|jpg|jpeg|gif|svg|ico`, `robots.txt`, `public/images/`) ke `~/public_html` dengan `cp -f` + backup selektif ke `~/raycode-deploy-backup/<timestamp>/` bila isi docroot berbeda; `index.php`/`.htaccess`/`storage` tidak disentuh. Penyebab bug: `ray-logo.png` + `ray-watermark.webp` + `RAYCODE.png` ditambahkan di `fea4fb6` tapi tidak pernah tersalin → navbar production 404 dan hanya menampilkan teks alt "Raycode" (`PublicLayout.tsx:18`); `ray.png` lolos hanya karena upload manual 15–16 Okt. Bukti deviasi dua lokasi: `favicon.png` live 1,67 MB vs repo 1 KB; `robots.txt` live 104 B vs repo 102 B; `robots.txt` statis di docroot juga **menutupi** route `routes/web.php:54`. **Status 2026-10-24 sore: terselesaikan — `deploy.sh` langkah 3/7 sudah dieksekusi cron (`edeb2ff`) dan `ray-logo.png` live 200 dengan md5 sama persis dengan repo; `favicon.png` kini 1.064 B (versi repo, tidak dirujuk kode → aman; versi lama masih bisa keluar dari cache ModPagespeed) dan `robots.txt` kini 102 B versi repo.**
- **Langkah produksi (dilakukan user di hosting, sekali saat migrasi ke build tracked):** `cd ~/ray-code && rm -rf public/build && git pull && bash deploy.sh` (migrasi `2026_10_16_000000` WAJIB — kolom `project_files.project_update_id`; `storage:link` bila belum; php-zip untuk fitur ZIP).
- **Artinya:** Sebelum perubahan ini, banyak perbaikan Sprint1-2 hanya hidup di working directory; kini semua sudah ter-commit dan ter-push di branch deploy.

---

## 7. Pekerjaan Berikutnya (Prioritas)

**P0-1 — SELESAI VERIFIED (2026-10-10):** `SecurityHeaders.php` + signed PDF + Vite host fix — 20 passed.
**P0-2 — SELESAI VERIFIED (2026-10-10):** Password reset 4 route + 2 Inertia pages + login link + throttle — 7 passed, build ok.
**P0-3 — SELESAI VERIFIED (2026-10-10):** Honeypot Contact `website` hidden + controller guard — 3 passed.
**P0-4 — SELESAI VERIFIED (2026-10-10):** GA4+Plausible + consent_mode + CookieConsent banner + trackEvent — build `analytics-Dxuvjdq7.js`
**P0-5 — SELESAI VERIFIED (2026-10-10):** JSON-LD `Organization/WebSite/Breadcrumb/FAQPage/BlogPosting` + `hreflang` + `robots` + `lang` dynamic + Sitemap fix — build `SeoHead-Cxm9QxBX.js 2.84k`
**PERF-AUDIT — IN PROGRESS (2026-10-11):** Lighthouse 29, payload 8.066 KiB, main-thread 13,9 s, JS 2,8 s — audit `npm run build` + images/video + font + animasi selesai, optimasi belum diterapkan (lihat §10).

**A1/A5/A7 — SELESAI VERIFIED (2026-10-25):** `public/images` kini hanya berisi 5 WebP (jpeg/png 3,8 MB sudah tidak ada), default hero `Admin/HomepageController.php:167` = `/images/pp-800.webp`, video Home `preload="none"` + lazy hover (`Home.tsx:1080`), dan Chrome headless (dev + build produksi) mencatat **0 request `.mp4`** saat initial load. Sisa image delivery ditutup: `raycode-faq.webp` 147.478 B → varian `raycode-faq-600.webp` 69.654 B via srcset (1440 & 390 px memilih 600w). Bukti lengkap di `docs/WORKLOG.md` 2026-10-25. **Berikutnya: PERF A2 (font/long task) + A4 (unused JS).**

**Arsip temuan 2026-10-11 (sudah tidak berlaku):** `public/images` hero-woman.jpeg 2.060 kB + pp.png 1.305 kB + hero-woman.png 503 kB tidak dipakai tapi ikut deploy (`HomepageController.php:167` default `pp.png` 1,3 MB seharusnya `pp-800.webp` 68 kB), `portfolio_videos 5.212 kB` mp4 `preload metadata` di Home, `.gitignore:33` `public/images/*.webp` bikin fresh clone tanpa webp. Fix P1-4 (.gitignore allow webp) sudah dikerjakan 2026-10-11.

**Urutan setelah itu:**
1. PERF A2 render-blocking font (`Inter 4 weight` + `snap.js sync` `app.blade.php:17,38` 910 ms) → `font-display swap` + `snap.js async` + `preconnect` — **audit 2026-10-25:** font & Snap sudah tidak render-blocking; long task `initRevealEngine` **sudah diperbaiki 2026-10-25** (rect reads 1.194 → 48–136; reveal desktop/mobile/broken-IO 21/21, reduced-motion aman; A/B Lighthouse lokal tidak konklusif — TBT live diukur setelah deploy)
2. PERF A3 forced reflow (`Home.tsx:186 getBoundingClientRect x6`) → `prefers-reduced-motion` guard + `will-change` + rAF throttle — **✅ SELESAI 2026-10-17** (guard sudah ada; read dipindah ke dalam rAF; `will-change` `.reveal` dihapus 2026-10-16; handler duplikat dihapus; bukti di `docs/WORKLOG.md` 2026-10-17)
3. PERF A4 unused JS 179 KiB (`vendor 318k + motion 127k`) → lazy `motion` per section
4. P1-1 CI/CD — setelah perf stabil

**Jangan klaim naik Lighthouse sebelum `npm run build` + `php artisan test` + re-run Lighthouse diukur ulang.**

---

## 8. Cara Re-Verifikasi (Untuk Sesi Berikutnya)

> Setiap item `NOT STARTED` / `NEEDS RE-VERIFY` harus cek ulang:

```powershell
# 1. Status git & diff
git status
git diff --stat
git log --oneline -5

# 2. Test aktual (jangan klaim tanpa run)
php artisan test --compact
php artisan test --filter MidtransWebhookTest

# 3. Baca file bukti (jangan asumsi dari docs)
# contoh: Read app/Http/Controllers/TrackOrderController.php:138
#         Read resources/js/Components/SeoHead.tsx
#         Read bootstrap/app.php:19

# 4. Pint style check
php artisan pint --test
```

Jika temuan audit lama bertentangan dengan kode yang kamu baca, **percaya kode** — lalu update `PROJECT_STATUS.md` dengan bukti `file:line`.

> **Catatan lingkungan dev (diperbaiki 2026-10-24):** mesin ini memakai **Laragon**, bukan XAMPP — PHP `C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.exe` (8.3.28, kompatibel `require.php ^8.2`), MySQL `C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe`. Dulu `php` resolve ke `C:\xampp\php\php.exe` (8.2.12) yang tidak memuat `php.ini` (`Loaded Configuration File => (none)`) sehingga `php artisan test` gagal total dengan `PHPUnit requires ... mbstring`. **PATH Machine kini sudah dibersihkan** dari `C:\xampp`, `C:\xampp\php`, `D:\xampp\php`, dan Laragon di-prepend — verifikasi: 33 entri, 0 xampp, `where.exe php` → Laragon. Backup nilai lama `C:\Users\ASUS\path-backup-20261024-233255\MACHINE-PATH-RAW.txt`; skrip + log di `C:\Users\ASUS\path-fix-20261024\`. Jangan pernah pakai `setx` untuk PATH (memotong di 1024 karakter; nilai Machine PATH 1128 karakter). `extension=zip` sudah aktif di `php.ini` Laragon (backup `php.ini.bak-20261024`) sehingga test ZIP tidak di-skip lagi — **baseline test sekarang 65 passed (264 assertions)**, bukan 64 + 1 skipped. Jika `php` tidak ketemu di shell: buka terminal baru (proses lama menyimpan PATH lama).

---

## 9. Referensi Dokumen

| Dokumen | Status | Peran |
|---|---|---|
| `docs/PRD.md` (11 Sep 2026) | **Arsip — masih relevan sebagai backlog Sprint1-3** | Jangan hapus; FR-1 s/d FR-8 dan risiko/mitigasi masih jadi acuan. Jika PRD vs kode bertentangan, update bagian ini. |
| `docs/Rancangan_Pantau_Pesanan.md` (11 Sep 2026) | **Arsip — sudah terimplementasi 80%** | Flow pantau+QRIS+order_code sudah jadi (`TrackOrderController`, `Admin/OrderController@storeManual`). Sisa: keputusan kode format `RAY-` OK, signed PDF, throttle per-code. |
| `docs/WORKLOG.md` | **Aktif — log sesi** | Baca sebelum coding. Tulis setiap sesi dengan tanggal, file diubah, test result, unresolved. |
| `AGENTS.md` | **Aktif — instruksi permanen** | Harus dibaca setiap sesi baru sebelum sentuh kode. |

> **Peringatan AGENTS.md §1:** Jika kamu adalah agent baru dan membaca file ini tanpa sebelumnya membuka `AGENTS.md` + `WORKLOG.md`, **hentikan** — kembali ke `AGENTS.md` langkah 1.

---

---

## 10. Performance Audit — Lighthouse 29 (IN PROGRESS 2026-10-11)

**Laporan Lighthouse (user):** Performance 29, main-thread 13,9 s, JS 2,8 s, render-blocking 910 ms, image delivery 345 KiB, network payload 8.066 KiB, unused JS 179 KiB, unused CSS Error, forced reflow, network dependency tree.

**Bukti produksi `npm run build` 2026-10-11:**
- `vendor 318k + motion 127k + Home 72k + app.css 180k` = **1.106 MB / 58 file** (gzip ~250k) — bukan 8 MB; 8 MB berasal dari **gambar/video**
- `public/images`: hero-woman.jpeg 2.060k, pp.png 1.305k, hero-woman.png 503k (tidak dipakai, tapi ikut deploy, `.gitignore` ignore webp jadi fresh clone 404 fallback ke png), `pp-800.webp` 68k (dipakai `app.blade.php:15` preload + `Home.tsx:418` hero), `raycode-faq.webp` 147k, `storage/portfolio_videos` 5.212k mp4 (dipakai `Home.tsx:1117` `<video preload metadata>` 5 MB)
- `app.blade.php:17` Inter 4 weight + `snap.js` sync (tanpa async) = render-blocking 910 ms, `vite.config.ts:29` split motion/icons sudah ada tapi `axios` 0k waste
- `Home.tsx:186,249,263,517,904,1042,1153` `getBoundingClientRect` x6 di mousemove rAF — hanya spotlight ada `prefers-reduced-motion` guard, lainnya tidak → forced reflow **(KOREKSI 2026-10-17: bagian "guard" TIDAK akurat — guard `prefers-reduced-motion` ternyata ada di 5 handler sejak initial commit `6d5b1e7`, diverifikasi `git log -S`; temuan forced reflow read tetap valid dan sudah diperbaiki 2026-10-17)**
- Unused JS 179k = vendor/motion/icons eager di Home; Unused CSS Error = tool limitation (`@tailwindcss/vite` + `cssCodeSplit:true` bikin Lighthouse lama gagal parse, bukan app bug)

**Temuan prioritas (dampak / risiko / biaya):**
- **A1 payload gambar 3,8 MB tidak dipakai** — ✅ **SELESAI VERIFIED 2026-10-25**: `public/images` kini hanya 5 WebP (jpeg/png tidak ada), default hero `Admin/HomepageController.php:167` = `/images/pp-800.webp`, `app.blade.php:19` preload `pp-800/pp`; Chrome headless (dev + build) hanya memuat `pp-800.webp`, `raycode-faq*.webp`, `ray-logo.png` — tidak ada `pp.webp`, `RAYCODE.png`, `ray.png`, atau `.mp4`.
- **A7 video 5,2 MB preload metadata** — ✅ **SELESAI VERIFIED 2026-10-25**: `Home.tsx:1080` sudah `preload="none"` + poster prop + play hanya saat hover; Chrome headless netlog (dev & build produksi) **0 request `.mp4`** saat initial load. Catatan konten: 3 portfolio video di DB punya `thumbnail_url = NULL`, jadi `poster` tidak terpasang (placeholder gradient + badge "Preview" tetap tampil); hover/play tetap mengunduh file video apa adanya (5,3 MB di dev).
- **A5 image 345 KiB** (raycode-faq 147k tanpa srcset/width/height) — ✅ **SELESAI 2026-10-25**: varian `raycode-faq-600.webp` 69.654 B (sharp 600w, quality 82) + `srcSet 600w/900w` + `sizes="(min-width: 1024px) 560px, 100vw"` + `width=900 height=600` (`Home.tsx:1530-1539`); Chrome 1440 & 390 px memilih 600w.
- **A2 render-blocking 910 ms** (font + snap sync) — **✅ FIX DITERAPKAN + VERIFIED (behavior) 2026-10-25**: font & Snap sudah beres (`render-blocking-resources` kosong, `font-display` kosong, 0 request Snap di homepage; Snap hanya lazy di `InvoiceShow`). Akar long task `initRevealEngine` diperbaiki di `resources/js/app.tsx`: `checkPending()` batching read→write + early-return + prune node, MutationObserver di-debounce 120 ms (bukan per batch React), `reveal()` idempoten; semua fail-safe reveal dipertahankan. Bukti Chrome CDP (aset build): `getBoundingClientRect` initial+scroll **1.194 → 48** (desktop), **49** (mobile), **136** (broken-IO); reveal **21/21** di ketiga skenario; reduced-motion aman. A/B Lighthouse lokal **tidak konklusif** (sebelum TBT 250/220 ms vs sesudah 480/490 ms; task 610 ms "sebelum" muncul sebelum FCP sehingga tidak dihitung TBT, task 400 ms "sesudah" sebelum HTML selesai — variance server lokal, bukan atribusi app). TBT/LCP live wajib diukur ulang setelah deploy.
- **A3 main-thread 13,9 s forced reflow** — TINGGI, sedang, 30m — **✅ SELESAI 2026-10-17** (read `getBoundingClientRect` dipindah ke dalam rAF; handler duplikat ServiceCard/WorkCard dihapus; cache rect drag Before/After; fix link-drag mouse via `onDragStart` di anchor — bukti puppeteer 6/6 + build `Home-CYFWNef4.js` di `docs/WORKLOG.md` 2026-10-17)
- **A4 unused JS 179k** — SEDANG, sedang, 20m
- **A6 unused CSS Error** — RENDAH, tool, 0m (jangan fix app)
- **TTFB live 1,15 s** — **SEBAGIAN SELESAI + TERUKUR 2026-10-25 pasca-deploy `644857b`**: `deploy.sh` langkah 7/7 membangun `config:cache` + `route:cache` (110 route). curl warm **0,21–0,25 s** konsisten, tetapi request pertama setelah idle tetap **1,07–1,09 s** (cold start worker/OPcache hosting). Lighthouse 2 run: skor 69/74, TTFB 240/990 ms (variance cold start), FCP 3,0/2,9 s, LCP 3,8 s, TBT 470/320 ms, CLS 0,001. Verifikasi file cache di server butuh log deploy (`Configuration cached successfully` + `Routes cached successfully`); tidak tersedia via HTTP.

**Yang sudah dikerjakan 2026-10-11:** `.gitignore:32` `public/images/*.webp` → allow webp (P1-4), `vite.config.ts:13` host fix + `public/hot` hapus (sebelumnya), audit bundle lengkap — **optimasi A1/A7/A2/A3 belum diterapkan**, desain/SEO/hover preview/Before-After/order dipertahankan, tidak tambah dependency.

**Yang sudah dikerjakan 2026-10-16 (sesi fix animasi mobile):** keluhan "animasi hilang di Chrome Android" diverifikasi & diperbaiki tanpa hapus animasi desktop — `app.tsx` reveal engine jadi fail-safe (fallback `scroll/resize/load/pageshow` + watchdog 2,5 s/6 s; bukti A/B emulasi IO rusak: live lama 42/42 stuck `opacity: 0` vs build baru 44/44 reveal), `initTouchFeedback()` untuk tap (`.is-touch`/`.is-lit`, `--mx/--my`), reduce-motion tidak lagi `* { animation: .01ms !important }` (sekarang `[class*='animate-']`) dan konten reveal selalu tampil, `will-change` dihapus dari `.reveal` (**bagian dari A3**), `useCountUp` fallback anti-stuck-"0", Before/After slider drag-guard (tidak navigasi saat drag). Build baru `app-MDCyzl_k.css` + `app-CSc8ShV5.js`; `php artisan test --compact` → 64 passed, 1 skipped (251 assertions); verifikasi puppeteer mobile normal/reduced/broken-IO + desktop 1440 lulus semua. **A1/A2/A4/A5/A7 tetap pending; sisa A3 (guard reduce-motion mousemove/magnetic) masih pending.** **(KOREKSI 2026-10-17: guard reduce-motion ternyata SUDAH ADA sejak initial commit — yang nyata sisa A3 adalah forced reflow read rect; diselesaikan 2026-10-17.)**

**Yang sudah dikerjakan 2026-10-17 (sesi PERF A3):** forced reflow mousemove dieliminasi — `getBoundingClientRect` dipindah ke dalam callback rAF (maks 1 read/frame) di global spotlight, hero spotlight, magnetic CTA, dan tilt StudioShowcase; handler mousemove per-card `ServiceCard`/`WorkCard` dihapus (duplikat persis dengan handler global `.spotlight-card`); `BeforeAfterSlider` cache rect saat drag start (`rectRef`, 1 read/gestur); fix bug drag **mouse**: native link drag dari `<a>` card menelan `mousemove` → `onDragStart` preventDefault di anchor WorkCard (guard di container tidak menangkap, dibuktikan target `dragstart` = `A.spotlight-card`). Bukti: build `Home-CYFWNef4.js` 72.56 kB, `php artisan test --compact` → 64 passed + 1 skipped (251 assertions), puppeteer 6/6 (drag mouse 52% → 79.87% tanpa navigasi; spotlight/hero/magnetic/reduce-motion PASS). `pint --test` fail pre-existing di migrasi `2026_10_13_150740_*` (commit `bc8fca2`, tidak disentuh). **A1/A2/A4/A5/A7 tetap pending.**

**Yang belum (2026-10-25):** A3 selesai 2026-10-17; **A1/A5/A7 selesai 2026-10-25**; **A2 fix diterapkan + diverifikasi di browser 2026-10-25 (belum deploy, TBT/LCP live belum diukur ulang)**; **A4 (unused JS) masih pending**; **TTFB: `config:cache` + `route:cache` sudah masuk `deploy.sh` dan ter-deploy (`644857b`); TTFB warm curl 0,21–0,25 s, first-hit cold 1,07–1,09 s, Lighthouse 69/74 (TTFB 240/990 ms)**; build before/after belum diukur ulang dan Lighthouse live belum stabil (68 pada build lama vs 81 sebelumnya) — jangan klaim naik sebelum ukur.

*Template status:* `VERIFIED` → `IN PROGRESS` → `NOT STARTED` → `BLOCKED` → `NEEDS RE-VERIFY` → `DEPRECATED` (jangan hapus, tandai deprecated). Update hanya dengan bukti `file:line` atau output `bash`.
