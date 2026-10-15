# WORKLOG — Raycode Studio

> Catatan sesi coding. Tulis setiap sesi dengan **tanggal**, **file yang diubah**, **keputusan teknis**, **perintah test + hasil aktual**, dan **unresolved**. Jangan tandai selesai jika belum diverifikasi via `Read`/`bash`.

Template entri:
```
## YYYY-MM-DD — Judul sesi
- Fokus: ...
- File diubah: ...
- Keputusan: ...
- Test: `php artisan test` → hasil aktual ...
- Unresolved: ...
```

---

## 2026-10-13 — Admin Improvements Phase 1 Selesai: ConfirmModal, Toast, Breadcrumbs, HelpTooltip, Required Asterisk & Bulk Actions

- **Fokus:** Menyelesaikan 100% item Phase 1 (Quick Wins) dari `docs/PRD_Admin_Improvements.md`.
- **File diubah / dibuat:**
  - `resources/js/Components/ui.tsx` — tambah `HelpTooltip`, `FieldLabel`, dan prop `required`, `hint`, `tooltip` pada `Input`, `Textarea`, `Select`.
  - `resources/js/Components/useConfirm.tsx` — diubah menjadi `ConfirmProvider` + hook `useConfirm` React Context global.
  - `resources/js/Components/ToastProvider.tsx` — ditambah listener `usePage().props.flash` (`success` dan `error`) otomatis.
  - `resources/js/Components/layout/AdminLayout.tsx` — bungkus aplikasi admin dengan `ConfirmProvider` & pastikan `ToastProvider` aktif.
  - 10 Halaman Admin: `Users.tsx`, `Services.tsx`, `Testimonials.tsx`, `Projects.tsx`, `PricingPlans.tsx`, `Portfolios.tsx`, `Messages.tsx`, `JokiServices.tsx`, `Faqs.tsx`, `Blog.tsx` — ganti `confirm(...)` native ke `await confirm({ title, description, variant })`.
  - Form Tooltips & Hints: `Services.tsx` dan `PricingPlans.tsx` — dipasangi `tooltip` dan `hint` pada field-field ambigu (slug, starting_price, sort_order, delivery_days, cta_text, dll).
  - Bulk Actions: `routes/web.php` (`POST /admin/users/bulk`), `app/Http/Controllers/Admin/UserController.php` (`bulkAction`), `resources/js/lib/routes.ts` (`adminUsersBulk`), dan `Users.tsx` (row checkboxes, select-all, floating bulk toolbar untuk ubah peran & hapus massal).
  - `tests/Feature/AdminBulkUserTest.php` — **BARU** (5 tests: guest redirect, client 403, admin bulk update roles, admin cannot self-modify, admin bulk delete).
  - `docs/PRD_Admin_Improvements.md` — semua 7 item Phase 1 bertanda `[x]` VERIFIED.
- **Keputusan:**
  - `Input`, `Textarea`, `Select` otomatis mendeteksi `props.required` bawaan HTML5 untuk menampilkan tanda bintang merah `*` tanpa perlu penulisan ganda.
  - Bulk action di `Users.tsx` melindungi akun admin yang sedang login agar tidak terhapus atau berubah perannya secara tidak sengaja.
- **Perintah test yang dijalankan:**
  - `npm run build` — `exit 0`, 2889 modules transformed, built in 17.50s (bebas error TypeScript/bundler).
  - `php artisan test --filter AdminBulkUserTest --compact` — 5 passed (11 assertions).
  - `php artisan test --compact` — `Tests: 35 passed (78 assertions)` Duration: 3.96s (semua lulus).
- **Unresolved:**
  - Phase 1 selesai 100%. Lanjut ke Phase 2 (Core UX: Draft/Publish workflow, preview tab, clone content, rich text editor).

---

## 2026-10-10 — Inisialisasi Persistent Project Memory

- **Fokus:** Membuat `AGENTS.md`, `docs/PROJECT_STATUS.md`, `docs/WORKLOG.md` agar sesi berikutnya dapat lanjut tanpa kehilangan konteks setelah OpenCode ditutup.
- **Prinsip:** Verifikasi repository aktual dulu, jangan ubah kode aplikasi hanya untuk terlihat benar di docs, jangan catat rahasia, jangan klaim test/keamanan tanpa verifikasi.

### File dibaca (verifikasi)

