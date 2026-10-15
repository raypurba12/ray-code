# Raycode — Studio Pengembangan Web & Digital Service

Platform jasa digital berbasis **Laravel 12 + Inertia.js + React 19**. Menangani layanan website, web-app, debugging, portfolio, blog, pricing estimator, sampai dashboard client & admin.

> Live: `http://localhost:8000` (dev) | Stack production-grade dengan SSR, Tailwind 4, dan TypeScript.

---

## Fitur Utama

**Public**
- `/` Homepage dinamis (featured services, portfolio, testimonial, pricing, FAQ, blog)
- `/services`, `/services/{slug}` (Layanan Paket & Joki Satuan)
- `/portfolio`, `/portfolio/{slug}`
- `/blog`, `/blog/{slug}`
- `/pricing`, `/estimator`, `/pantau-pesanan` (Track Order), `/faq`, `/contact`, `/cara-pesan`
- Multi-bahasa ID/EN (`resources/js/lib/translations.ts:1`)
- Integrasi Midtrans Snap & Webhook (Idempoten & Signature Security)

**Client Dashboard** (`/dashboard` - auth)
- Lihat progress project, milestone & update
- Buat order layanan (`/dashboard/order`)
- Download file deliverable proyek (`/dashboard/projects/{project}`)
- Kelola invoice & pembayaran via Midtrans Snap
- Messaging langsung dengan admin

**Admin Panel** (`/admin` - role admin)
- Kelola Services (Paket & Joki), Portfolios, Blog, Pricing Plans, Testimonials, FAQs
- Kelola Projects, Orders, Estimator Leads, Messages, Users, Settings & Homepage
- Upload Deliverable Files & manajemen invoice Midtrans

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| Backend | PHP 8.2, Laravel 12.67, Inertia Laravel 3.3 |
| Frontend | React 19, TypeScript 7, Vite 7, Tailwind CSS 4 |
| Animasi | Framer Motion 13, lucide-react |
| Database | MySQL (prod) / SQLite (dev), Eloquent ORM |
| Auth & Session | Laravel Session (database), role `admin` / `client` |
| Build | Vite SSR (`resources/js/ssr.tsx`), code-split `vendor` + `motion` |

---

## Requirements

- PHP ^8.2 + ext `pdo_mysql` / `sqlite`
- Composer ^2.x
- Node.js ^20 + npm
- MySQL ^8.0 **atau** SQLite (untuk dev cepat)
- Git

---

## Quick Start

```powershell
# 1. Clone
git clone https://github.com/USERNAME/raycode.git
cd raycode

# 2. Install dependency (otomatis copy .env, generate key, migrate, build)
composer setup
# atau manual:
# composer install
# copy .env.example .env
# php artisan key:generate

# 3. Setting database
# Opsi A - SQLite (paling cepat, tanpa MySQL):
# sudah default di .env.example: DB_CONNECTION=sqlite
# New-Item -ItemType File -Path database/database.sqlite -Force

# Opsi B - MySQL (sesuai error kamu sebelumnya):
# buat database `raycode` di MySQL, lalu edit .env:
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=raycode
# DB_USERNAME=root
# DB_PASSWORD=

php artisan migrate --seed
npm install
npm run build

# 4. Jalankan dev (3 proses sekaligus: server + queue + vite)
composer dev
# atau terpisah:
# php artisan serve
# npm run dev
```

Buka `http://localhost:8000`

### Akun Default (dari `database/seeders/DatabaseSeeder.php:1`)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@raycode.dev` | `password` |
| Client | `client@raycode.dev` | `password` |
| Client | `budi@startup.io` | `password` |

---

## Script Penting

| Command | Fungsi |
|---|---|
| `composer setup` | install + key + migrate + build |
| `composer dev` | serve + queue:listen + vite (concurrently) |
| `php artisan migrate --seed` | migrate & seed data dummy |
| `npm run dev` | Vite HMR |
| `npm run build` | Build + SSR (`vite build && vite build --ssr`) |
| `php artisan test` | Jalankan PHPUnit 11 |
| `php artisan pint` | Code style fixer |

---

## Struktur Project

```
app/Http/Controllers/
├── Admin/ (Homepage, Service, Portfolio, PricingPlan, Project, etc.)
├── Client/ (Dashboard, Project, Order, Invoice, Message)
├── Auth/AuthController.php
├── HomeController.php, ServiceController.php, etc.

resources/js/
├── Pages/Public/ (Home, Services, Portfolio, Blog, Pricing, Estimator, Contact)
├── Pages/Admin/ & Pages/Client/
├── Components/layout/ (PublicLayout, AdminLayout, ClientLayout)
├── lib/i18n.tsx, translations.ts, routes.ts
vite.config.ts (tailwind + react + manualChunks vendor/motion)
```

---

## Troubleshooting

**`SQLSTATE[HY000] [2002] No connection could be made...` (di `Connection.php:838`)**
> MySQL tidak jalan / config salah. Solusi:
> 1. Pastikan MySQL service running (XAMPP/Laragon -> Start MySQL)
> 2. Cek `.env`: `DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=raycode` harus ada
> 3. Atau ganti ke SQLite untuk dev: `DB_CONNECTION=sqlite` dan `touch database/database.sqlite` lalu `php artisan migrate`
> 4. Jika pakai `SESSION_DRIVER=database`, pastikan tabel `sessions` sudah ter-migrate

**`APP_KEY` kosong**
```powershell
php artisan key:generate
```

---

## Deploy Checklist

- [ ] `APP_ENV=production`, `APP_DEBUG=false`, `APP_URL=https://domain.com`
- [ ] `php artisan config:cache && php artisan route:cache && php artisan view:cache`
- [ ] `npm run build`
- [ ] Setup storage link `php artisan storage:link`
- [ ] Jangan push `.env`, `/vendor`, `/node_modules`, `/public/build`

---

## Lisensi

MIT — sama seperti Laravel skeleton. Silakan modifikasi untuk kebutuhan studio kamu.

Dibuat dengan Laravel + React oleh **Raycode Studio**.
