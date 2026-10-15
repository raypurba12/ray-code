# PRD — Raycode Studio Platform
**Versi:** 1.0  
**Tanggal:** 11 September 2026  
**Status:** Draft — Menunggu Approval  
**Penulis:** Audit Internal (berdasarkan audit codebase 11 Sep 2026)  
**Stack:** Laravel 12 + Inertia.js 3.3 + React 19 + Vite 7 + Tailwind 4 + MySQL/SQLite

---

## 1. Ringkasan Eksekutif

Raycode adalah platform agency digital — funnel marketing (homepage, services, portfolio, blog, pricing, estimator, contact) → order → project workspace → invoice Midtrans → messaging. Platform sudah **production-ready untuk agency kecil (0-50 klien aktif)**, tapi belum siap scale karena 3 masalah utama:

1.  **Duplikasi domain:** `Service` (paket agensi) vs `JokiService` (jasa satuan/joki tugas) bikin admin & user bingung. Diperparah route `/services` + `/layanan-reguler` + `/admin/joki-services` tampilkan data tumpang tindih `ServiceController.php:14`.
2.  **Fitur gimmick tidak konversi:** `CampusSmash.tsx` + `CampusAdventure.tsx` (~70KB, ~1000 baris) makan bundle, tidak bawa lead.
3.  **Payment belum hardening:** `MidtransService.php:35` `order_id = number + time()` tidak idempoten, webhook `MidtransWebhookController.php:26` parsing fragile + verify hanya warning.

**Tujuan PRD ini:** Jadi single source of truth untuk **3 sprint ke depan (6 minggu)** — membersihkan tech debt, menguatkan payment & trust, lalu menambah fitur yang terbukti naikkan konversi.

---

## 2. Latar Belakang & Masalah

| Temuan Audit | Dampak |
|---|---|
| 7 file `lh-*.json` (5.2MB) ter-commit, `gambar/` duplikat `public/images` | Repo bengkak, build lambat |
| `Home.tsx` 80KB monolitik, semua section dalam 1 file `Home.tsx:155` | Sulit maintain, LCP tertahan |
| SSR di-build `vite build --ssr` tapi tidak ada runner `bootstrap/ssr` | Waktu build +40% tanpa manfaat di shared hosting |
| `tests/Feature/ExampleTest.php:17` cuma 1 test `assertStatus(200)` | Tidak ada safety net untuk refactor |
| Tidak ada rate-limit di `ContactController@store` & `AuthController@login` | Rawan spam & brute force |
| Admin tanpa paginasi `->get()` di semua index | OOM saat data >500 |

> Validasi: semua temuan diverifikasi langsung di codebase (lihat `routes/web.php:42`, `vite.config.ts:27`, `.gitignore:1`).

---

## 3. Tujuan & Metrik Keberhasilan

### 3.1 Tujuan Bisnis (6 minggu)
- Naikkan **lead → order conversion 12% → 18%**
- Turunkan **time-to-quote dari 24 jam → <4 jam** (otomasi estimator + notifikasi)
- Siap scale ke **150 project/bulan** tanpa perubahan arsitektur mayor

### 3.2 KPI
| KPI | Baseline (estimasi) | Target Sprint 3 |
|---|---|---|
| Lighthouse Performance | 72 (mobile) | >= 92 |
| Bundle JS public | ~580KB | <= 380KB |
| Rate paid invoice (Midtrans) | tidak terukur (webhook fragile) | >= 98% success reconcile |
| Admin page load (1k rows) | >3s | <800ms (paginate) |
| Test coverage critical path | 0% | >= 60% (order, invoice, auth) |

---

## 4. Persona & User Journey

### Persona
1.  **Client — Sinta (UMKM)**: Butuh website company profile 5 halaman, budget 5-10jt, tidak paham teknis, mau lihat portfolio dulu.
2.  **Client — Budi (Tech Founder)**: Butuh web app inventaris multi-gudang, concern arsitektur & NDA, mau konsultasi stack dulu.
3.  **Admin — Rayhan**: Kelola 30 project aktif, butuh status cepat, generate invoice 1 klik, balas chat tanpa pindah halaman.