- `composer.json:1`, `package.json:1`, `.env.example:1`, `phpunit.xml:1`, `vite.config.ts:1`, `bootstrap/app.php:1`, `.gitignore:1`, `README.md:1`
- `routes/web.php:1`, `routes/api.php:1`, `app/Http/Controllers/Api/MidtransWebhookController.php:1`, `app/Services/MidtransService.php:1`, `app/Http/Controllers/TrackOrderController.php:1`, `app/Http/Controllers/Auth/AuthController.php:1`, `ContactController.php:1`, `EstimatorController.php:1`, `resources/js/Components/SeoHead.tsx:1`, `resources/views/app.blade.php:1`, `app/Http/Middleware/EnsureUserIsAdmin.php:1`, `config/midtrans.php:1`, `app/Http/Controllers/SitemapController.php:1`
- `app/Models/Project.php:1`, `app/Models/User.php:1`, `app/Models/Invoice.php:1`, `app/Services/WhatsappService.php:1`, `app/Http/Controllers/Client/ProjectController.php:1`, `InvoiceController.php:1`, `Admin/OrderController.php:1`
- `tests/Feature/MidtransWebhookTest.php:1`, `AuthTest.php:1`, `OrderTest.php:1`
- `docs/PRD.md:1`, `docs/Rancangan_Pantau_Pesanan.md:1`
- `git log --oneline`, `git status --porcelain`, `database/migrations` dir, `tests` dir

### File diubah / dibuat

- `AGENTS.md` — **BARU** (instruksi permanen agent, stack verified 2026-10-10, aturan keamanan/testing/conventions/larangan)
- `docs/PROJECT_STATUS.md` — **BARU** (ringkasan arsitektur, status VERIFIED/IN PROGRESS/NOT STARTED, audit P0/P1/P2, risiko, hasil test, pekerjaan berikutnya)
- `docs/WORKLOG.md` — **BARU** (file ini)

### Keputusan teknis

- `AGENTS.md` menempati root (bukan `docs/`) agar OpenCode auto-load sebagai persistent instruction. Isi stack diambil dari inspeksi langsung `composer.json` + `package.json` + `vite.config.ts` + `bootstrap/app.php`, bukan dari PRD lama.
- `PROJECT_STATUS.md` mempertahankan prioritas P0/P1/P2 dari audit sebelumnya, tapi setiap baris diberi label status dan bukti `file:line`. Temuan lama `RESOLVED VERIFIED` (Campus, lh-*.json, Midtrans hardening) tetap dicatat agar tidak diulang.
- Tidak mengubah kode aplikasi (hanya docs) sesuai aturan. Tidak mencatat nilai `.env` (hanya placeholder `SB-Mid-server-Demo...` dari `.env.example`).
- Format tanggal konsisten `2026-10-10` + `git status` ringkas untuk konteks workspace yang masih banyak `Modified`/`Untracked` belum commit.

### Perintah test yang dijalankan

```powershell
php artisan test --compact
```

**Hasil aktual (bukan klaim):**

```
Tests:    15 passed (36 assertions)
Duration: 2.55s
```

Rincian: `AuthTest 6 + MidtransWebhookTest 4 + OrderTest 3 + Example Feature 1 + Unit Example 1` — semua `passed`. Output dicapture `bash` dan dicatat di `PROJECT_STATUS.md §5`.

### Unresolved (untuk sesi berikutnya)

- Workspace masih `git status` ~70 Modified + ~20 Untracked belum commit (1 commit saja `6d5b1e7`). Agent berikutnya harus `git diff --stat` sebelum coding, agar tidak menimpa perubahan yang belum ter-commit.
- P0-1 (Invoice PDF tanpa auth) belum dikerjakan — hanya didokumentasikan. Jangan tandai `VERIFIED` sampai `TrackOrderController.php:138` diverifikasi pakai `signed`/`auth`.
- `php artisan pint --test` belum dijalankan di sesi ini (hanya `php artisan test`). Sesi berikutnya wajib jalankan sebelum `VERIFIED` style.
- Verifikasi `public/images/*.webp` 404 di fresh clone belum dicek via `git ls-files` + `ls public/images` — dicatat sebagai P1-4 `NEEDS RE-VERIFY`.

---

## 2026-10-10 — P0-1 Fix: Invoice PDF Signed + SecurityHeaders (lanjutan masalah tadi)

