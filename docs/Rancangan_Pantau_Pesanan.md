# Rancangan — Admin Input Manual + Pantau Pesanan (QRIS + Kode Pesanan)

**Status:** Rencana — Belum implementasi kode  
**Tanggal:** 11 Sep 2026  
**Prinsip:** Hybrid — Login tetap ada, tapi alur utama **WA → Admin input → Kirim link bayar + kode tracking**. Customer pantau tanpa login cuma pakai kode.

---

## 1. Masalah & Solusi

**Masalah hari ini:**
- `OrderController@store` `Client/OrderController.php:26` wajib `auth`, padahal deal joki kebanyakan jadi di WA dulu baru dicatat.
- Invoice baru ada setelah admin `POST /admin/orders/{order}/invoice` `routes/web.php:83`, tidak ada link QRIS siap-share.
- Customer tidak bisa cek progress tanpa login → tanya WA terus.

**Solusi:**
1. **Admin Tambah Pesanan Manual** di `/admin` — input atas nama customer (nama, WA, email opsional) + layanan + budget/deadline → sistem auto buat `User` (jika belum ada) + `Project` + `Invoice` + auto `order_code` unik → generate **QRIS Link (Midtrans Snap)** siap copy.
2. **Halaman Publik Pantau Pesanan** `/pantau-pesanan` — input `kode pesanan` (contoh `RAY-20250911-A7K9`) → tampil status, progress, invoice, tombol Bayar QRIS.

---

## 2. User Flow

### A. Flow Admin (WA → Input → Kirim Link)
```
WA: Customer "Kak mau joki Android 2jt" → Admin deal → 
Admin buka /admin/orders → Klik [Tambah Pesanan Manual] →
Form: nama, WA (+62), email (opsional), layanan (select services type=joki/package), judul, deskripsi, budget, deadline →
Submit → BE:
  - cari User by WA/email, jika tidak ada → create User role=client, password random, phone=WA
  - create Project {user_id, service_id, title, requirements, budget, deadline, status=pending, order_code=RAY-...}
  - create Invoice {number=INV-..., project_id, amount, tax 11%, total, status=unpaid, due_date}
  - generate Midtrans QRIS Link via MidtransService (snap_token)
→ Admin dapat kartu: 
  [Kode Pesanan: RAY-XXX] [Link Pantau: /pantau-pesanan?code=RAY-XXX] [Link Bayar QRIS] [Invoice PDF] → Copy → Kirim WA ke customer
```

### B. Flow Customer (Tanpa Login)
```
Customer terima WA berisi kode + 2 link →
Opsi 1: Klik Link Pantau → /pantau-pesanan?code=RAY-XXX langsung tampil
Opsi 2: Buka nav "Pantau Pesanan" → /pantau-pesanan → input kode → Lihat →
Info tampil: 
  - Judul, Layanan, Status badge (pending→in_review→in_progress→review→completed)
  - Progress bar % + timeline ProjectUpdate (mis: "Desain disetujui")
  - Invoice: total, due_date, status unpaid/paid, tombol [Bayar via QRIS] (buka Snap)
  - Chat? Tidak login → cukup tombol "Hubungi Admin WA" dengan prefill kode
```

---

## 3. Data Model & Logika Kode

### 3.1 Format Kode Pesanan (order_code)
- **Format:** `RAY-YYYYMMDD-XXXX` → `RAY-20250911-A7K9` (8 char → 4 random alnum uppercase)
- **Sifat:** Unique, index, tidak sequential (cegah tebak), human readable, bisa dicetak di invoice.
- **Contoh di DB:** `projects.order_code VARCHAR(20) UNIQUE, projects.public_token VARCHAR(32)` (optional untuk signed link)

```sql
projects: +order_code VARCHAR(20) UNIQUE, +public_token VARCHAR(32) nullable, +client_name_cache VARCHAR255, +client_wa_cache VARCHAR20
  -- cache nama/WA saat guest agar tidak join user jika anon, tapi kita tetap buat user
invoices: sudah ada number INV-YYYYMM-xxxx, tambah midtrans_order_id (sudah), snap_token (sudah)
estimator_leads: tidak dipakai di flow ini
```