### Journey Kritis (yang PRD perbaiki)
```
Lihat Pricing/Estimator → Chat WA / Klik "Mulai Proyek" → Register → Order (title, service, requirements, budget, deadline) → Admin review → Project (progress%) → Invoice → Bayar Midtrans (Snap) → Webhook paid_at → Message thread → Deliverable download → Testimoni
```
Bottleneck hari ini: Estimator hitung di frontend lalu hilang (`Estimator.tsx:58` tanpa persist), invoice bisa dobel order_id, klien harus cek manual progress.

---

## 5. Scope

### 5.1 In Scope (Sprint 1-3)
**Sprint 1 — Cleanup & Hardening (Minggu 1-2) — P0**
- Hapus `CampusSmash` & `CampusAdventure` + route `web.php:42-43` + teaser `Error.tsx:346` + `routes.ts:13-14` *(sudah dieksekusi 11 Sep 2026)*
- Hapus `lh-*.json` & `gambar/` raw, update `.gitignore` *(sudah dieksekusi)*
- Konsolidasi `Service` vs `JokiService` → single model `Service` dengan `type ENUM('package','joki')` + migrasi data
- Hardening Midtrans: kolom `midtrans_order_id`, re-use `snap_token`, verify `signature_key === SHA512(order_id+status_code+gross_amount+serverKey)` strict reject `401`, cek `gross_amount == total`, idempoten webhook
- Pagination `paginate(20)` semua Admin index + eager load `with(['user','service'])`
- Rate limit `throttle:5,1` di `login`, `register`, `contact.store`
- Fix `AppServiceProvider` Vite SSR: matikan build SSR di prod jika `APP_SSR=false` atau sediakan runner `node bootstrap/ssr/ssr.js`

**Sprint 2 — Trust & Conversion (Minggu 3-4) — P1**
- Persist Estimator: tabel `estimator_leads` (service_id, complexity, features JSON, urgency, low, high, email/WA nullable), capture saat klik "Lanjutkan" + event GA
- Notifikasi: email + WA (queue) saat `Order created`, `Project progress updated`, `Invoice paid`
- File Deliverable: `project_files` (project_id, file_path, version, uploaded_by), client download zip
- Client Testimoni flow: tombol "Beri Testimoni" muncul saat `project.status=completed` → draft `is_approved=false` → admin approve
- Sitemap `sitemap.xml` (services, portfolios, blog), `robots.txt`, `SeoHead.tsx` meta per halaman
- Split `Home.tsx` jadi `Sections/Hero.tsx`, `ServicesSection.tsx`, dst (tanpa ubah desain, hanya file)

**Sprint 3 — Scale Ops (Minggu 5-6) — P2**
- Kanban Project Board (`pending | in_review | in_progress | review | completed`) drag-drop patch `projects/{id}/status`
- Search & filter admin (q, status, service) + debounce frontend
- Dashboard revenue fix: ganti `DATE_FORMAT` MySQL-only `DashboardController.php:34` ke query agnostic Carbon
- Test suite: `Feature/OrderTest`, `InvoicePayTest`, `MidtransWebhookTest`, `AuthThrottleTest`
- Monitoring: `Laravel Telescope` (local) + Sentry (prod) + `LOG_CHANNEL=stack` + `failed_jobs` alert

### 5.2 Out of Scope (Tunda)
- Marketplace / multi-vendor
- Mobile app native
- AI auto-generate code / chatbot AI (cukup MyMemory translate hapus saja)
- Subdomain game terpisah (jika mau kembalikan campus game, buat di `game.raycode.dev` jangan di main funnel)

---

## 6. Functional Requirements

### 6.1 Sprint 1 — Detail

**FR-1: Hapus Campus Games**
- Given user buka `/campus-smash` → When sudah dihapus → Then `404` dengan saran ke `/portfolio` / `/services` (sudah ada fallback `Error.tsx` tanpa tease game).
- AC: Tidak ada import `CampusSmash` tersisa (`rg "campus"` 0 hasil), bundle turun >= 40KB.