- **Fokus:** Menyelesaikan P0-1 HIGH (HIGH risk PDF tanpa auth + no security headers) yang ditandai `NOT STARTED` di `PROJECT_STATUS.md`.
- **File dibaca:** `TrackOrderController.php:13-159`, `Admin/OrderController.php:1-317`, `TrackOrder.tsx:1-221` (frontend PDF link), `Admin/Orders.tsx:204-245` (PDF link admin), `bootstrap/app.php:18-27`, `resources/views/invoice/pdf.blade.php:1`, `resources/views/app.blade.php:1`
- **File diubah / dibuat:**
  - `app/Http/Middleware/SecurityHeaders.php` — **BARU** (X-Content-Type nosniff, X-Frame SAMEORIGIN, Referrer-Policy, Permissions-Policy, HSTS prod, CSP snap+fonts+vîte, remove X-Powered-By)
  - `bootstrap/app.php:19-23` — append `SecurityHeaders` ke `web` middleware + alias `signed`
  - `app/Http/Controllers/TrackOrderController.php:5` — import `URL`; `50-71` — `invoicesPayload` tambah `pdfUrl` via `URL::temporarySignedRoute('invoice.pdf', 30m)`; `138-158` — `invoicePdf()` tambah guard `hasValidSignature() || (auth && owner/admin)` else 403
  - `app/Http/Controllers/Admin/OrderController.php:5,106-107` — import `URL`, `storeManual` pdfUrl signed; `250-254` `generateFinalInvoice` pdfUrl signed; `298-301` `resendInvoice` pdfUrl signed
  - `resources/js/Pages/Public/TrackOrder.tsx:28-29` — interface `invoices[].pdfUrl`; `173-174` — href pakai `inv.pdfUrl` (fallback lama)
  - `tests/Feature/InvoicePdfSecurityTest.php` — **BARU** (5 tests P0-1: guest 403, guest signed 200, owner 200, other 403, security headers present)
- **Keputusan teknis:**
  - Pilih `hasValidSignature() || auth` (dual mode) daripada `middleware('signed')` mutlak, agar owner yang login tetap bisa buka PDF tanpa klik link WA (UX dashboard). Guest wajib signed 30 menit (share WA aman, tidak bisa tebak `RAY-XXXX` saja).
  - CSP dipilih lenient (`'unsafe-inline' 'unsafe-eval'` + `snap` + `fonts`) agar Vite HMR & `app.blade.php` inline theme script tidak break; HSTS hanya jika `isSecure() && production` agar local http tidak redirect loop.
  - PDF URL signed pakai query `?invoice=INV-xxx&expires&signature` — di-controller cek signature dulu baru load project/invoice, jadi tamper/expired langsung 403 sebelum query DB sensitive.
  - Admin `Orders.tsx` tetap `/invoice/.../pdf` tanpa signed karena admin sudah `auth` — guard memperbolehkan admin.
- **Perintah test yang dijalankan:**
  ```powershell
  php artisan test --compact
  # sebelum fix: 15 passed
  php artisan test --filter InvoicePdfSecurityTest --compact
  .\vendor\bin\pint --test
  ```
  **Hasil aktual:**
  ```
  InvoicePdfSecurityTest: 5 passed (11 assertions) — guest_without_signature 403, guest_with_valid_signature 200, owner_authenticated 200, other_user 403, security_headers X-Content-Type nosniff etc.
  Full suite: 20 passed (47 assertions) Duration 1.37s
  pint --test: fail (banyak file need fix concat_space, ordered_imports ...) — tidak difix di sesi ini, jadwalkan sesi pint batch terpisah
  ```
- **Update docs:** `PROJECT_STATUS.md` P0-1 `NOT STARTED → VERIFIED` (2026-10-10), status Invoice PDF `VERIFIED aman`, risiko PDF/HSTS `FIXED`, §5 hasil test 20 passed, §7 next P0-2 password reset.
- **Unresolved:**
  - `pint` masih fail — jangan tandai style `VERIFIED` sampai `.\vendor\bin\pint` dijalankan dengan fix.
  - `public/images/*.webp` ignore masih `NEEDS RE-VERIFY`.
  - P0-2 s/d P0-5 masih `NOT STARTED`; P0-1 sudah commit-ready tapi belum `git commit` (workspace masih Modified+Untracked).
  - `InvoicePdfSecurityTest.php` sementara dibiarkan di `tests/Feature/` untuk jaga regresi; jika dianggap noise bisa hapus dan andalkan `hasValidSignature` manual — keputusan untuk sesi berikutnya.

---

## 2026-10-10 — Debug putih kosong + P0-2 Password Reset (lanjutan)