**Generator logic (Laravel):**
```php
do {
  $code = 'RAY-'.now()->format('Ymd').'-'.Str::upper(Str::random(4));
} while (Project::where('order_code', $code)->exists());
```

### 3.2 Project + Invoice Creation (Admin Manual)
- **Route Admin:** `POST /admin/orders/manual` (baru)
- **Validasi:** `client_name required, client_wa required regex +62, client_email nullable, service_id exists, title, requirements min:20, budget, deadline after:today`
- **User resolve:**
  ```php
  $user = User::firstOrCreate(
    ['phone' => $wa], // atau email jika ada
    ['name' => $name, 'email' => $email ?? $wa.'@raycode.guest', 'password' => Hash::make(Str::random(12)), 'role'=>'client']
  );
  ```
- **Project create:** seperti `OrderController@store` tapi tanpa `auth()->id()` → pakai `$user->id`, `status=pending`, `order_code` auto.
- **Invoice auto:** `Invoice::create([number => gen INV-..., amount => budget, tax => 11%, total => amount*1.11, status=>unpaid, due_date => deadline ?? +7 hari])`
- **QRIS Link:** panggil `MidtransService->createSnapToken($invoice)` → simpan `snap_token` + `midtrans_order_id` → frontend dapat `https://app.sandbox.midtrans.com/snap/v2/vtweb/{token}` yang otomatis tampil QRIS jika customer pilih QRIS di Snap. Alternatif Core API charge `payment_type=qris` → return `qr_string` + `base64 QR`. **Rekomendasi:** pakai **Snap** saja (sudah ada `MidtransService.php:29`) — di Snap customer bisa pilih QRIS, Gopay, VA. Jika mau QRIS only, set `enabled_payments: ['gopay','qris']` di params Snap.

### 3.3 Pantau Pesanan (Public)
- **Route:** `GET /pantau-pesanan` → Inertia `Public/TrackOrder` (tanpa auth)
- **Input:** `code` query atau form `order_code`
- **BE:** `TrackOrderController@show`:
  ```php
  $project = Project::with(['service:id,title,slug','invoices','updates'])
    ->where('order_code', $code)->firstOrFail();
  // rate limit: throttle:10,1 per IP untuk cegah brute force tebak kode
  ```
- **Return:** `project`, `invoice` (latest unpaid/paid), `status`, `progress`, `updates`, `payment_url` (snap token vtweb url jika unpaid)
- **Security:**
  - Kode 12 char entropy 36^4 ~1.6jt kombinasi per tanggal → tidak gampang tebak.
  - Rate limit 10/menit per IP.
  - Jangan expose `email/WA` full → mask `+62 812 *** 5432`.
  - Tidak ada edit, hanya read. Tombol bayar pakai `POST /api/track/{code}/pay` yang re-use `snap_token` (idempoten `MidtransService` sudah).

### 3.4 Status & Progress
Gunakan enum existing `Project.status: pending→in_review→in_progress→review→completed`. Admin update via `PATCH /admin/projects/{project}` `Admin/ProjectController.php` + tambah `ProjectUpdate` untuk timeline yang tampil di pantau.

---

## 4. Endpoint Rancangan

| Method | Path | Auth | Fungsi |
|---|---|---|---|
| `POST` | `/admin/orders/manual` | admin | Buat manual order + user + invoice + qris (baru) |
| `POST` | `/api/midtrans/webhook` | — | Sudah ada — strict verify `MidtransWebhookController.php:15` |
| `GET` | `/pantau-pesanan` | guest | Halaman input kode |
| `GET` | `/pantau-pesanan?code=RAY-...` | guest | Show detail project by code (API via Inertia) |
| `POST` | `/pantau-pesanan/lookup` | guest throttle:10,1 | Body {code} → redirect ke ?code= |
| `POST` | `/track/{order_code}/pay` | guest (cek IP) | Generate/re-use snap_token untuk invoice, return vtweb url |

**Frontend nav:** `PublicLayout.tsx:152` tambah item `Pantau Pesanan` di nav (sebelah `Cara Pesan`), dan hero `CaraPesan.tsx` tambah step 4.

---