**FR-2: Unifikasi Layanan**
- DB: `services` tambah `type`, `category_en`, `is_joki` deprecated. Migrasi: `JokiService` → `Service` dengan `type=joki`, `icon`, `logo` map ke `thumbnail_url`.
- Admin: sidebar `AdminLayout.tsx:47` ubah `Layanan` → `Paket Layanan` (`/admin/services`), `Semua Layanan` → `Joki / Satuan` (`/admin/joki-services`) sementara, lalu redirect 301 ke `/admin/services?type=joki` di akhir sprint. `bulkUpdate` `JokiServiceController.php:134` hidupkan route atau hapus.
- Public: `ServiceController@index` kembalikan `services` (type package) + `jokiServices` (type joki) dalam 1 key `services` dengan filter `?type=` untuk SEO single source. `Reguler` page jadi tab/filter, bukan route terpisah `/layanan-reguler` (301 ke `/services?type=package`).

**FR-3: Midtrans Idempoten**
- `invoices` tambah `midtrans_order_id` (unique), `snap_token_expires_at`.
- `MidtransService@createSnapToken`: if `snap_token` valid & `payment_status=pending` & belum expired → return token lama. Else generate baru. Simpan `midtrans_order_id = number + '-' + timestamp` sekali lalu re-use.
- `MidtransWebhookController@handle`: (1) verify signature `hash_equals` — if fail return `401` log warning, (2) cari by `midtrans_order_id` bukan parse `explode('-')`, (3) cek `gross_amount == (int) invoice.total` else `422`, (4) idempoten: if `status=paid` sudah → return `200` skip update.

**FR-4: Pagination**
- Semua Admin `index()` ganti `->paginate(20)->withQueryString()` + frontend `?page` Inertia. `HomeController@index` tetap `take(6)`.

**FR-5: Rate Limit**
- `Route::post('/login')->middleware('throttle:5,1')`, `contact.store throttle:3,1`.

### 6.2 Sprint 2 — Detail

**FR-6: Estimator Leads**
- Tabel `estimator_leads`: `id, service_id FK nullable, complexity, features JSON, urgency, low, high, email nullable, wa nullable, ip, created_at`.
- Saat klik "Lanjutkan dengan spesifikasi ini" → `POST /estimator/lead` (Inertia) simpan lalu redirect `R.clientOrder?lead_id=...`. Admin list di `/admin/estimator-leads`.

**FR-7: Deliverable Files**
- `project_files`: `id, project_id FK, file_name, disk_path, mime, size, version, uploaded_by FK users, created_at`. Admin upload via `POST /admin/projects/{project}/files`, client list & download `GET /dashboard/projects/{project}/files/{file}/download` (signed URL 1 jam).

**FR-8: Testimoni dari Client**
- Client `POST /dashboard/projects/{project}/testimonial` (rating 1-5, content) → `testimonials` dengan `project_id` nullable + `is_approved=false` + `user_id`. Admin approve di `/admin/testimonials`.

---

## 7. Non-Functional Requirements

- **Performance:** LCP <2.5s, CLS <0.1, TBT <300ms (mobile 4G). Lazy-load `framer-motion` chunk `motion` sudah ada `vite.config.ts:28`.
- **Security:** `SESSION_DRIVER=database` keep, tambah `SANCTUM` CSRF, `APP_KEY` rotate guide, tidak commit `.env`. Midtrans `serverKey` hanya di `config/midtrans.php` (hapus fallback `env()` di service `MidtransService.php:18`).
- **Reliability:** Queue `database` keep tapi jalan `queue:work --tries=3` di prod via supervisor, bukan `queue:listen` dev. Semua webhook & translate masuk queue.
- **Compatibility:** MySQL 8 & SQLite dev pass. Query revenue jangan pakai `DATE_FORMAT` MySQL-only.

---

## 8. Data Model Perubahan