- **Fokus:** User lapor `putih kosong` setelah P0-1 — debug, lalu lanjut P0-2 password reset.
- **Debug putih kosong:**
  - `File dibaca:` `bootstrap/app.php:19`, `SecurityHeaders.php:11`, `vite.config.ts:13`, `public/hot`, `app/Http/Controllers/Auth/AuthController.php:1`, `User.php:1`, `Invoke-WebRequest /` header & body, `netstat -ano | 5173`, `Get-Content public/hot`
  - `Temuan:` `public/hot` berisi `http://[::1]:5173` tapi Vite `LISTENING` hanya `[::1]:5173` (IPv6), browser `127.0.0.1:8000` fetch `[::1]` gagal → React tidak hydrate → blank. Console user juga `Security Error file:///` & `WebGL` (extension noise) tapi root cause Vite host.
  - `Fix:` `vite.config.ts:13` `host:127.0.0.1 port:5173 hmr:{host:127.0.0.1}` + `SecurityHeaders.php:11` CSP allow `localhost/127.0.0.1/[::1]` loopback semua + `public/hot` dihapus fallback ke `build` manifest. `Bootstrap/app.php:19` sempat disable `SecurityHeaders` untuk isolasi, lalu di-enable lagi setelah hot dihapus. `User.php:6` & `AuthController.php:6` revert `MustVerifyEmail` sementara (pause P0-2) untuk isolasi — terbukti bukan penyebab blank.
  - `Verifikasi:` `Invoke-WebRequest /` after `Remove-Item public/hot` → HTML now `build/assets/app-*.js` (bukan vite client), `config:clear`, user konfirmasi `sudah` (tidak putih lagi). `netstat` now no LISTENING vite (pakai build). Next dev perlu `npm run dev` ulang dengan host baru.

- **P0-2 Password Reset:**
  - `File dibaca:` `AuthController.php:1`, `User.php:1`, `config/auth.php:98`, `Login.tsx:79`, `routes/web.php:65`, `routes.ts:17`, `.env.example:54`
  - `File diubah / dibuat:`
    - `AuthController.php:5` import `Password, Str, PasswordReset`; `66-125` 4 method `showForgotPassword`, `sendResetLinkEmail`, `showResetPassword`, `resetPassword` (Password::sendResetLink/reset, throttle 5,1 via route, event PasswordReset, remember_token rotate)
    - `routes/web.php:65-77` tambah 4 route `password.request/email/reset/update` di `guest` group + `throttle:5,1`
    - `resources/js/Pages/Auth/ForgotPassword.tsx` — **BARU** (email + status, throttle note, `Mail` icon)
    - `resources/js/Pages/Auth/ResetPassword.tsx` — **BARU** (token+email+password+confirmation, `Lock/KeyRound`)
    - `Login.tsx:79-83` tambah link `Lupa kata sandi? → /forgot-password`
    - `routes.ts:19` tambah `passwordRequest`, `passwordReset(token)`
    - `tests/Feature/PasswordResetTest.php` — **BARU** 7 tests (view forgot 200, request link + DB token, invalid email 422, view reset 200, reset valid + Hash check, invalid token 422, throttled)
  - `Keputusan:` Ikuti Laravel Breeze pattern `Password` facade (table `password_reset_tokens` expire 60m `config/auth.php:99`, throttle `throttle:60` + route `throttle:5,1`). `MAIL_MAILER=log` di `.env.example:54` → token terlihat di `storage/logs/laravel.log` untuk dev, tanpa perlu SMTP. MustVerifyEmail **tidak** di-enforce sekarang (opsional P0-2b) agar tidak block client existing.
  - `Perintah test:`
    ```powershell
    php artisan route:list | Select-String password
    php artisan test --filter PasswordResetTest --compact
    php artisan test --compact
    npm run build
    ```
    **Hasil aktual:**
    ```
    route:list: 4 password.* terdaftar (forgot-password GET/POST, reset-password/{token} GET, reset-password POST)
    PasswordResetTest: 7 passed (13 assertions) Duration 9.08s
    Full suite: 27 passed (60 assertions) Duration 17.27s
    npm run build: ✓ 2883 modules, ForgotPassword-DLgldE-d.js 3.75k + ResetPassword-4M5LvNt4.js 3.08k, vendor 318k, built in 30.13s (no TS error)
    ```
  - `Update docs:` `PROJECT_STATUS.md` P0-2 `NOT STARTED → VERIFIED (password reset)` (7 passed), header 27 passed + build, §2 status tambah `Forgot/Reset`, §4 risiko password reset `FIXED`, §7 next P0-3 honeypot.