## 5. UI Wireframe (Ringkas)

**Admin — Tambah Pesanan Manual** (`/admin/orders` tombol +)
```
[Card] Tambah Pesanan Manual
[Nama Customer*] [WA* +62] [Email opsional]
[Layanan* select] [Judul*] [Deadline* date]
[Deskripsi/Requirements* textarea]
[Budget* IDR] [Diskon?]
[Submit → Buat & Kirim QRIS]
→ Setelah submit tampil:
  [Kode: RAY-...] [Copy] 
  [Link Pantau: .../pantau-pesanan?code=RAY-...] [Copy]
  [Link Bayar QRIS: https://...vtweb/...] [Copy + QR Preview]
  [Invoice: INV-... Rp ...] [Download PDF]
  [Kirim WA] href="https://wa.me/{wa}?text=Halo {nama} kode {code} ..."
```

**Publik — /pantau-pesanan**
```
Header: "Pantau Pesanan — Masukkan Kode"
[Input Kode: RAY-____] [Cari]   // dengan font-mono
Jika found:
  Card Project: Judul | Layanan | Badge status | Progress 65% bar
  Timeline: [Mockup disetujui] [Beranda selesai] ...
  Card Invoice: INV-... | Rp ... | Jatuh tempo | Status unpaid (red) | [Bayar via QRIS]
  Jika paid → badge hijau + "Lunas" + paid_at
  CTA: [Hubungi Admin WA] dengan prefill kode
Jika not found: "Kode tidak ditemukan. Cek lagi atau hubungi WA."
```

---

## 6. QRIS & Invoice Detail

- **Invoice number:** sudah auto `INV-YYYYMM-0001` `DatabaseSeeder.php:411`. Keep.
- **QRIS Link:** Snap v2 → `snap_token` simpan di `invoices.snap_token`, expiry 14 menit `MidtransService.php:64`. Untuk share WA panjang, buat **short link** optional via `route('track.pay', code)` yang redirect ke Snap vtweb, jadi link WA pendek `raycode.dev/pay/RAY-xxx`.
- **PDF Invoice:** generate via `barryvdh/laravel-dompdf` (belum ada) — template simple: logo, kode pesanan, service, budget, total, status, QR bayar.

---

## 7. Keamanan & Edge Case

- Kode pesanan tidak sequential → tidak bisa enum.
- Throttle pantau 10 req/menit/IP + 3/menit per kode (Log failed lookup).
- Mask WA/email di pantau (privacy).
- Jika customer sudah punya akun (login), tetap bisa lihat pantau via kode + tetap bisa login ke `/dashboard/projects/{id}` (kode → redirect ke dashboard jika auth & owner cocok).
- Kadaluarsa QRIS: Snap token expire 14m → FE pantau ada tombol "Refresh Link Bayar" yang hit `POST /track/{code}/pay` lagi.

---

## 8. Langkah Implementasi (Urutan)

1. Migrasi `projects: order_code, public_token, client_wa_cache` + backfill untuk existing projects (generate code untuk 2 project demo)
2. `TrackOrderController` + `GET /pantau-pesanan` + `POST /track/{code}/pay`
3. `Admin/OrderController@storeManual` + form Inertia `Admin/OrdersManual.tsx` + auto User + Invoice + QRIS
4. UI `Public/TrackOrder.tsx` + tambah nav `PublicLayout.tsx`
5. Tambah `routes.ts` `R.trackOrder`, `R.trackPay`
6. Update `README` cara pakai pantau

**Estimasi:** 2 hari (BE 1 hari, FE 1 hari), tanpa ubah desain besar.

---

## 9. Keputusan yang Butuh Lu

1. **Kode format:** `RAY-YYYYMMDD-XXXX` OK atau mau `RC-8CHAR` lebih pendek?
2. **QRIS only atau Snap all payments?** Snap lebih fleksibel (QRIS+VA+Gopay), QRIS only lebih clean untuk joki.
3. **Invoice PDF perlu sekarang atau nanti?** Bisa tahap 2.

> Jika setuju rancangan ini, ketik `lanjut` — saya langsung eksekusi migrasi + controller + halaman pantau (tanpa ubah icon/logo lagi).