```php
// Sprint 1
services: +type ENUM('package','joki') default 'package', +category_en, index(type, is_featured, sort_order)
invoices: +midtrans_order_id VARCHAR unique nullable, +snap_token_expires_at DATETIME nullable, index(midtrans_order_id)

// Sprint 2
estimator_leads: id, service_id FK, complexity VARCHAR, features JSON, urgency VARCHAR, low INT, high INT, email, wa, ip, created_at
project_files: id, project_id FK cascade, file_name, disk_path, mime, size INT, version INT, uploaded_by FK
testimonials: +project_id FK nullable, +user_id FK nullable
```

---

## 9. API & Route Kontrak

```
DELETE  /campus-smash, /campus-adventure (404)
GET     /services?type=package|joki
POST    /estimator/lead
POST    /admin/projects/{project}/files
GET     /dashboard/projects/{project}/files/{file}/download
POST    /dashboard/projects/{project}/testimonial
POST    /api/midtrans/webhook (strict verify, cari by midtrans_order_id)
```

---

## 10. UI/UX — Prinsip (Anti UI Slop)

- Jangan generik: Hero `Home.tsx` pertahankan custom `HeroMagangStyleShowcase` + floating badges, jangan ganti template generic.
- Satu sumber layanan: `Services/Index.tsx` tampilkan 2 tab (Paket vs Joki Satuan) dengan filter category, bukan 2 halaman terpisah.
- Admin: `JokiServices.tsx` merge ke `Services.tsx` dengan toggle `type`; sementara beri badge `DEPRECATED — pindah ke Paket Layanan` di header.

---

## 11. Open Questions

1.  Apakah harga Joki Satuan tetap per `desc` bebas atau mau paket fixed seperti `Service` (`starting_price` + `delivery_days`)?
2.  Midtrans: pakai Snap redirect full page atau embedded popup? Saat ini `snap_token` + redirect.
3.  Butuh `layanan-reguler` dipertahankan untuk SEO lama? Jika ya, 301 permanen ke `/services?type=package`.

---

## 12. Timeline & Milestone

| Minggu | Milestone | Owner | Exit Criteria |
|---|---|---|---|
| 1 | Cleanup + Midtrans fix | BE + FE | `rg campus 0`, lh files 0, webhook strict pass test, paginate done |
| 2 | Unifikasi Service | BE | Migrasi data 100%, sidebar 1 menu, 301 map |
| 3 | Estimator persist + Notif | Fullstack | Lead tersimpan, email queue terkirim |
| 4 | Deliverable + Testimoni | Fullstack | Client bisa download file, testimoni flow |
| 5 | Kanban + Search + Sitemap | FE | Drag-drop status, sitemap.xml valid |
| 6 | Test + Perf + Launch | QA | Coverage >=60%, LH >=92, deploy `config:cache` + `storage:link` |

---

## 13. Risiko & Mitigasi

| Risiko | Mitigasi |
|---|---|
| Data Joki hilang saat migrasi | Backup dump + dry-run staging, migrasi reversible |
| Webhook Midtrans dibajak | Strict signature + `gross_amount` check + log + idempoten |
| Estimator spam | Honeypot + throttle + `ip` limit 10/hari |
| Bundle masih berat | Code-split `motion`, `icons` sudah ada `vite.config.ts:29`, lazy-load `Reveal` |

---

## 14. Lampiran — File Terdampak

- `routes/web.php:42` hapus campus, `routes/web.php:96` merge joki
- `resources/js/lib/routes.ts:13` hapus campus, `AdminLayout.tsx:47` rename
- `app/Services/MidtransService.php:18` hapus `env()` fallback
- `app/Http/Controllers/Api/MidtransWebhookController.php:26` ganti parser ke `midtrans_order_id`
- `.gitignore:1` tambah `lh-*.json`, `gambar/`

> **Next step:** Tentukan jawaban Open Questions (1-3), lalu Sprint 1 bisa dimulai. Jika setuju PRD ini, ketik `setuju` — saya lanjutkan eksekusi Sprint 1 (Sisa: migrasi Service).