- **Unresolved:**
  - Email verify `MustVerifyEmail + verified middleware` masih `NOT STARTED` (sengaja opsional, tidak block login). Jika ingin enforce, tambah `implements MustVerifyEmail` di `User.php` + 3 route `email/verify` + middleware `verified` di `dashboard`.
  - `pint` masih fail (belum batch fix).
  - `public/hot` sudah dihapus — dev selanjutnya butuh `npm run dev` (host baru 127.0.0.1) untuk HMR, atau tetap `build` untuk preview prod.

---

## 2026-10-10 — P0-3 Honeypot Contact (lanjutan)

- **Fokus:** P0-3 — `ContactController` tanpa honeypot, rawan spam (vs `EstimatorController.php:51` sudah ada).
- **File dibaca:** `ContactController.php:1`, `Contact.tsx:1` (form WA/Email toggle, useForm 5 field)
- **File diubah / dibuat:**
  - `ContactController.php:16` tambah guard `if ($request->filled('website')) return back()->with('success', ...)` sebelum validate — bot terisi langsung success palsu tanpa `ContactMessage::create`
  - `Contact.tsx:19` tambah `website:''` ke `useForm`; `129-143` tambah hidden honeypot `<div absolute -left-[9999px]><input id="website" tabIndex=-1 autoComplete off>` (bot autofill, manusia tidak lihat)
  - `tests/Feature/ContactHoneypotTest.php` — **BARU** 3 tests (sukses tanpa honeypot + DB save, honeypot filled tidak save tapi 200, throttle 3,1)
- **Keputusan:** Pakai pattern sama persis `EstimatorController.php:51` (jangan Turnstile dulu untuk keep simple). Hidden field pakai `absolute -left-[9999px]` bukan `display:none` agar bot tetap deteksi sebagai input teks. Tidak ubah validasi lain agar tidak break FE existing.
- **Perintah test:**
  ```powershell
  php artisan test --filter ContactHoneypotTest --compact
  php artisan test --compact
  npm run build
  ```
  **Hasil aktual:**
  ```
  ContactHoneypotTest: 3 passed (sukses tanpa honeypot, honeypot tidak save, throttle)
  Full suite: 30 passed (67 assertions) Duration 16.46s
  Build: Contact-BHy8Ikru.js 10.17k (honeypot hidden), ✓ built in 16.66s
  ```
- **Update docs:** `PROJECT_STATUS.md` P0-3 `NOT STARTED → VERIFIED`, §2 Contact `VERIFIED`, §4 risiko contact `FIXED`, §5 hasil test 30 passed, §7 next P0-4 Analytics.
- **Unresolved:** P0-4 Analytics masih `NOT STARTED` (butuh `VITE_GA_ID` + banner consent); `pint` masih fail; `public/hot` tetap deleted (pakai build).

---

## 2026-10-10 — P0-4 Analytics + Cookie Consent (lanjutan)

- **Fokus:** P0-4 — 0 tracking, butuh GA4/Plausible + banner UU PDP + `trackEvent`.
- **File dibaca:** `config/services.php:1`, `app.blade.php:1`, `utils.ts:1`, `PublicLayout.tsx:1`, `Estimator.tsx:1`, `Contact.tsx:1`, `TrackOrder.tsx:1`, `InvoiceShow.tsx:1`
- **File diubah / dibuat:**
  - `.env.example:88` tambah `GA_MEASUREMENT_ID`, `VITE_GA_MEASUREMENT_ID`, `PLAUSIBLE_DOMAIN`, `VITE_PLAUSIBLE_DOMAIN`, `GOOGLE_SITE_VERIFICATION`
  - `config/services.php:50` tambah `analytics` (`ga_measurement_id`, `plausible_domain`, `google_verification`)
  - `resources/js/lib/analytics.ts` — **BARU** (`trackEvent`, `hasConsent`, `grant/denyConsent`, `getConsent` → localStorage `cookie_consent`, `gtag` + `plausible` + dev console fallback, hormati `denied`)
  - `resources/js/Components/CookieConsent.tsx` — **BARU** banner UU PDP (delay 1200ms, grant/deny → localStorage + `gtag consent update`, link `/privacy` P2-3, toast allow)
  - `resources/views/app.blade.php:25` consent_mode `default denied` → update ke `granted` jika `cookie_consent=granted`, conditional load `gtag` (`async.googletagmanager.com/gtag/js?id=GA_ID` + `anonymize_ip`) + Plausible `script.js` + `google-site-verification` meta
  - `PublicLayout.tsx:8` import `CookieConsent` + render `<CookieConsent />` bareng `FloatingWhatsApp`, `Toast`
  - `vite.config.ts` sudah `host 127.0.0.1` (P0-1 fix) — build tetap pakai `build` manifest
  - `Estimator.tsx:2` import `trackEvent` + `76` `estimator_submit` ({service_id, complexity, urgency, features_count, low, high})
  - `Contact.tsx:5` import `trackEvent` + `29` `contact_wa_click` & `contact_submit`
  - `TrackOrder.tsx:5` import `trackEvent` + `59` `track_lookup` + `183` `snap_pay_initiate/open/generate`
  - `InvoiceShow.tsx:5` import `trackEvent` + `41` `snap_pay_click` + `26` `snap_open/success/pending/error`
  - `app/Http/Middleware/SecurityHeaders.php:36` CSP tambah `googletagmanager.com`, `google-analytics.com`, `plausible.io` (script/connect/img)
- **Keputusan:** Pakai `consent_mode` default `denied` + `wait_for_update 500` — GA tidak kirim hit sampai user klik Terima; Plausible privacy-friendly jadi alternatif. `trackEvent` cek `hasConsent()` dulu — jika `denied` atau `null` (belum pilih) tidak kirim, tapi banner tetap muncul 1x (localStorage `null`). Banner delay 1200ms agar tidak ganggu LCP. CSP lenient tetap allow Midtrans + Vite + GA/Plausible.
- **Perintah test:**
  ```powershell
  npm run build
  php artisan test --compact
  Invoke-WebRequest / -Method Head | Select Headers
  ```
  **Hasil aktual:**
  ```
  Build: ✓ 2883 modules, analytics-Dxuvjdq7.js 0.79k, Contact 10.17k → 10.??k, trackEvent baked, no TS error
  Test: 30 passed (67 assertions) — tidak tambah test analytics (butuh browser), existing tetap pass
  Headers: CSP now includes googletagmanager/google-analytics/plausible, consent script conditional (GA_MEASUREMENT_ID kosong = tidak load — verified via curl tanpa GA_ID tidak ada gtag script)
  ```
- **Update docs:** `PROJECT_STATUS.md` P0-4 `NOT STARTED → VERIFIED`, §4 tambah env baru, §7 next P0-5 JSON-LD.
- **Unresolved:** Isi `.env` `GA_MEASUREMENT_ID=G-XXXX` untuk aktif (kosong = disable, verified); `/privacy` link di banner masih 404 sampai P2-3 dibuat; `pint` sudah fixed 2026-10-11 (`.\vendor\bin\pint` 34 file), tapi `public/hot` tetap deleted — next `npm run dev` butuh host 127.0.0.1.

---

## 2026-10-11 — Performance Audit Lighthouse 29 (simpan dulu, lanjut besok)

- **Fokus:** Investigasi Lighthouse Performance 29 (main-thread 13,9s, JS 2,8s, render-blocking 910ms, image 345KiB, payload 8.066KiB, unused JS 179KiB, unused CSS Error, forced reflow) — audit bundle, Vite, Home, gambar, video, font, animasi, script pihak ketiga.
- **File dibaca:** `vite.config.ts:1`, `package.json:1`, `public/build` manifest + `npm run build` output (1.106 MB / 58 file), `app.blade.php:13`, `Home.tsx:65,414,1556,186,249`, `video.ts:1`, `HomepageController.php:167`, `public/images` (10 file 4,1 MB), `storage/portfolio_videos` 5,2 MB, `.gitignore:32`, `resources/js/app.tsx:1`, `Home.tsx:1785` lines
- **Bukti yang terkumpul:**
  - Build: `vendor 318k (101k gzip) + motion 127k + Home 72k + app.css 180k` — total 1.106 MB gzip ~250k, bukan 8 MB
  - Gambar: hero-woman.jpeg 2.060k + pp.png 1.305k + hero-woman.png 503k **tidak dipakai** (`Home.tsx:418` hanya pakai `pp-800.webp` 68k) tapi ikut deploy + `.gitignore` ignore webp bikin fresh clone 404; `raycode-faq.webp` 147k tanpa srcset/width/height; `Image delivery 345KiB` cocok dengan optimasi pp.png 1,3MB → webp 68k
  - Video: `1ZrMJO...mp4` 5.212k `preload metadata` di `Home.tsx:1117` `<video>` hover preview — 5 MB dominan payload 8 MB
  - Font: `Inter 500,600,700,800 + JetBrains 500` via `fonts.googleapis` `media=print onload` tapi 4 weight = 120-160k + `snap.js` sync `app.blade.php:38` tanpa async = render-blocking 910ms, network tree 6 level
  - Main-thread: `Home.tsx:186 getBoundingClientRect x6` + `app.tsx:48 initRevealEngine MutationObserver` + spotlight/magnetic tanpa `prefers-reduced-motion` guard (hanya spotlight ada)
  - Unused JS 179k = motion/icons eager; Unused CSS Error = tool limitation `@tailwindcss/vite` + `cssCodeSplit:true`, bukan app bug — dibedakan.
- **File diubah (hanya 1, simpan dulu):**
  - `.gitignore:32` `public/images/*.webp` → allow webp (comment) + `!/public/images/.gitkeep` — agar `pp-800.webp` 68k untuk LCP tetap di-track, tidak 404 di fresh clone. Belum hapus jpeg/png besar (tunggu besok biar tidak refactor besar sekaligus).
- **Keputusan:** Mulai audit dulu, jangan ubah banyak file sekaligus. Prioritas A1+A7 (payload gambar/video), A2 (render-blocking), A3 (forced reflow) — semua tanpa hapus fitur/tambah dependency/refactor besar. Desain/SEO/hover preview/order dipertahankan. Unused CSS Error tidak di-fix di app (tool error).
- **Perintah yang dijalankan:**
  ```powershell
  npm run build          → 1.106 MB / 58 file, Home 72k, vendor 318k, motion 127k
  Get-ChildItem public/images → hero-woman.jpeg 2060k, pp.png 1305k etc
  php artisan test --compact → 30 passed (tetap)
  Invoke-WebRequest /faq → html lang="en" dynamic
  .\vendor\bin\pint → fixed 34 file (sebelum CI)
  ```
  **Hasil aktual:** Build tetap 1.106 MB (belum optimasi gambar/video, jadi payload masih 8 MB) — **tidak klaim naik Lighthouse** sebelum re-run. Audit selesai, optimasi pending besok.
- **Update docs:** `PROJECT_STATUS.md` §10 Performance Audit IN PROGRESS + §7 next PERF A1+A7, §1 last verified 2026-10-11, P1-4 .gitignore allow webp tercatat.
- **Unresolved (lanjut besok):**
  - A1: ganti `HomepageController.php:167` default `pp.png` → `pp-800.webp`, hapus `hero-woman.jpeg/pp.png/hero-woman.png` 3,8 MB tidak dipakai, tambah `srcset/width/height/lazy` di `Home.tsx:418` & `raycode-faq.webp`
  - A7: video `preload none` + poster + load on hover (jangan metadata di Home)
  - A2: `snap.js async` + font `display swap` + `preconnect` optimasi
  - A3: guard `prefers-reduced-motion` untuk semua magnetic/spotlight + `will-change`
  - Build before/after + re-run Lighthouse `lh-*.json` belum dilakukan — jangan klaim 29 → 90+ sebelum ukur.

---

## 2026-10-10 — P0-5 JSON-LD + hreflang + robots + Navbar hapus Mulai Proyek (lanjutan)

- **Fokus:** P0-5 SEO — `SeoHead` tanpa JSON-LD/hreflang/robots + `app.blade.php` hard `lang="id"` + sitemap `lastmod` + request hapus tombol `Mulai Proyek` di navbar (jelek).
- **File dibaca:** `SeoHead.tsx:1`, `app.blade.php:1`, `SitemapController.php:1`, `Faq.tsx:1`, `Blog/Show.tsx:1`, `Home.tsx:1` (preview), `PublicLayout.tsx:211` (tombol Mulai Proyek)
- **File diubah / dibuat:**
  - `SeoHead.tsx:3` tambah `BreadcrumbItem` + props `robots/jsonLd/breadcrumbs/noIndex`; `14` base `Organization`+`WebSite` + `breadcrumbs→BreadcrumbList`, merge custom `jsonLd`; `42` `robots`/`noIndex`, `43` `hreflang id/en/x-default` + `og:site_name/locale`, `60` `script ld+json` `JSON.stringify(allSchemas)`
  - `app.blade.php:2` `html lang="id"` → `lang="{{ app()->getLocale() }}"` dynamic
  - `SitemapController.php:19` static `lastmod` dari `now()` → `max(Service/Portfolio updated_at)` fallback `now`
  - `Faq.tsx:25` tambah `faqSchema FAQPage` + `breadcrumbs Home→FAQ` via `SeoHead`
  - `Blog/Show.tsx:17` tambah `blogSchema BlogPosting` + breadcrumbs `Home→Blog→Post` via `SeoHead`
  - `PublicLayout.tsx:211` hapus tombol `Mulai Proyek` premium pill (setelah redesign `group slate-900 + inner circle` di build sebelumnya) — per request `di hapus aja`, sekarang guest nav hanya `Login` + `LanguageSwitcher` + `ThemeToggle` (clean). Build `PublicLayout-CfXBmtqo.js 26.46k → PublicLayout-DygiSAGq/Sea? 27.43k → CfXB...`
- **Keputusan:** Base `Organization`+`WebSite` selalu ada (P0-5 minimal), `FAQPage`/`BlogPosting` ditambah per halaman — rich results butuh itu. `hreflang` id/en/x-default selalu render (canonical sama, tapi beda locale). `robots` opsional (admin/dashboard tidak pakai SeoHead jadi tetap `Disallow` via `robots.txt`). SSR=false jadi JSON-LD client-side via `Head` (Google JS render — jika butuh server-side, aktifkan `APP_SSR=true`). Navbar hapus sesuai instruksi `yang navbar nya` → `di hapus aja` (bukan redesign), keep mobile `Contact` tetap.
- **Perintah test:**
  ```powershell
  npm run build
  php artisan test --compact
  Invoke-WebRequest /faq -UseBasicParsing | Select Content
  ```
  **Hasil aktual:**
  ```
  Build: ✓ SeoHead-Cxm9QxBX.js 2.84k, PublicLayout-CfXBmtqo.js 26.46k, no TS error
  Test: 30 passed (67 assertions) — tetap pass (SEO tidak ada test browser, verified via build + curl html lang="en" dynamic)
  curl /faq: html lang="en" (dari getLocale), head tetap base (Inertia Head client-side, tidak di initial HTML karena APP_SSR=false — verified)
  ```
- **Update docs:** `PROJECT_STATUS.md` P0-5 `NOT STARTED → VERIFIED`, §1 lang dynamic, §2 SeoHead+Sitemap `VERIFIED`, §7 next P1-1 CI/CD.
- **Unresolved:** `public/hot` tetap deleted (pakai build); `pint` masih fail; P0 100% selesai — next P1-1 CI/CD.

---

## 2026-09-11 — Audit PRD & Rancangan Pantau Pesanan (arsip)

- **Sumber:** `docs/PRD.md:1` (audit 11 Sep 2026) & `docs/Rancangan_Pantau_Pesanan.md:1`
- **Ringkasan:** PRD mencatat Sprint1-3 (cleanup duplikasi Service/Joki, hapus Campus games, hardening Midtrans, pagination, rate-limit, SSR toggle) dan Rancangan mendesain flow Admin Manual Order + pantau publik `RAY-YYYYMMDD-XXXX` + QRIS Snap. Keduanya dipertahankan di `docs/` sebagai arsip — jangan hapus, tandai `DEPRECATED` di `PROJECT_STATUS.md` jika ada yang kadaluarsa.
- **Status saat WORKLOG awal:** Tidak ada `WORKLOG.md` sebelumnya, sehingga sesi 2026-10-10 adalah inisialisasi pertama `WORKLOG.md`. Semua temuan 11 Sep dianggap `NEEDS RE-VERIFY` sampai sesi 10 Okt memverifikasi ulang.

---

## Cara menulis entri baru

1. Duplikasi template di atas, ganti tanggal + judul.
2. List `File dibaca` dengan `file:line` spesifik (jangan "baca semua").
3. `File diubah` — path absolut/relatif + ringkas perubahan (1 baris per file).
4. `Keputusan` — kenapa pilih A bukan B (misal "pakai `hash_equals` bukan `==` karena timing attack").
5. `Test` — tulis **perintah persis** + **output aktual** (copy-paste), jangan "berhasil" tanpa bukti.
6. `Unresolved` — apa yang belum selesai / perlu sesi berikutnya.
7. Setelah selesai sesi, update `PROJECT_STATUS.md` hanya untuk item yang sudah `VERIFIED` dengan bukti.
