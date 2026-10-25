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

## 2026-10-25 (lanjutan) — TTFB: `config:cache` + `route:cache` di `deploy.sh`

- **Fokus:** Menjalankan `config:cache` + `route:cache` dan memasukkannya ke pipeline deploy agar request produksi tidak mem-parsing `.env` dan mendaftarkan ulang 110 route setiap kali.
- **File diubah:** `deploy.sh` — langkah 6/7 `optimize:clear`, langkah baru 7/7 `config:cache` + `route:cache`; penomoran langkah 1–5 diubah dari `/6` ke `/7`. Tidak ada kode aplikasi yang diubah.
- **Keputusan:** `optimize:clear` tetap dijalankan lebih dulu agar deploy selalu bersih, lalu cache dibangun ulang. Closure route (`track.lookup`, `cara-pesan`, `robots.txt`) **bukan blocker** — Laravel 12 men-serialisasi closure via `laravel/serializable-closure`; `route:list` tetap 110 route. Tidak perlu refactor ke controller.
- **Perintah + hasil aktual:**
  - `php artisan config:cache` → `Configuration cached successfully`; `php artisan route:cache` → `Routes cached successfully`.
  - `bash -n deploy.sh` → OK.
  - Simulasi urutan produksi `optimize:clear → config:cache → route:cache` → `php artisan about --only=cache`: Config **CACHED**, Routes **CACHED**; HTTP `GET /login` dengan cache aktif → **200**.
  - `php artisan test --compact` (setelah `optimize:clear`) → **65 passed (264 assertions)**, 11,03 s.
- **Catatan operasional:** `config:cache` mengunci nilai `.env`, jadi test lokal saat cache aktif memakai config `local` (bukan `testing`) dan POST berakhir 419 CSRF — jalankan `php artisan optimize:clear` sebelum test lokal. Saat investigasi, dev server `php artisan serve` sisa sesi sebelumnya menahan `bootstrap/cache/config.php` yang sudah dihapus (delete-pending), sehingga PHP tetap memuat config lama; menghentikan proses PHP itu menghilangkan gejala.
- **Dampak terukur:** TTFB lokal via built-in server tidak representatif (uncached ±48 ms vs cached ±45 ms, noise sampai 94 ms) karena overhead server/kompilasi CLI mendominasi. Penghematan hanya pada porsi bootstrap (parsing config + registrasi route); TTFB live 1,15 s juga dipengaruhi jaringan, PHP-FPM, DB, dan render. Ukur ulang live setelah push + cron deploy.
- **Unresolved:** push/deploy belum dilakukan (menunggu konfirmasi); Lighthouse live belum diukur ulang; fix A2 `initRevealEngine` masih pending; A4 unused JS pending.

---

## 2026-10-25 (lanjutan) — Audit A2: font, Snap, dan long task homepage

- **Fokus:** Audit read-only A2 pada HEAD `edeb2ff` + build `Home-CyEmfl40.js`; tidak ada kode aplikasi yang diubah.
- **Temuan font (resolved):** `app.blade.php:15-28` — preconnect `fonts.googleapis/gstatic`, CSS Google Fonts dimuat async (`media="print"` + `onload`), `display=swap`; Lighthouse: `render-blocking-resources` kosong, `font-display` kosong, CLS 0.001. Font yang benar-benar diunduh: Inter 48.983 B + JetBrains Mono 21.935 B (~72 KB), main-thread 6 ms. Tidak ada `@font-face` lokal. Sisa opsional: self-host WOFF2 yang dipakai + preload 1–2 weight; dampak ke TBT kecil.
- **Temuan Snap (resolved):** tidak ada `<script snap.js>` global di `app.blade.php`; `InvoiceShow.tsx:26-32` `loadSnap()` on-demand + dedupe/retry, dipanggil hanya saat invoice unpaid / klik bayar (`:88,113,131`); TrackOrder memakai vtweb redirect. Lighthouse homepage: 0 request Snap; third-party hanya Google Fonts.
- **Temuan long task (masih terbuka):**
  - Live Lighthouse 12.8.2 mobile `https://raycode.my.id/` (build lama `app-DMVKJhGZ.js`): skor 68; FCP 1,8 s; LCP 3,0 s (TTFB 1,15 s / 38%, render delay 1,87 s); TBT 1.040 ms; total 353 KiB.
  - Long task: `app-DMVKJhGZ.js` 956 ms; `vendor-DUmJHVK2.js` 260+223+170+52 = 705 ms; `Home-C-4kylzH.js` 153+81+61 = 295 ms.
  - CPU profile lokal (unthrottled, build HEAD `app-CORJ6UrU.js`): fungsi `l` = `inViewport()` (`app.tsx:52-55`) **843 ms self-time**; **1.194 panggilan `getBoundingClientRect`** dalam 9 s pertama untuk 43 node `[data-reveal]` (2.015 elemen DOM). Penyebab: `MutationObserver` memanggil `onViewportChange()` pada setiap batch mutasi saat React merender; `checkPending()` membaca rect dan menulis class bergantian → forced layout berulang. Ini mengonfirmasi catatan 2026-10-24 soal long task `initRevealEngine`.
  - H1 LCP sudah `priority` (`Home.tsx:322`, `Reveal.tsx:27-29`) — delay LCP bukan animasi reveal, melainkan CSR + TTFB.
- **Rekomendasi (belum diterapkan):** di `initRevealEngine`, (1) debounce fallback MutationObserver (mis. `setTimeout` ~120 ms + rAF) alih-alih `m()` langsung tiap batch; (2) `checkPending()` kumpulkan elemen yang in-viewport dulu, baru tambah class (hindari read-write interleaving); (3) `if (pending.size === 0) return`. Pertahankan fallback scroll/resize/load/watchdog agar hardening mobile tidak hilang. Perkiraan: menghapus mayoritas 1.194 rect reads dan long task 486 ms; perlu A/B Lighthouse + uji emulasi IO rusak.
- **Perintah + hasil aktual:** `lighthouse ... --only-categories=performance` lokal (build produksi; `public/hot` di-rename sementara) → skor 46, TBT 560 ms; live → skor 68, TBT 1.040 ms; CDP profiling + inject counter `getBoundingClientRect` → 1.194 calls; tidak ada perubahan kode.
- **Unresolved:** fix reveal belum diimplementasi; live masih build lama (HEAD + build baru belum deploy); TTFB live 1,15 s → pertimbangkan `config:cache`/`route:cache`/`view:cache` + OPcache di `deploy.sh`; A4 unused vendor 47 KB (57% live) masih pending; skor Lighthouse live bervariasi (68 vs 81) — ukur ulang setelah deploy.

---

## 2026-10-25 — PERF A1/A5/A7: verifikasi payload homepage + varian responsif `raycode-faq`

- **Fokus:** Menuntaskan A1 (payload gambar) + A7 (video 5,3 MB) tanpa redesign. Sebagian besar ternyata sudah ada di HEAD; sesi ini memisahkan mana yang benar-benar selesai vs catatan dokumen yang stale, lalu menutup sisa image delivery (A5).
- **Verifikasi aktual (bukan asumsi):**
  - `public/images` hanya berisi 5 WebP: `hero-800.webp` 49.004 B, `hero-woman.webp` 16.740 B, `pp-800.webp` 69.518 B, `pp.webp` 104.360 B, `raycode-faq.webp` 147.478 B. Tiga file besar yang dicatat audit 2026-10-11 (hero-woman.jpeg 2.060 kB, pp.png 1.305 kB, hero-woman.png 503 kB) **sudah tidak ada**.
  - Default hero `app/Http/Controllers/Admin/HomepageController.php:167` = `/images/pp-800.webp` (bukan `pp.png`).
  - `resources/js/Pages/Public/Home.tsx:1080` video Home sudah `preload="none"` + `poster` + play hanya saat hover; `preload="none"` sudah ada sejak commit `bc8fca2`.
  - `php artisan tinker` → 3 portfolio dengan video, **semua `thumbnail_url = NULL`** (Waroeng, Test Save, aa) → `poster` tidak pernah terpasang; placeholder gradient + badge "Preview" yang tampil.
- **Baseline Chrome headless (sebelum perubahan):** netlog `--headless=new`, 1440×900, halaman lokal: **0 request `portfolio_videos`/`.mp4`**; gambar yang dimuat hanya `pp-800.webp`, `raycode-faq.webp` (147.478 B), `ray-logo.png` — tidak ada `pp.webp`, `RAYCODE.png`, `ray.png`.
- **File diubah:**
  - `resources/js/Pages/Public/Home.tsx` — gambar FAQ: `srcSet="/images/raycode-faq-600.webp 600w, /images/raycode-faq.webp 900w"`, `sizes="(min-width: 1024px) 560px, 100vw"`, `width={900} height={600}` (sebelumnya 640, tidak sesuai rasio asli 900×600).
  - `public/images/raycode-faq-600.webp` — baru, 600×400, 69.654 B (sharp resize 600w, WebP quality 82, effort 6).
  - `public/build/**` — hasil `npm run build` (Home-CyEmfl40.js 82,21 kB, app-CORJ6UrU.js 26,51 kB).
  - `docs/PROJECT_STATUS.md`, `docs/WORKLOG.md`.
- **Keputusan:**
  - Pertahankan `raycode-faq.webp` 900w sebagai kandidat DPR2/layar besar; tambah 600w untuk kolom ~560 px dan mobile. Tidak menimpa aset lama.
  - Tidak membuat poster video generik/palsu: poster harus berasal dari thumbnail konten; gap data `thumbnail_url` didokumentasikan, bukan ditutup dengan gambar yang menyesatkan.
  - Tidak menambah defer `src` video: `preload="none"` sudah terbukti 0 request di Chrome (dev + build). Perubahan tambahan hanya menambah kompleksitas tanpa bukti manfaat.
- **Perintah test + hasil aktual:**
  ```text
  php artisan tinker ...        -> 3 video, semua thumb=NULL
  Chrome headless netlog (dev, 1440, sebelum perubahan)
                                -> mp4: NONE; images: pp-800, raycode-faq, ray-logo
  Chrome headless netlog (dev, 1440 & 390, setelah perubahan)
                                -> images: pp-800.webp, raycode-faq-600.webp
                                -> mp4: NONE
  Chrome headless netlog (build produksi, public/hot di-rename sementara lalu dikembalikan, 1440)
                                -> images: pp-800.webp, raycode-faq-600.webp; mp4: NONE
  npm run build                 -> sukses 17,69s; Home-CyEmfl40.js 82,21 kB
  php artisan test --compact    -> 65 passed (264 assertions), 11,25s
  ```
- **Unresolved:**
  - Poster video tidak ada karena `thumbnail_url` NULL di 3 portfolio; solusi berkelanjutan butuh upload thumbnail di admin atau generate poster saat upload (ffmpeg di shared hosting belum dipastikan) — di luar scope A1/A7.
  - Hover/play video tetap mengunduh file apa adanya (5,3 MB di dev); belum ada kompresi/transcoding video.
  - `public/build` dan docs berubah di working tree, belum di-commit/push; deploy produksi baru ikut setelah commit + cron `auto-deploy.sh`.
  - Lighthouse belum di-run ulang; jangan klaim skor naik sebelum diukur.
  - A2 (font/`snap.js`/long task) dan A4 (unused JS) masih pending.

---

## 2026-10-24 — Audit alur deploy logo (navbar production tanpa gambar) + perluas `deploy.sh` ke aset statis

- **Fokus:** Audit deployment `ray.png`/`ray-logo.png` dari lokal sampai production tanpa mengubah desain, database, auth, atau fitur. Awal sesi: re-run Lighthouse live = **skor 81** (build `fea4fb6` sudah ter-deploy, dikonfirmasi `curl` aset `app-DMVKJhGZ.js` → 200).
- **Akar masalah (dibuktikan, bukan asumsi):** document root domain **bukan** `~/ray-code/public`, melainkan `~/public_html` — dua salinan terpisah (`Panduan_Deploy_Raycode.md:12` menyatakan ini sendiri). `deploy.sh` lama hanya menyalin `public/build/assets` + `public/build/manifest.json`. File non-build di `public/` pernah muncul di domain hanya karena upload manual pada deploy 15–16 Okt.
  - Bukti penyimpangan dua lokasi: `favicon.png` live 1.672.209 B vs repo 1.064 B; `robots.txt` live 104 B vs repo 102 B.
  - Bukti spesifik: `ray.png` live 200 (311.855 B = identik repo) → yang "sempat berhasil"; `ray-logo.png` (18.676 B), `ray-watermark.webp` (46.222 B), `RAYCODE.png` (2.269.924 B) live **404** → `git log --diff-filter=A` menunjukkan ketiganya baru ditambahkan commit `fea4fb6` (23 Okt) dan tidak pernah tersalin.
  - Navbar tidak salah path: `PublicLayout.tsx:18` `src="/ray-logo.png?v=1"` dengan `alt="Raycode"` → saat 404 browser menampilkan teks alt, persis gejala "navbar hanya teks Raycode". Pemakai lain: `AdminLayout.tsx:169`, `Error.tsx:208`, `Home.tsx:1734/1790/1876`; watermark `PublicLayout.tsx:403`.
  - Bukan soal Git/ignore: `git ls-files` → ketiganya `tracked=yes`, `git check-ignore` → `ignored=no`. `.github/workflows` memang tidak ada (dihapus 16 Okt karena SSH hosting diblokir), tidak ada rsync lain.
- **File diubah:**
  - `deploy.sh` — langkah baru **3/6 "Sinkronkan aset statis"**: glob `*.png *.webp *.jpg *.jpeg *.gif *.svg *.ico robots.txt` di root `public/` + seluruh `public/images/`, memakai `cp -f` (nama tidak ber-hash → harus boleh ditimpa agar penggantian logo ter-deploy). `index.php`, `.htaccess`, `storage`, `build.zip|rar` sengaja tidak tersentuh. Backup `~/raycode-deploy-backup/<timestamp>/` dibuat **hanya** bila isi docroot berbeda dari repo (`cmp -s`). Nomor langkah 1/5→1/6.
  - `Panduan_Deploy_Raycode.md` — §5C baru (latar belakang + snippet manual setara + verifikasi `curl`/`cmp` 5C), checklist §8 +2 poin, catatan jangka panjang diperbarui dengan contoh deviasi `favicon.png`.
- **Keputusan:**
  - `deploy.sh` dipecah: build pakai `cp -an` (aman, ber-hash, jangan menimpa), aset statis pakai `cp -f` (nama tetap, wajib menimpa). Konsolidasi ke rsync dihindari — `rsync` tidak dijamin ada di shared hosting cPanel.
  - Backup selektif (`cmp -s`) supaya direktori backup tidak membesar di setiap deploy cron (cron jalan tiap 5 menit).
  - Aset statis ikut dari repo sebagai satu-satunya sumber kebenaran; upload manual di docroot dianggap penyimpangan.
  - `RAYCODE.png` 2,27 MB ikut tersinkron — **opsi 1(a) dipilih user**, untuk konsistensi proses deploy; tidak ada file baru/desain diubah.
- **Temuan teknis penting (dibuktikan dengan test `cp` nyata):** `cp -f public/images/. dest/` **GAGAL** `omitting directory` (exit 1) karena `cp` pada direktori butuh rekursif; `cp -an` pada `public/build/assets/.` selama ini lolos karena `-a` sudah menyiratkan `-r`. Loop statis memakai `if [ -f ]` (bukan `[ -f ] && cmd`) agar aman dengan `set -e` saat glob tidak match.
- **Perintah test + hasil aktual:**
  ```powershell
  bash -n deploy.sh                                 # OK
  bash -n auto-deploy.sh                            # OK
  # dry-run dengan PUBLIC_HTML_DIR sandbox + git/cp-build/artisan di-stub:
  #   21 file disalin (RAYCODE.png, apple-touch-icon.png/svg, favicon-16x16/32x32, favicon.ico,
  #   favicon.png, logo.svg, ray-logo.png, ray.png, ray-watermark.webp, robots.txt, images/* 5 file)
  #   2 backup: favicon.png + robots.txt (isi backup = versi lama docroot, diverifikasi cmp)
  #   EXIT=0; index.php & .htaccess tetap utuh; hot/storage/build.zip/build.rar TIDAK ikut
  #   deploy ke-2: 0 backup baru (idempoten, direktori backup tidak membesar)
  #   edge case: images/ tidak ada di docroot -> dibuat, exit 0; glob no-match -> exit 0
  # snippet manual 5C diverifikasi terpisah -> semua byte IDENTIK dengan repo
  php artisan test --compact                        # Tests: 1 skipped, 64 passed (251 assertions) Duration 80.70s
  ```
- **Deploy production: SUDAH JALAN OTOMATIS (VERIFIED 2026-10-24, tanpa Terminal cPanel).** Commit `edeb2ff` (`deploy.sh` + `Panduan_Deploy_Raycode.md`) ter-push, lalu cron `auto-deploy.sh` (5 menit) mendeteksi `HEAD != origin/main` dan menjalankan `deploy.sh` langkah 3/6. Verifikasi live dari lokal:
  ```text
  curl https://raycode.my.id/ray-logo.png        -> 200, 18.676 B, md5 dd857b4f... = md5 public/ray-logo.png (IDENTIK)
  curl https://raycode.my.id/ray.png             -> 200
  curl "https://raycode.my.id/favicon.png?cb=1"  -> 200, 1.064 B  (versi repo; tanpa cache-buster masih 1.672.209 B = cache ModPagespeed lama)
  curl https://raycode.my.id/robots.txt          -> 200, 102 B   (versi repo menggantikan 104 B docroot lama)
  favicon.ico / -32x32 / -16x16 / apple-touch-icon.png -> semuanya 200
  ```
  Navbar production kini menampilkan gambar logo (sumber kebenaran = repo, bukan upload manual lagi).
- **Unresolved:**
  - ~~Lingkungan lokal: `C:\xampp\php\php.ini` hilang~~ — **KOREKSI diagnoses di sesi yang sama (lihat entri berikutnya):** XAMPP memang sudah ditinggalkan user, akar masalahnya Laragon tidak terdaftar di PATH sementara PATH Machine masih menunjuk PHP XAMPP yang cacat.
  - ~~`favicon.png` docroot (1,67 MB) akan ditimpa versi repo (1 KB)~~ — **SUDAH TERJADI & AMAN:** grep `favicon` di `resources/`, `app/`, `routes/` hanya menemukan `/favicon.ico`, `/favicon-32x32.png`, `/favicon-16x16.png` (`app.blade.php:11-13`); `favicon.png` tidak dirujuk kode manapun, jadi penimpaannya tidak berdampak. Versi 1,67 MB masih bisa disajikan ModPagespeed dari cache lama sampai cache purge / TTL habis — hard refresh mengganti versi 1.064 B.
  - Backup selektif di server terbentuk untuk file yang dulu deviasi (`favicon.png`, `robots.txt`) di `~/raycode-deploy-backup/<timestamp>/`. Ukuran direktori ini belum dicek dari lokal (cron jalan tiap 5 menit; backup hanya dibuat saat `cmp -s` berbeda, jadi setelah deploy pertama seharusnya tidak bertambah).
  - `robots.txt` statis di docroot **masih menutupi** route Laravel `routes/web.php:54` — perubahan robots dari kode tidak pernah berlaku. Sekarang yang terserve versi repo (102 B) yang `Sitemap:` -nya menunjuk `https://raycode.dev/sitemap.xml`, bukan `raycode.my.id`. Di luar scope, belum diputuskan.
  - `public/hot` (21 B) masih ada di lokal — jangan sampai ikut ter-commit (sudah ter-gitignore).
  - Optimasi perf lanjutannya (font self-host, long task `initRevealEngine`, `config:cache` di deploy) belum dikerjakan; skor 81 belum diurut item mana yang tersisa.

---

## 2026-10-24 (lanjutan) — Perbaikan lingkungan dev: `extension=zip` + PATH Machine dibersihkan dari XAMPP

- **Fokus:** Menuntaskan blocker "test tidak bisa jalan" yang tadi dikira kerusakan XAMPP, lalu mengaktifkan ZIP agar test yang selama ini skip bisa dijalankan.
- **Diagnosis sebenarnya (dibuktikan, mengoreksi entri di atas):** user sudah pindah ke **Laragon**; MySQL yang melayani dev DB pun milik Laragon (`C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysqld.exe`, PID 7840, `php artisan migrate:status` normal). Masalahnya: **Laragon tidak ada di PATH sama sekali**, sedangkan PATH Machine masih memuat `C:\xampp` (#13), `C:\xampp\php` (#15), `D:\xampp\php` (#16) — dua di antaranya entri mati (`D:\xampp\php` dan `C:\Users\ASUS\Downloads\php-8.2.12` sudah tidak ada di disk). Terminal Laragon lancar karena Laragon menyuntik PATH sendiri di jendelanya; shell non-login (agent, cron, editor) jatuh ke `C:\xampp\php\php.exe` 8.2.12 yang `Loaded Configuration File => (none)`.
- **Fakta penting tentang urutan PATH:** nilai merged = **Machine dulu, baru User di-append** (dibuktikan: entri User pertama `.qoder\entry` muncul di posisi 43, `xampp` di 21-24). Artinya menambah Laragon ke User PATH tidak akan pernah mengalahkan `C:\xampp\php` — perubahan wajib di level Machine (perlu admin).
- **Perubahan 1 — `C:\Laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.ini`:** baris 832 `;extension=zip` → `extension=zip`. Backup `php.ini.bak-20261024` dibuat sebelum edit. Verifikasi: `php -m` memuat `zip`, `class_exists("ZipArchive")` = ADA.
- **Perubahan 2 — PATH Machine:** skrip `C:\Users\ASUS\path-fix-20261024\remove-xampp-from-machine-path.ps1` (+ wrapper `run-and-log.ps1`, `launch-elevated.ps1`, log `run.log`). Menghapus 3 entri XAMPP persis (bukan substring) dan mem-prepend `C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64` + `C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin` (versi dideteksi otomatis dari isi folder). Ditulis dengan `Set-ItemProperty -Type ExpandString` supaya tipe registry tidak berubah; **`setx` sengaja tidak dipakai** karena memotong nilai di 1024 karakter (Machine PATH 1128 karakter). Backup nilai mentah: `C:\Users\ASUS\path-backup-20261024-233255\MACHINE-PATH-RAW.txt`.
- **Keputusan:**
  - Preview dulu sebelum menulis (`-Preview` membuka registry read-only, tidak butuh admin) dan **diff** hasil vs nilai asli: perubahan persis `+2 Laragon, -3 XAMPP`, tidak ada entri lain yang tersentuh.
  - `-Unique` pada penggabungan list dibatalkan setelah preview menunjukkan ia diam-diam menghapus 2 entri duplikat `cursor` yang tidak diminta — sekarang hanya entri Laragon yang dicek eksistensi, sisanya dibiarkan apa adanya.
  - Eksekusi lewat `Start-Process -Verb RunAs` (dialog UAC ditekan user), bukan `reset`/hapus file. **Tidak ada satu file pun yang dihapus** — `C:\xampp\php` dan `C:\xampp` masih ada di disk, hanya keluar dari PATH.
  - Entri rusak lain sengaja tidak dibersihkan (di luar instruksi): `C:\Users\ASUS\Downloads\php-8.2.12` (entri mati, masih di Machine #26 dan User), `\Program Files\Git\cmd` (Machine #22, kehilangan drive letter), `C:\Users\User\AppData\Local\Pub\Cache\bin` (#20, profil user lain).
- **Perintah test + hasil aktual:**
  ```powershell
  # dengan PHP Laragon (sebelum zip aktif)
  php artisan test --compact        # 1 skipped, 64 passed (251 assertions) 24,59s
  # setelah extension=zip aktif
  php artisan test --compact        # Tests: 65 passed (264 assertions) — test ZIP TrackOrderTest tidak skip lagi
  php artisan test --compact        # via PATH baru, memanggil "php" polos: 65 passed (264 assertions) 36,21s
  vendor\bin\pint --test            # FAIL 123 files, 1 style issue — pre-existing (migrasi 2026_10_13_150740_*, commit bc8fca2, tidak disentuh)
  # verifikasi PATH dari proses baru (mensimulasi terminal baru)
  Machine entries 33 | sisa xampp 0 | tipe registry ExpandString
  php   -> C:\laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.exe  (PHP 8.3.28)
  mysql -> C:\laragon\bin\mysql\mysql-8.4.3-winx64\bin\mysql.exe
  ```
- **Catatan:** composer.json `require.php = ^8.2` → PHP 8.3.28 kompatibel. Shell sesi ini masih memakai PATH lama; terminal baru yang mendapat Laragon.
- **Unresolved:**
  - Perlu restart terminal/IDE agar PATH baru terpakai; `C:\xampp` tidak dihapus dari disk (tanya user dulu, dan `C:\xampp\mysql\data` sudah tidak ada jadi tidak ada DB lama yang perlu diselamatkan).
  - Entri PATH rusak lain (Downloads php, `\Program Files\Git\cmd`, `C:\Users\User\...`) belum dibersihkan.
  - ~~Perubahan `deploy.sh` + dokumen dari sesi audit logo masih belum di-commit~~ — **sudah commit `edeb2ff` dan push ke `origin/main`.**
  - ~~Produksi: `bash deploy.sh` di cPanel masih menunggu (logo `ray-logo.png` masih 404 live)~~ — **cron `auto-deploy.sh` sudah menjalankannya; `ray-logo.png` live 200 dan byte-identik dengan repo (lihat entri audit logo).**

---

## 2026-10-23 (lanjutan) — Implementasi optimasi performa homepage (tanpa redesign)

- **Fokus:** Menindaklanjuti audit performa: lazy-load Snap, lepas framer-motion dari homepage, optimasi logo/favicon/watermark, dan hilangkan delay LCP pada H1 hero. Tidak ada perubahan layout/visual.
- **File diubah:**
  - `resources/views/app.blade.php` — hapus `<script snap.js>` global; ganti dengan meta `midtrans-snap-url` + `midtrans-client-key`; favicon memakai `/favicon-32x32.png`, `/favicon-16x16.png`, `/apple-touch-icon.png`.
  - `resources/js/Pages/Client/InvoiceShow.tsx` — `loadSnap()` memuat Snap on-demand (dedupe, retry, `data-client-key`), preload hanya saat invoice `unpaid`; fallback gagal tidak lagi mengklaim pembayaran berhasil.
  - `resources/js/Components/useConfirm.tsx` — `ConfirmModal` di-`lazy()` + `Suspense`; `ui.tsx` menghapus re-export `ToastProvider`/`ConfirmModal`/`useConfirm`/`AdminBreadcrumb` yang membuat chunk `motion` ikut ke homepage.
  - `resources/js/Components/layout/PublicLayout.tsx` — logo memakai `ray-logo.png`; watermark memakai `ray-watermark.webp` + `loading="lazy"`.
  - `resources/js/Components/layout/AdminLayout.tsx`, `resources/js/Pages/Error.tsx`, `resources/js/Pages/Public/Home.tsx` — semua pemakaian logo kecil/avatar memakai `ray-logo.png`; `ray.png` hanya untuk OG/JSON-LD.
  - `resources/js/Components/Reveal.tsx` + `Home.tsx` — prop `priority`; wrapper H1 hero render `is-visible` sejak awal agar tidak menunggu IO/transition.
- **Aset baru:** `public/ray-logo.png` 360x120 / **18.2KB**; `public/ray-watermark.webp` 1600x535 / **45.1KB**. `public/ray.png` 304.5KB tetap untuk schema/OG, tidak lagi di-fetch halaman.
- **Keputusan:** Snap hanya dibutuhkan `InvoiceShow` (`window.snap.pay`); TrackOrder memakai vtweb redirect. Watermark dipisah agar tidak mengorbankan kualitas logo header. H1 priority mengorbankan fade-in H1 saja; elemen hero lain tetap beranimasi.
- **Test + hasil aktual:**
  ```text
  npm run build                  -> sukses 10.23s
                                  app-DMVKJhGZ.js 26.51KB, Home-C-4kylzH.js 82.09KB,
                                  ui-C5P-xQaN.js 12.43KB, ConfirmModal-BCv3uSgl.js 3.79KB,
                                  InvoiceShow-B4EHjHyV.js 7.91KB
  php artisan test --compact     -> 1 skipped, 64 passed (251 assertions)
  npx tsc --noEmit               -> hanya error pre-existing (AdminBreadcrumb, ConfirmModal, ToastProvider, ui, Admin/Orders); tidak ada error di file yang diubah
  cek HTML lokal                 -> tidak ada <script snap.js>; meta Snap ada; tidak ada ray.png
  Lighthouse lokal               -> request homepage tidak memuat snap/Midtrans, motion, atau ray.png; total awal 1,061 KiB
  CDP LCP probe lokal            -> no-preference 3.84s vs reduce 3.93s (delay reveal H1 hilang; TTFB lokal 2.3s)
  ```
- **Catatan:** Lighthouse lokal (`php artisan serve`) tidak representatif (single-thread, tanpa Brotli); skor lokal fluktuatif 31-50. Setelah deploy, ukur live dengan `lighthouse https://raycode.my.id/ --only-categories=performance`.
- **Unresolved:** Perubahan belum di-commit/push/deploy; live masih build lama. Layout font scaling 130%+ (header meluber) belum diubah karena menunggu screenshot/konfirmasi HP. Live Snap masih sandbox; cek `MIDTRANS_IS_PRODUCTION`.

---

## 2026-10-23 (lanjutan) — Audit animasi HP asli, layout font scaling, dan performa live

- **Fokus:** Menjelaskan animasi mati di HP asli, layout tidak rapi dibanding emulasi mobile, dan audit performa `https://raycode.my.id` tanpa mengubah desain. Verifikasi juga status live setelah commit `700b088`.
- **Deploy update:** `700b088` sudah commit/push (berisi sync `public_html` di `deploy.sh`). Live `app-CXzNRZyn.js`, `app-lVJzhAvQ.css`, `Home-Bp8Rt6Ll.js` sekarang **200**; Lighthouse live berhasil render (tidak ada 404 aset). Catatan “belum di-commit” di entri deploy lama sudah tidak berlaku.
- **Animasi — penyebab utama (verified):** saat `prefers-reduced-motion: reduce`, `initRevealEngine()` (`app.tsx:36`) return sebelum menambah `js-reveal`, dan CSS `app.css:199-222, 332, 493` mematikan reveal/transition/animation. Emulasi CDP reduce: `jsReveal=false`, `reveals=0/44`, marquee `none`, carousel tetap “Lihat layar 1”; no-preference: `jsReveal=true`, `reveals=36/44` setelah scroll, marquee jalan, carousel pindah “Lihat layar 2”. Cocok dengan gejala HP asli. Cek Android Settings > Accessibility > Remove animations / iOS Reduce Motion.
- **Layout — penyebab utama (verified):** emulasi DevTools memakai font default 16px. Audit 360px: 100%/115% tidak ada overflow dokumen; 130% (20.8px) grup tombol kanan header melewati viewport 16px; 150% (24px) melewati 74px dan card grid melewati 15px; 320px/125% melewati 42px. Ini pola “di extension rapi, di HP berantakan” jika font/display size HP diperbesar.
- **Performa live (Lighthouse 12.8.2 mobile):** score **35**; FCP 3.8s, LCP 9.5s (render delay 8,763ms / 93%, elemen H1 hero), TBT 2,100ms, CLS 0, SI 5.7s, TTI 9.5s; total 1,941 KiB / 40 request; TTFB 200ms; Brotli aktif, cache aset 30 hari.
- **Temuan performa:** Snap popup Midtrans 743.5KB + Alibaba/Aliyun 501.3KB + Google Fonts 74.2KB dimuat global dari `app.blade.php:69`; hanya `Client/InvoiceShow.tsx` yang memakai `window.snap.pay` (TrackOrder memakai vtweb URL). `motion-Dp7tbtYy.js` 42.5KB ikut di homepage karena `ConfirmProvider` meng-import `ConfirmModal`/framer-motion secara global; unused JS 93KB. `public/ray.png` 2170x725 / 304.8KB dipakai navbar (~143x48), watermark footer, favicon, dan apple-touch-icon; Lighthouse menaksir savings 231-305KB. Long task utama: app 2.0s, vendor 1.5s, Home 0.87s. LCP H1 ditunda reveal: 3.66s vs 1.98s saat reduce (unthrottled).
- **Catatan live:** Snap yang dimuat adalah **sandbox** (`snap-assets.sandbox.midtrans.com`), jadi `MIDTRANS_IS_PRODUCTION` di server perlu dikonfirmasi/diperbaiki jika live seharusnya produksi.
- **Perintah test:** `lighthouse https://raycode.my.id/ --only-categories=performance --disable-full-page-screenshot`; CDP LCP probe + `mobile-audit.mjs` (412/360/320, font 18.4/20.8/24, reduce motion). Tidak ada perubahan kode aplikasi pada sesi audit ini.
- **Tindak lanjut:** Optimasi (lazy Snap, lazy ConfirmModal, `ray.png`/favicon, reveal above-fold) sudah diterapkan pada entri di atas. **Unresolved:** butuh model/browser HP, screenshot area yang tidak rapi, serta status Reduce Motion dan font/display size untuk konfirmasi.

---

## 2026-10-23 (lanjutan) — Fix deploy putih kosong: aset build tidak tersinkron ke `public_html`

- **Gejala:** Setelah commit `ca2af7a` di-push dan deploy, `https://raycode.my.id` putih kosong. Console Firefox menampilkan error CSS (`Selector expected`, `Ruleset ignored due to bad selector`) plus noise WebGL/`feilin056...`/`main.popup.sandbox`/`file:///`.
- **Diagnosis (verified via HTTP):** HTML live meminta aset build baru `app-CXzNRZyn.js`, `app-lVJzhAvQ.css`, `Home-Bp8Rt6Ll.js`, `icons-K9WDykFC.js` — semuanya **404** (body HTML 404, bukan JS/CSS). `public_html/build` di hosting masih build 16 Oktober: `/build/manifest.json` `Last-Modified: Fri, 16 Oct 2026`, berisi `app-CIaU6Al-.js` + `Home-DR9_bfoG.js` (200). Artinya `~/ray-code` sudah ter-update, tetapi aset tidak tersalin ke folder yang dilayani domain. app JS 404 → React tidak mount → halaman putih; CSS 404 diparse Firefox sebagai CSS → error selector. Error WebGL/`feilin056...`/`file:///` berasal dari ekstensi browser, bukan aplikasi.
- **Akar masalah:** `deploy.sh` (dipakai `auto-deploy.sh` cron) hanya `git pull` + migrate + `optimize:clear`; langkah sinkronisasi aset di `Panduan_Deploy_Raycode.md` bagian 5 masih manual dan terlewat.
- **File diubah:**
  - `deploy.sh` — langkah baru `2/5`: `PUBLIC_HTML_DIR="${PUBLIC_HTML_DIR:-$HOME/public_html}"`, validasi `public/build/manifest.json`, `cp -an public/build/assets/. "$PUBLIC_HTML_DIR/build/assets/"`, lalu `cp -f public/build/manifest.json "$PUBLIC_HTML_DIR/build/manifest.json"`. Nomor langkah lain disesuaikan; aset lama tidak dihapus.
  - `Panduan_Deploy_Raycode.md` — catatan bahwa `deploy.sh` otomatis sync, contoh nama aset build 23 Oktober, checklist deploy, dan catatan jangka panjang diperbarui.
- **Test + hasil aktual:**
  ```text
  bash -n deploy.sh          -> syntax OK
  bash -n auto-deploy.sh     -> syntax OK
  simulasi copy ke temp      -> copiedAssets=59, manifestBytes=26591, manifestMatchesHEAD=yes
  php artisan test --compact -> 1 skipped, 64 passed (251 assertions)
  git diff --check           -> bersih
  ```
- **Unresolved / tindakan di hosting (belum dijalankan dari lokal, butuh akses SSH/cPanel Terminal):**
  ```bash
  cd ~/ray-code
  git pull --ff-only
  bash deploy.sh        # atau: salin manual assets + manifest ke ~/public_html/build
  ```
  Lalu purge cache PageSpeed DomaiNesia bila `/build/manifest.json` masih `STALE`, hard refresh/incognito, dan cek aset baru harus `200`. Perubahan `deploy.sh` + panduan ini belum di-commit/push.

---

## 2026-10-23 — Fix homepage putih (komponen `IgPhoneMockup` hilang) + komposisi carousel 3 smartphone

- **Fokus:** Menyelesaikan pekerjaan carousel CTA yang belum selesai (2026-10-22) dan memperbaiki laporan user "hasil web masih putih kosong".
- **Akar masalah halaman putih (verified):** `Home.tsx` memakai `<IgPhoneMockup variant={...} />` tetapi komponennya **tidak pernah didefinisikan** (sisa refactor carousel setengah jadi) → `ReferenceError` saat render Home → React unmount → halaman putih. `npm run build` tidak menangkapnya karena esbuild tidak type-check; dev server crash saat runtime.
- **File diubah:**
  - `resources/js/Pages/Public/Home.tsx` — menambahkan komponen `IgPhoneMockup` (frame HP existing + 3 layar: profil, post studi kasus, insights) tanpa aset baru; komposisi carousel dirapikan: `ResizeObserver` mengukur lebar stage, HP tengah `scale 1` (300px), HP samping `scale 0.64` + rotasi ±5°, spread dinamis (maks 220px) sehingga ketiganya tersebar dan tidak menumpuk; transisi transform/opacity 550ms; panah di tepi stage (di luar grup), dots + tombol pause di bawah; autoplay/hover-pause/keyboard/swipe tetap. Grid CTA kiri diperlebar (`lg` 460px, `xl` 700px) agar 3 perangkat muat.
  - `public/build/*` — rebuild (build di-track git). Manifest Home → `assets/Home-Bp8Rt6Ll.js` 82.06 kB.
- **Responsif (verified headless):** desktop (stage ≥660px, mis. 1440/1280) = 3 perangkat terlihat saat diam; tablet 768 & landscape 1024 & mobile 390 = 1 perangkat (sisi disembunyikan, panah tetap di luar grup). Tidak ada overflow horizontal di 390.
- **Perintah test + hasil aktual:**
  ```powershell
  npx tsc --noEmit                  # 0 error di Home.tsx (error lain pre-existing: AdminBreadcrumb, ConfirmModal, ToastProvider, ui, Admin/Orders)
  npm run build                     # ✓ 13.05s, Home-Bp8Rt6Ll.js 82.06 kB
  php artisan test --compact        # Tests: 1 skipped, 64 passed (251 assertions)
  node measure-carousel2.mjs        # headless Chrome via php artisan serve :8000 + Vite dev
  # 1440 idle (reduced-motion): 3 VIS (center 300x600, sides 225x399), group 186..809 di stage 148..848, arrowsOutside=true
  # 1440 after next: tetap 3 VIS, posisi bergeser mulus | autoplay 5.2s: layar 3 → 1
  # 768 / 1024 / 390: 1 VIS, arrowsOutside=true | 390 swipe: layar 1 → 2 | pageerrors: none
  ```
- **Keputusan:** mempertahankan aset/HP mockup existing dan hanya memakai `transform` (scale/rotate/translate) agar rasio tidak gepeng; HP samping tetap di belakang HP tengah dengan overlap kecil (±27px dari 192px) supaya layar terbaca; mobile/tablet menyembunyikan HP samping alih-alih mengecilkan semuanya (instruksi penyesuaian jumlah perangkat).
- **Unresolved:**
  - Belum diverifikasi di browser headed (mouse drag/arrow nyata) — headless sudah (posisi, next, autoplay, swipe).
  - **Belum di-commit** — `Home.tsx` + `public/build` (build tracked) harus di-commit bersamaan sebelum push/deploy.
  - Tidak ada perubahan backend/route/database.

---

## 2026-10-17 — PERF A3: baca rect di dalam rAF (hapus forced reflow mousemove) + fix drag mouse Before/After + koreksi catatan docs

- **Fokus:** Menyelesaikan sisa PERF A3 (forced reflow `getBoundingClientRect` di handler `mousemove`, `Home.tsx:186,249,263,517,904,1042,1153`) + koreksi temuan usang di docs.
- **Koreksi temuan usang (dibuktikan):** `git log -S "prefers-reduced-motion" -- resources/js/Pages/Public/Home.tsx` → **guard reduce-motion sudah ada sejak initial commit `6d5b1e7`** di 5 handler (Home/global spotlight, Hero spotlight, magnetic CTA, StudioShowcase, ServiceCard, WorkCard). Catatan "guard reduce-motion mousemove/magnetic masih pending" di WORKLOG 2026-10-16 (dan audit §10 "hanya spotlight ada guard") **tidak akurat** — sisa A3 yang nyata = `getBoundingClientRect()` dibaca **sinkron di setiap event mousemove** (di luar rAF), bukan guard-nya.
- **File diubah (1 file sumber + build):**
  - `resources/js/Pages/Public/Home.tsx`:
    - Global spotlight (`Home`), hero spotlight + magnetic CTA (`Hero`), tilt `StudioShowcase`: `getBoundingClientRect()` dipindah **ke dalam callback rAF** (clientX/clientY di-capture saat event) → maksimum 1 read/frame, bukan per-event.
    - `ServiceCard` & `WorkCard`: **hapus handler mousemove per-card + `ref`** — identik & duplikat dengan handler global `document` `.spotlight-card` (kedua kartu punya class `spotlight-card`) → -2 listener/kartu, -2 read duplikat/frame.
    - `BeforeAfterSlider`: **cache rect saat drag start** (`rectRef` di `onDown`, dibersihkan di `onUp`) → 1 read per gestur, bukan per event drag.
    - `WorkCard` `<a>`: tambah `onDragStart={(e) => e.preventDefault()}` — **fix drag mouse Before/After** (lihat temuan di bawah).
  - `public/build/*` — rebuild (strategi repo: build di-track git). Home chunk final `Home-CYFWNef4.js 72.56 kB`.
- **Temuan + fix bug (dibuktikan headless):** drag **mouse** pada Before/After slider sebelumnya memulai **native link drag** karena sumber drag = `<a>` card (bukan container slider). Bukti: `dragstart` target = `A.spotlight-card...`; tanpa pencegahan, event `mousemove` berhenti terkirim setelah 1 langkah (counter 2/21) dan posisi slider stuck. Guard `onDragStart` di container slider **tidak menangkap** (event target = ancestor `<a>`, bubble hanya ke atas) — guard harus di anchor. Setelah fix: semua `mousemove` mengalir (21/21), posisi `52% → 79.87%` (tepat `50% + 30%` dari rect cache), `path=/` (click-guard `onClickCapture` tetap bekerja).
- **Keputusan:**
  - Read di dalam rAF (bukan cache+invalidate scroll/resize) — pola standar, tidak ada risiko rect basi, tetap maks 1 forced layout/frame saat hover.
  - Hapus handler per-card alih-alih men-throttle-nya — output identik (class + rumus sama), kerja lebih sedikit.
  - `useCountUp.ts` dicek: read rect sudah di dalam rAF via `ticking` guard — **tidak diubah**.
- **Perintah test + hasil aktual:**
  ```powershell
  npx tsc --noEmit                  # 0 error di Home.tsx (error lain pre-existing)
  npm run build                     # ✓ 2889 modules, Home-CYFWNef4.js 72.56 kB (grep: onDragStart=1, touch-pan-y=1)
  php artisan test --compact        # Tests: 1 skipped, 64 passed (251 assertions)
  .\vendor\bin\pint --test          # fail HANYA database/migrations/2026_10_13_150740_... (pre-existing; commit bc8fca2; tidak disentuh sesi ini)
  node verify-a3.js                 # puppeteer-core (temp di luar repo) via php artisan serve :8010 + Vite dev (public/hot aktif → menguji source):
  #   PASS 4 drag mouse: 52% -> 79.8658% (path=/, dragSrc=A.spotlight-card...)
  #   PASS 1 spotlight-card 29.8%/43.0%  | PASS 2 hero 60%/34.9% | PASS 3 magnetic translate3d(3.4px,2.7px,0px)
  #   PASS 5 reduce-motion: 44 reveal, 0 hidden (js-reveal=false) | PASS 6 reduce spotlight skipped
  #   Summary 6/6; JS errors 5 = pre-existing (duplicate key FAQ, ERR_NAME_NOT_RESOLVED, 403 resource eksternal/seed)
  ```
  Catatan lingkungan: build pertama OOM (`Fatal process out of memory`) saat Vite dev server user berjalan — retry dengan `$env:NODE_OPTIONS='--max-old-space-size=4096'` berhasil. Chrome headless butuh jeda antar aksi mouse (input batching) agar drag deterministik.
- **Unresolved:**
  - **Belum di-commit** — `Home.tsx` + `public/build` (build di-track git) siap commit; jangan lupa commit keduanya bersamaan sebelum push/deploy.
  - Verifikasi headed-browser (mouse drag nyata) belum — headless sudah; touch drag sudah diverifikasi sesi sebelumnya.
  - Console errors pre-existing saat load Home: duplicate key FAQ (kemungkinan data FAQ duplikat di DB dev), `ERR_NAME_NOT_RESOLVED`, satu resource 403 — kandidat sesi terpisah (bukan dari perubahan ini).
  - A1/A2/A4/A5/A7 & pengukuran ulang Lighthouse tetap pending (jangan klaim kenaikan sebelum ukur).

---

## 2026-10-16 — Fix animasi hilang di Chrome Android (fail-safe reveal engine + tap feedback + reduce-motion)

- **Laporan user:** di HP Android (Chrome) hampir semua animasi/efek visual tidak muncul, padahal di desktop tampil; website live `https://raycode.my.id`.
- **Verifikasi awal (bash):** build live == build lokal saat itu (`app-kBe1XNWd.css` 188.222 B, `app-CIaU6Al-.js` 29.572 B, hash cocok dengan `public/build`) → bug ada di kode saat ini, bukan build lama.
- **Akar masalah (analisis kode + uji empiris puppeteer-core, emulasi Pixel 5 393x851 touch dpr 2.75):**
  1. `initRevealEngine` lama (`resources/js/app.tsx`) menambah `html.js-reveal` yang menyembunyikan semua `[data-reveal]` (`opacity: 0`, `app.css:199`) **tanpa fail-safe apa pun**. Jika callback IntersectionObserver tidak pernah dipanggil (throttling compositor Chrome Android, elemen di dalam `content-visibility: auto` `.cv-auto`, main-thread berat), semua konten reveal stuck `opacity: 0` selamanya. **Bukti A/B:** emulasi IO rusak di build lama (live) → **42/42 elemen tetap `opacity: 0` bahkan setelah scroll penuh**; di build baru → **44/44 reveal**.
  2. Blok reduce-motion lama memakai selector global `*, *::before, *::after { animation-duration: .01ms !important }` → semua animasi dekoratif (marquee, float, pulse, ping) mati total di device dengan "Remove animations" aktif (umum di Android).
  3. Efek yang hanya-hover (fill service card `:hover`, spotlight `mousemove`, magnetic, hover-lift) mustahil muncul di `hover: none` (layar sentuh).
  4. `will-change: opacity, transform` di semua node `.reveal` (puluhan layer GPU) + `transform` permanen di `.is-visible`.
- **File diubah:**
  - `resources/js/app.tsx` — engine diperkuat: skip saat reduce-motion (konten langsung terlihat tanpa `js-reveal`), try/catch IO + `typeof` check, fallback `scroll`/`resize`/`load`/`pageshow` (rAF throttle) yang me-reveal elemen saat masuk viewport tanpa bergantung IO, watchdog 2,5 s (reveal yang sudah di viewport) + 6 s (reveal semua bila engine 0 hasil), MutationObserver & `inertia:navigate` dipertahankan. Tambah `initTouchFeedback()`: pada `pointerdown` touch → kelas `.is-touch` (900 ms) untuk service card + set `--mx/--my` + `.is-lit` untuk `.spotlight-card`.
  - `resources/css/app.css` — hapus `will-change` dari `.reveal`; `.reveal.is-visible` → `transform: none`; blok reduce di-scope ke `[class*='animate-']` (bukan `*`) + `.reveal`/`.block-reveal-text` selalu `opacity: 1 !important`, `process-line` statis `scaleX(1)`, `scroll-behavior: auto`; service card state jadi `:is(:hover, :focus-visible, :focus-within, :active, .is-touch)` (+ `touch-action: manipulation`; `:has(:focus-visible)` diganti `:focus-within` agar lebih kompatibel); `.spotlight-card.is-lit::before { opacity: 1 }`; `.hover-lift:active`.
  - `resources/js/hooks/useCountUp.ts` — fallback scroll/resize (rAF) + watchdog 2,6 s agar angka statistik hero tidak stuck "0" bila IO tidak pernah fire.
  - `resources/js/Pages/Public/Home.tsx` — Before/After slider: `touch-pan-y`, guard `touches[0]?.clientX`, deteksi drag >6px + `onClickCapture` preventDefault/stopPropagation → drag horizontal tidak lagi memicu navigasi kartu (bug yang sama juga terjadi saat drag-then-release di desktop).
- **Keputusan:** observer dianggap enhancement, bukan satu-satunya jalur konten tampil (progressive enhancement, SSR tetap terlihat); reduce-motion = kurangi gerak dekoratif, BUKAN sembunyikan konten; hover-only → tap feedback via kelas sekali-pakai tanpa hijack navigasi; tidak menambah dependency; animasi premium desktop tidak dihapus.
- **Perintah test + hasil aktual:**
  ```powershell
  npm run build      # ✓ 2889 modules — app-MDCyzl_k.css 188.81 kB, app-CSc8ShV5.js 30.97 kB (pengganti app-kBe1XNWd.css/app-CIaU6Al-.js)
  npx tsc --noEmit   # hanya error pre-existing di file yang TIDAK disentuh (AdminBreadcrumb, ConfirmModal, ToastProvider, ui.tsx, Admin/Orders) — 0 error baru
  php artisan test --compact   # Tests: 1 skipped, 64 passed (251 assertions) Duration: 39.16s
  node test-fixes.js (puppeteer, php artisan serve :8000, emulasi mobile)
    # A  local + IO dibroken  → early 6/44 visible → setelah scroll 44/44, opacityZero 0 (fail-safe bekerja)
    # A2 live + IO dibroken   → 42/42 tetap opacity 0 setelah scroll (BUKTI bug build lama)
    # B  local /services      → 60/60 reveal visible; tap service card: is-touch ✓, ::before matrix(1,0,0,1,0,0) (fill scaleY(1) aktif); tap spotlight (Home): is-lit ✓, --mx ter-set, ::before opacity transisi 0.38→1
    # C  local reduce-motion  → tanpa js-reveal, opacityZero 0, animate-* animationName none (konten tetap tampil)
    # D  drag Before/After (touch) → divider 52% → 81.7%, path tetap "/" (tidak ternavigasi)
  node test-desktop.js # desktop 1440x900: 44/44 visible, opacityZero 0, stats count-up "10+ / 5+ / 100%", 0 pageerror
  ```
- **Catatan uji:** cookie banner (`CookieConsent`, muncul setelah 1,2 s di profil fresh) sempat menutupi titik hit-test di emulasi → di-dismiss dulu di skrip test (perilaku aplikasi normal, bukan bug).
- **Unresolved:**
  - **Belum diuji di HP Android fisik** — semua bukti dari emulasi headless; minta konfirmasi user setelah deploy.
  - **Belum di-deploy** — `public/build` berubah dan di-track git; live masih build lama sampai commit+push dan cron auto-deploy / `git pull` manual di hosting.
  - Guard `prefers-reduced-motion` untuk `mousemove` spotlight/magnetic di `Home.tsx:179±` (PERF A3) masih pending — scope sesi terpisah. **(KOREKSI 2026-10-17: guard ternyata SUDAH ADA sejak initial commit `6d5b1e7` — diverifikasi `git log -S`; sisa A3 yang nyata = forced reflow read rect, diselesaikan 2026-10-17. Lihat entri teratas.)**
  - Breakpoint `xs:` di `Home.tsx` (`hidden xs:inline`) tidak ada di Tailwind default — label tab besar kemungkinan selalu tersembunyi; temuan terpisah, belum diubah.

---

## 2026-10-16 — Blog Cover Upload (validasi ketat + auto-compress) & Fix "category required" saat Edit dengan File

- **Fokus:** (1) `Admin/Blog.tsx` field "URL Cover (opsional)" ditambah upload file langsung — terima semua jenis foto, tolak file non-gambar/script, auto-resize + kompres. (2) Fix bug user: saat edit artikel dan memasukkan gambar, muncul "The category field is required".
- **Root cause bug "category required" (dibuktikan empiris):** Inertia 3.7 mengirim `PUT` asli + FormData saat ada file (grep `_method` di `@inertiajs/core` + `@inertiajs/react` = 0 spoof). PHP **tidak** mem-parsing body multipart untuk method PUT — test `php -S` + curl: `PUT -F` → `$_POST=[]`, `$_FILES=[]`, raw body 352 byte terbuang; `POST -F "_method=PUT"` → `$_POST` + `$_FILES` utuh. Jadi semua field teks hilang di validasi (title/excerpt/content/category), hanya terjadi di edit+file (create POST aman). PHPUnit tidak menangkap ini karena test client melewati PHP globals.
- **File dibuat / diubah:**
  - `app/Services/ImageOptimizer.php` — **BARU**: validasi ulang via `getimagesize` (whitelist IMAGETYPE jpeg/png/webp/gif/bmp/avif), guard 24MP, resize sisi terpanjang max 1600, simpan WebP q75 (fallback JPEG); **tidak pernah** fallback menyimpan file mentah — non-gambar/korup/format tak didukung → `ValidationException`.
  - `app/Http/Controllers/Admin/BlogController.php` — `cover_url` rule jadi `nullable|string|max:2048` (support path `/storage/...`), tambah `cover_file` (`file|mimes:jpeg,jpg,png,webp,gif,bmp,avif|max:10240`) + `remove_cover`; upload prioritas > URL; hapus file lama saat ganti/hapus/destroy (`deleteLocalCover`).
  - `resources/js/Pages/Admin/Blog.tsx` — file picker (JPG/PNG/WebP/GIF/BMP/AVIF, maks 10 MB), preview via `URL.createObjectURL`, checkbox "Hapus cover saat ini", label URL jadi "URL Cover eksternal (opsional)". **Fix PUT multipart:** saat edit + ada file → `post(updateUrl)` + `_method: 'put'` di transform; tanpa file tetap `put()`.
  - `resources/js/Pages/Admin/Portfolios.tsx` — fix bug PUT multipart yang sama (follow-up atas permintaan user): saat edit + ada file (`thumbnail_file`/`video_file`/`gallery_files`) → `post(updateUrl)` + `_method: 'put'`; tanpa file tetap `put()`. Cek halaman admin lain: `Projects.tsx` upload via POST sudah aman, `JokiServices.tsx` header PUT tanpa file aman.
  - `tests/Feature/BlogCoverUploadTest.php` — **BARU** 9 tests (guest 302, client 403, upload jpg 2400x1600 → webp di `/storage/blog_covers/`, teks menyamar .jpg ditolak, PNG korup ditolak, SVG ditolak, URL eksternal tetap diterima, update ganti+hapus file lama, remove_cover hapus file).
- **Keputusan:**
  - Hybrid (file + URL): post lama dengan URL eksternal tetap valid, tidak perlu migrasi (`cover_url` string tetap).
  - Validasi ganda: `mimes` (content-based di production) + `getimagesize` di service — layer kedua menangkap file yang mimes-nya lolos. SVG sengaja TIDAK diterima (bisa berisi script). HEIC belum didukung GD → error jelas "harus berupa gambar".
  - `ImageOptimizer` service terpisah (bukan ubah `PortfolioController` yang punya `storeOptimizedImage` dengan fallback simpan mentah) — sesuai aturan scope satu concern per perubahan.
- **Perintah test yang dijalankan:**
  ```powershell
  composer install   # dev deps (phpunit/pint/collision/faker) hilang dari vendor — pulih dari composer.lock
  php artisan test --filter BlogCoverUploadTest --compact   # 9 passed (25 assertions)
  php artisan test --compact                                # 44 passed (103 assertions)
  npm run build                                             # ✓ 2889 modules, Blog-qoOPny32.js 8.57k, no TS error
  # setelah follow-up fix Portfolios.tsx:
  npm run build                                             # exit 0, Portfolios-x6IJkfLB.js 20.69k
  php artisan test --compact                                # 44 passed (103 assertions) — tetap
  .\vendor\bin\pint --test app\Services\ImageOptimizer.php app\Http\Controllers\Admin\BlogController.php tests\Feature\BlogCoverUploadTest.php  # passed
  ```
- **Catatan:** Antivirus (Defender) sempat mem-quarantine file test karena isi literal payload; test diganti teks netral. Jangan tulis string payload eksekusi literal di source.
- **Unresolved:**
  - Verifikasi browser end-to-end (klik upload di edit modal blog + portfolio) belum dijalankan via otomasi — menunggu konfirmasi user.
  - `vendor/` sebelumnya tanpa dev deps — dicatat agar sesi berikutnya tahu `composer install` mungkin perlu diulang.
  - `PortfolioController@storeOptimizedImage` masih punya fallback `$file->store()` mentah (tidak strict seperti `ImageOptimizer`) — kandidat refactor ke service yang sama di sesi terpisah.

### Follow-up (sesi yang sama) — Fix `/admin/portfolios` putih kosong

- **Laporan user:** halaman `http://127.0.0.1:8000/admin/portfolios` blank putih di dev lokal.
- **Investigasi (semua dibuktikan):** tidak ada error server (`storage/logs/laravel.log` tanpa `local.ERROR` terkini); Vite dev server aktif (`public/hot` ada) dan mentransform semua modul OK; `git diff` `Portfolios.tsx` hanya di submit handler (mustahil crash render). Akar masalah: **mismatch kontrak props yang pre-existing sejak commit awal** — `PortfolioController@index` mengirim `paginate(20)`, Inertia menserialisasi paginator (Arrayable → `toArray()`) sebagai object `{data, current_page, last_page, total, ...}`, tapi `Portfolios.tsx` memperlakukannya sebagai array (`portfolios.length`, `portfolios.map`) → runtime `portfolios.map is not a function` → React unmount → blank putih. PHPUnit/build tidak menangkap ini karena interface TS salah mendeklarasikan tipe.
- **Bukti empiris:** `tests/Feature/AdminPortfoliosPageTest.php` (BARU, 3 tests) — `assertInertia(... ->has('portfolios.data', 1)->where('portfolios.data.0.title', 'Studi Uji'))` **lulus saat dijalankan sebelum fix FE** → membuktikan props berbentuk paginator object. Bandingkan 5 halaman admin lain (`Users/Orders/Projects/Services/EstimatorLeads`) yang sudah benar memakai `.data.map`.
- **File diubah:** `resources/js/Pages/Admin/Portfolios.tsx` — interface `portfolios` jadi `{ data: PortfolioRow[]; current_page; last_page; total }`; render pakai `portfolios.data.map`, header pakai `portfolios.total`, empty-state pakai `portfolios.data.length === 0`.
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --filter=AdminPortfoliosPageTest --compact   # 3 passed (15 assertions) — dijalankan sebelum fix FE sebagai bukti
  npm run build                                                  # exit 0, Portfolios-CHsQTTdO.js 20.70 kB
  php artisan test --compact                                     # 47 passed (118 assertions)
  .\vendor\bin\pint --test tests\Feature\AdminPortfoliosPageTest.php  # passed
  ```
- **Unresolved:** verifikasi visual browser (halaman render dengan 9 portfolio lokal) — user diminta hard-refresh; jika masih blank, cek console browser.

### Follow-up 2 (sesi yang sama) — Login khusus admin + tombol login disembunyikan (keputusan user via pertanyaan klarifikasi)

- **Permintaan user:** hanya admin yang bisa login; tombol login disembunyikan. **Keputusan user:** (1) blokir total akun client + matikan register; (2) CTA pemesanan di halaman publik (Estimator) diarahkan ke `/cara-pesan`.
- **File diubah:**
  - `app/Http/Controllers/Auth/AuthController.php` — `login()`: `Auth::validate($credentials)` (verifikasi kredensial tanpa login) → ambil `Auth::getLastAttempted()` → jika bukan admin (`isAdmin()`), tolak dengan error `email` tanpa pernah login; admin → `Auth::login($user, remember)` + `session()->regenerate()` + redirect intended `/admin`. **Register dinonaktifkan:** `showRegister()` & `register()` redirect ke `/login` (tidak ada user dibuat). Pendekatan validate-then-login dipilih agar user client tidak pernah ter-autentikasi (menghindari side effect cookie remember/session).
  - `resources/js/Components/layout/PublicLayout.tsx` — tombol "Masuk" dihapus dari header desktop & menu mobile (guest hanya melihat tombol Kontak di menu mobile).
  - `resources/js/Pages/Auth/Login.tsx` — link "Buat akun gratis" dihapus. `ForgotPassword.tsx` — link "Belum punya akun? Daftar" dihapus.
  - `resources/js/Pages/Public/Estimator.tsx` — `orderHref`: pengunjung belum login diarahkan ke `R.caraPesan` (sebelumnya `R.login`).
  - `tests/Feature/AuthTest.php` — `test_user_can_login_with_valid_credentials` (client) diganti `test_client_cannot_login` (assertGuest + error email); `test_new_user_can_register` diganti `test_register_is_disabled_and_creates_no_user` (redirect + tidak ada user baru); ditambah `test_register_page_redirects_to_login`.
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact                                            # 48 passed (118 assertions)
  npm run build                                                         # exit 0
  .\vendor\bin\pint --test app\Http\Controllers\Auth\AuthController.php tests\Feature\AuthTest.php  # passed
  ```
- **Catatan / unresolved:**
  - Client yang **sudah login** (sesi aktif) masih bisa memakai `/dashboard` sampai logout/expire — belum ada pemaksaan invalidasi sesi; perlu keputusan lanjutan jika harus langsung dikick.
  - File `resources/js/Pages/Auth/Register.tsx` masih ada (tidak dihapus) tapi tidak reachable karena route redirect — sengaja dibiarkan agar mudah diaktifkan kembali.
  - `/forgot-password` masih berfungsi untuk semua email (client bisa reset password tapi tetap tidak bisa login) — belum ada pembatasan; dampak rendah.
  - Verifikasi manual browser (login admin sukses, login client ditolak, tombol hilang) belum dijalankan.

### Follow-up 3 (sesi yang sama) — Fix hover fill card layanan `/services` (light + dark)

- **Fokus:** Efek fill biru dari bawah ke atas pada card layanan (`Pages/Public/Services/Index.tsx` — tab Paket & Joki; class `.service-card-hover` / `.service-card-hover-light`; juga dipakai `Services/Reguler.tsx`): teknik optimal, konsisten light & dark, focus keyboard, reduced-motion, tanpa redesign.
- **Akar masalah (dibaca dari kode aktual):** (1) fill pakai `clip-path` — bukan compositor-friendly (repaint tiap frame); (2) `.service-card-hover-light` memakai fill `brand-300` (biru muda) + teks `var(--color-ink)` → di dark mode `--color-ink` hampir putih → kontras rusak (teks putih di atas biru muda); (3) card Paket hardcode `bg-white`/`text-slate-900` → di dark mode tetap putih, bukan base gelap.
- **File diubah:**
  - `resources/css/app.css` — blok hover kedua class ditulis ulang: fill `::before` `transform: scaleY(0)` → `scaleY(1)` + `transform-origin: bottom` + `transition: transform 500ms cubic-bezier(0.22,1,0.36,1)` (naik & turun mulus, compositor-friendly); fill `var(--color-brand-600)` sama di kedua mode; teks/ikon putih saat fill aktif (sekunder `rgba(255,255,255,.85)`, emerald `#6ee7b7`); chip ikon/tombol jadi kaca `rgba(255,255,255,.14)` + ring dinonaktifkan; transisi warna descendant 450ms mengikuti naiknya fill (elemen dengan utility `transition-*` sendiri tidak diutak-atik); state mencakup `:hover`, `:focus-visible`, dan `:has(:focus-visible)` (card Paket CTA-nya di elemen dalam) + outline focus putih saat fill aktif; `prefers-reduced-motion` mematikan semua transisi card.
  - `resources/js/Pages/Public/Services/Index.tsx` — card Paket jadi token tema: `bg-white→bg-card`, `border-slate-200→border-line`, `text-slate-900→text-ink`, `text-slate-500→text-ink-3`, `text-slate-400→text-ink-4`; state highlighted dapat varian dark (`dark:border-brand-500/50 dark:ring-brand-500/20` + glow lebih terang); icon chip (`dark:bg-blue-500/10 dark:text-blue-400`) dan CTA WhatsApp (`dark:border-blue-500 dark:bg-transparent dark:text-blue-300`) dapat varian dark. Card Joki & `Reguler.tsx` sudah token-based — tidak diubah.
- **Verifikasi:**
  ```powershell
  npm run build   # ✓ built in 18.81s (exit 0)
  # cek CSS hasil build (public/build/assets/app-DmBNhqqU.css):
  # scaleY(0)→scaleY(1) + transform-origin:bottom + cubic-bezier(.22,1,.36,1) ✓
  # :has(:focus-visible) lolos minifikasi ✓; chip rgba(255,255,255,.14) ✓; reduced-motion ✓
  ```
- **Unresolved:** verifikasi visual hover di browser (light & dark, tab Paket & Joki) belum diotomasi — perlu dicek user di dev server (HMR sudah membawa perubahan). Tidak ada perubahan backend — test PHP tidak relevan untuk perubahan ini.

### Audit (read-only, sesi yang sama) — `GET /pantau-pesanan`

- **Fokus:** Audit halaman pantau pesanan untuk mengidentifikasi apa yang perlu ditambah/diperbaiki. **Tidak ada kode diubah.**
- **Temuan bug (verified via `TrackOrderController.php`):** (1) `pay()` memilih invoice `sortByDesc('created_at')` = unpaid terbaru, padahal tiap kartu invoice punya tombol bayar dan `index()` memprioritaskan DP (`sortBy` asc) — jika DP & final dua-duanya unpaid, tombol "Bayar DP" membuat token untuk invoice FINAL (endpoint tidak menerima param invoice); (2) `paymentUrl` dirender dari `snap_token` tanpa cek `snap_token_expires_at` → tombol "Buka link langsung (vtweb)" bisa kadaluarsa (POST /pay memang regenerate); (3) `TrackOrder.tsx` tidak memakai `noIndex` (SeoHead mendukung) & robots.txt tidak disallow `/pantau-pesanan` → halaman privat bisa terindeks; (4) pesan 403 PDF menyebut "Buka via dashboard" padahal login client sudah diblokir; (5) route `track.lookup` (POST 10/1) tidak dipakai FE (FE pakai `router.get` GET 30/1); (6) dua link PDF redundan per invoice; (7) prop legacy `invoice`/`paymentUrl` top-level nyaris tidak dipakai; (8) tidak ada log lookup gagal (rancangan §7 belum diimplementasi).
- **Gap fitur (konteks: login client diblokir → pantau = satu-satunya portal klien):** (a) **tidak ada jalur unduh file hasil** — route download hanya di `/dashboard` (auth); (b) testimoni butuh auth juga; (c) tidak ada notifikasi WA otomatis saat status/progress berubah (WhatsappService sudah ada, dipakai hanya untuk invoice/order); (d) tidak ada auto-refresh/refresh manual setelah bayar; (e) tidak ada ringkasan total/sudah dibayar/sisa; (f) tidak ada countdown token 14 menit; (g) tidak ada tombol salin kode/link; (h) status berupa badge (bukan stepper posisi).
- **Catatan:** rekomendasi prioritas disampaikan ke user di sesi; belum ada item yang dieksekusi.

### Follow-up 4 (sesi yang sama) — Eksekusi P0 audit pantau: bayar per-invoice, expiry link, noindex, copy 403

- **Fokus:** Perbaikan 4 temuan P0 audit di atas (tanpa fitur baru; P1 unduh file hasil & notifikasi WA ditahan menunggu keputusan user).
- **File diubah:**
  - `app/Http/Controllers/TrackOrderController.php`:
    - `pay()` — pilih invoice dari param `invoice` (form/query, dibaca `$request->input()` sehingga `GET /pay/{code}?invoice=` juga jalan); fallback **unpaid terlama (DP dulu)** konsisten dengan `index()`; error jelas `Tagihan X tidak ditemukan atau sudah dibayar.` jika param menunjuk invoice paid/asing. Sebelumnya selalu `sortByDesc('created_at')` = unpaid terbaru → tombol "Bayar DP" bisa membuat token invoice FINAL.
    - `index()` — `paymentUrl` (top-level & per-invoice) hanya diisi jika `status=unpaid && snap_token && snap_token_expires_at?->isFuture()`; token kadaluarsa → FE otomatis menampilkan tombol Generate (regenerate lewat POST) alih-alih link vtweb mati.
    - `index()` & `invoicePdf()` — header `X-Robots-Tag: noindex, nofollow` (index via `->toResponse($request)->header(...)`).
    - `invoicePdf()` — copy 403 diganti: "Buka ulang halaman Pantau Pesanan untuk link baru, atau minta admin mengirim ulang." (dashboard client sudah nonaktif).
  - `resources/js/Pages/Public/TrackOrder.tsx` — `SeoHead` dapat `noIndex`; kedua form bayar (initiate & generate) menambah `<input type="hidden" name="invoice" value={inv.number} />` agar backend tahu invoice mana yang diklik.
  - `tests/Feature/TrackOrderTest.php` — **BARU** 6 tests: render + notFound; paymentUrl hanya untuk token unexpired (DP expired → null, FINAL fresh → URL, top-level fallback null); header noindex; `pay` memakai param invoice (regresi bug DP→FINAL via Mockery mock `MidtransService`); fallback unpaid terlama tanpa param; invoice paid ditolak (`assertSessionHasErrors` + `shouldNotReceive`).
  - `tests/Feature/InvoicePdfSecurityTest.php` — tambah assert `X-Robots-Tag` di signed 200.
- **Keputusan:**
  - Param dipilih `invoice` = **nomor invoice** (INV-xxx) mengikuti pola yang sudah ada di `invoicePdf()` (`?invoice=`), bukan id.
  - noindex via **header** (andal tanpa SSR) + meta `noIndex` SeoHead (dokumentasi intent); robots.txt `/pantau-pesanan` **tidak** di-disallow agar crawler tetap bisa melihat meta/header noindex (disallow + noindex = kontradiktif).
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact        # 54 passed (169 assertions) — naik dari 48 (6 test baru)
  npm run build                     # ✓ built in 26.36s (exit 0)
  npx tsc --noEmit                  # error pra-existing di file lain; TrackOrder.tsx bersih
  .\vendor\bin\pint --test app\Http\Controllers\TrackOrderController.php tests\Feature\TrackOrderTest.php tests\Feature\InvoicePdfSecurityTest.php  # passed
  ```
- **Unresolved:**
  - Masih terbuka dari audit: (5) route `track.lookup` POST tidak dipakai FE; (6) dua link PDF redundan; (7) prop legacy `invoice`/`paymentUrl`; (8) log lookup gagal.
  - P1 menunggu keputusan user: unduh file hasil via signed link (gap terbesar — login client diblokir), notifikasi WA otomatis saat update status, refresh setelah bayar, ringkasan pembayaran, dll.
  - Verifikasi manual browser pembayaran (DP vs final dua-duanya unpaid) belum dijalankan — logika tercakup test otomatis.

### Follow-up 5 (sesi yang sama) — P1 terpilih: Unduh file hasil di pantau + notifikasi WA otomatis status/progress

- **Fokus:** (1) Jalur unduh deliverable di `/pantau-pesanan` (gap terbesar karena login client diblokir); (2) notifikasi WA otomatis ke klien saat admin mengubah status/progress. **Keputusan user:** semua file yang diupload admin tampil di pantau.
- **File diubah:**
  - `routes/web.php` — 2 route baru signed, throttle `30,1`: `GET /pantau-pesanan/{code}/files/{file}/download` (`track.files.download`) & `GET /pantau-pesanan/{code}/files/download-zip` (`track.files.zip`).
  - `app/Http/Controllers/TrackOrderController.php` — `index()` eager load `files` + payload `files[]` (id, nama, mime, size, versi, tanggal, `downloadUrl` signed 30 menit) + `filesZipUrl` (hanya jika >1 file); method `downloadFile()` & `downloadFilesZip()`: **signed URL ATAU owner/admin** (pola sama `invoicePdf`), cek `file.project_id === project.id` (404), file tak ada → 404; bila `php-zip` absen → redirect pantau + flash error (fallback unduh per file).
  - `resources/js/Pages/Public/TrackOrder.tsx` — section "File Hasil (n)" setelah invoice: list file (nama, v, ukuran, tanggal) + tombol Unduh + tombol "Unduh semua (.zip)" bila `filesZipUrl`; analytics `file_download`/`files_zip_download`.
  - `resources/js/lib/utils.ts` — `formatBytes()` baru (B/KB/MB/GB).
  - `app/Services/WhatsappService.php` — `buildProjectUpdateMessage()` (sapaan, kode, judul, status label + progress, hint per status, catatan, link pantau) + `notifyProjectUpdate()` (skip + log bila tanpa phone; pakai `client_wa_cache` → fallback `user.phone`).
  - `app/Http/Controllers/Admin/OrderController.php` — `updateStatus()`: bandingkan status lama; hanya kirim WA saat **berubah** (try/catch + Log, tidak boleh menggagalkan aksi admin).
  - `app/Http/Controllers/Admin/ProjectController.php` — `update()`: kirim WA saat **progress berubah** (note `X% → Y%` + `update_notes` bila diisi).
  - `tests/Feature/TrackOrderTest.php` — +3 tests: payload files + `downloadUrl` signed & `filesZipUrl` null (1 file); unduh 1 file tanpa signature 403 → dengan signature 200 `assertDownload`; zip tanpa signature 403 → dengan signature 200 + `filesZipUrl` berisi `download-zip` (2 file).
  - `tests/Feature/AdminProjectNotificationTest.php` — **BARU** 4 tests: status berubah → `notifyProjectUpdate` dipanggil; status sama → tidak; progress berubah → dipanggil; progress sama → tidak (Mockery mock `WhatsappService`).
- **Keputusan:**
  - Kirim WA **sinkron** (try/catch) bukan queued job: `QUEUE_CONNECTION=database` tanpa worker → job `SendInvoiceNotification`-style tidak akan terkirim; `WhatsappService::send()` sudah aman no-op (log + waLink) bila gateway absen.
  - Signed URL 30 menit konsisten dengan invoice PDF; fallback owner/admin tetap ada untuk admin cek file.
  - File tampil untuk **semua** status (user pilih "semua file yang diupload admin").
  - `uploadFile()` auto-bump progress **tidak** mengirim WA (hindari spam; sudah ada entry timeline) — bisa ditambah bila diminta.
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact   # 60 passed, 1 skipped (198 assertions) — zip test di-skip: class ZipArchive tidak ada di PHP CLI (php_zip.dll ada tapi belum di-enable di C:\xampp\php\php.ini)
  npm run build                # ✓ built in 28.73s (exit 0), TrackOrder-B5BgXmXY.js 15.39 kB
  npx tsc --noEmit             # TrackOrder.tsx & utils.ts bersih (error lain pre-existing)
  .\vendor\bin\pint --test <7 file yang diubah>  # passed
  ```
- **Unresolved:**
  - **Aktifkan `extension=zip` di `C:\xampp\php\php.ini` + restart** agar fitur ZIP jalan di lokal (tanpa itu muncul fallback pesan "Fitur ZIP belum tersedia — unduh satu per satu"). **(RESOLVED 2026-10-24 via Laragon, bukan XAMPP — `extension=zip` aktif di `C:\Laragon\bin\php\php-8.3.28-Win32-vs16-x64\php.ini`; instruksi XAMPP di atas sudah tidak berlaku.)**
  - Verifikasi manual browser: unduh file via signed link dari halaman pantau + WA notif end-to-end dengan gateway Fonnte asli belum dijalankan.
  - Sisa audit P2 masih terbuka: route `track.lookup` tidak dipakai FE, dua link PDF redundan, prop legacy `invoice`/`paymentUrl`, log lookup gagal + limit per-code; P1 sisa: refresh setelah bayar, ringkasan pembayaran, countdown token, tombol salin kode/link, stepper status.

### Follow-up 6 (sesi yang sama) — Histori progres di pantau: foto + notes + tanggal dari upload admin

- **Fokus:** Permintaan user: foto + notes yang diinput admin di `/admin/projects` belum muncul di pantau pesanan; user mau ada histori lengkap (foto, notes, tanggal).
- **File dibuat / diubah:**
  - `database/migrations/2026_10_16_000000_add_project_update_id_to_project_files.php` — **BARU**: `project_files.project_update_id` nullable FK → `project_updates`, `nullOnDelete`. Sudah dijalankan di DB dev (`php artisan migrate --force` → DONE 504ms).
  - `app/Models/ProjectFile.php` — fillable `project_update_id` + relasi `projectUpdate()`; **catatan: nama relasi `update()` fatal error** (`declaration must be compatible with Model::update()`) — jangan pakai nama itu.
  - `app/Models/ProjectUpdate.php` — relasi `files()`.
  - `app/Http/Controllers/Admin/ProjectController.php` — `uploadFile()`: gambar → `ImageOptimizer` (max 1600px, WebP); **selalu** create `ProjectUpdate` "Progres v{n} diunggah" (notes = input `version_notes`) + link file via `project_update_id`; mime/size dibaca dari `Storage::disk('public')`; auto-bump progress +10 tetap.
  - `app/Http/Controllers/TrackOrderController.php` — `index()` eager load `updates.files`; payload `updates[].files[]` (`is_image`, `previewUrl` signed `track.files.preview`, `downloadUrl` signed; keduanya 30 menit); refactor `downloadFile` → `serveFile($request,$code,$file,bool $inline)` + `previewFile()` baru.
  - `routes/web.php` — route baru `GET /pantau-pesanan/{code}/files/{file}/preview` (`track.files.preview`, throttle `60,1`).
  - `resources/js/Pages/Public/TrackOrder.tsx` — timeline: grid thumbnail foto (klik → preview inline tab baru, analytics `photo_open`) + chip unduh file non-gambar; tanggal tetap `formatDate(created_at)`.
  - `resources/js/Pages/Admin/Projects.tsx` — copy: "Deliverable / Foto Progres" + hint "tampil otomatis di timeline Pantau Pesanan klien"; label catatan "tampil di timeline pantau".
  - `tests/Feature/ProjectTimelineTest.php` — **BARU** 3 tests: upload admin → entry timeline v1 + file ter-link + progress 20→30; payload pantau menampilkan foto (is_image + previewUrl signed) & file non-gambar (previewUrl null, downloadUrl signed); preview tanpa signature 403 → signed 200.
- **Keputusan:**
  - Tiap upload file = 1 entry timeline (judul auto "Progres v{n} diunggah") supaya foto/notes/tanggal terlacak — bukan hanya daftar file.
  - Foto tampil via **signed preview inline** (tanpa signature 403) — path storage tidak terekspos; non-gambar tetap chip unduh.
  - File lama (sebelum migrasi) tanpa `project_update_id` tetap muncul di section "File Hasil" tapi tidak di timeline — **tidak ada backfill** (keputusan: hindari tebak tanggal).
  - `php artisan migrate` dijalankan untuk DB dev, bukan hanya test.
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact   # 63 passed, 1 skipped (230 assertions) — naik dari 60+1 (3 test baru)
  npm run build                # ✓ built in 20.76s (exit 0)
  php artisan migrate --force  # 2026_10_16_000000_add_project_update_id_to_project_files DONE 504ms
  npx tsc --noEmit             # TrackOrder.tsx & Admin/Projects.tsx bersih (error lain pre-existing)
  .\vendor\bin\pint --test <7 file yang diubah>  # passed
  ```
- **Unresolved:**
  - Verifikasi browser: upload foto di `/admin/projects` → cek timeline pantau (thumbnail + preview klik) belum dijalankan manual.

### Follow-up 7 (sesi yang sama) — P1 sisa audit pantau: ringkasan pembayaran, stepper, refresh, countdown token, tombol salin

- **Fokus:** 5 item P1 sisa audit pantau yang disetujui user ("iya"): ringkasan total–dibayar–sisa; stepper status; tombol refresh/"sudah bayar"; countdown token Snap; tombol salin kode/link.
- **File diubah:**
  - `app/Http/Controllers/TrackOrderController.php` — payload invoice + `snapTokenExpiresAt` (ISO8601; hanya jika `status=unpaid && snap_token`; paid → null) + payload `summary` `{total, paid, remaining}` (null bila tanpa invoice).
  - `resources/js/Pages/Public/TrackOrder.tsx`:
    - Kartu ringkasan "Total Tagihan / Sudah Dibayar / Sisa" di atas daftar invoice.
    - **Stepper 5 tahap** (Diterima→Review→Dikerjakan→Client Review→Selesai) dari `project.status`; status `cancelled` → banner merah.
    - Tombol "Muat ulang status" (`router.reload` + ikon spinner) di baris aksi + "Sudah bayar? Muat ulang status" di kotak pembayaran.
    - `SnapCountdown` mm:ss (hitung dari `snapTokenExpiresAt` server); saat habis otomatis `router.reload()` → server kirim `paymentUrl=null` → form "Generate Link Bayar QRIS" muncul menggantikan tombol vtweb.
    - Tombol salin kode & salin link pantau (`navigator.clipboard`, feedback "tersalin" 1,8 detik, analytics `copy_link`).
  - `tests/Feature/TrackOrderTest.php` — +1 test `test_track_page_includes_payment_summary_and_snap_token_expiry` (summary 2.220.000/2.220.000/4.440.000; expiry null utk paid, ISO utk unpaid); test render awal + assert `summary` null.
- **Keputusan:**
  - Countdown dihitung dari `snap_token_expires_at` di server, bukan timer 14 menit lokal — akurat meski halaman dibuka lama/refresh.
  - Expired → `router.reload()` (bukan panel expired baru) agar tidak ada state duplikat; form Generate yang sudah ada otomatis tampil.
  - Clipboard API native + fallback senyap; tanpa dependency/toast baru di halaman publik.
  - `preserveScroll` TIDAK valid di `router.reload()` Inertia v3 (`ReloadOptions`) — dihapus (tsc error TS2561).
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact   # 64 passed, 1 skipped (250 assertions) — naik dari 63+1 (1 test baru)
  npm run build                # ✓ built in 26.99s (exit 0)
  npx tsc --noEmit             # TrackOrder.tsx bersih (1 fix tsc union type legacy invoice + snapTokenExpiresAt)
  .\vendor\bin\pint --test app\Http\Controllers\TrackOrderController.php tests\Feature\TrackOrderTest.php  # passed
  ```
- **Unresolved:**
  - Verifikasi browser: countdown mm:ss, auto-reload saat token habis, tombol salin, stepper, refresh setelah bayar — belum dijalankan manual.

### Follow-up 8 (sesi yang sama) — Fix bug: upload foto admin tidak pernah tersimpan (nested form) + meta csrf hilang

- **Laporan user:** foto yang diupload di `/admin/projects` tidak muncul di pantau; klik "Upload File" maupun "Save changes" tidak menyimpan foto.
- **Diagnosis (empiris, bukan asumsi):**
  - DB dev (MySQL `raycode`): `project_files` = **0 baris** (upload tidak pernah tersimpan), `project_updates` ada (Save changes pernah jalan — entry user terlihat).
  - `Admin/Projects.tsx`: form upload (`onSubmit={uploadFile}`) **ter-nested di dalam form "Save changes"** (`onSubmit={save}`). Nested form = HTML invalid: klik "Upload File" membubble submit ke form luar → `uploadFile()` (POST upload) DAN `save()` (PATCH) jalan beruntun; visit Inertia kedua membatalkan visit pertama sebelum request upload terkirim → file tidak pernah sampai server.
  - `app.blade.php` **tidak punya** `<meta name="csrf-token">`, padahal 2 form bayar native di `TrackOrder.tsx` mengambil `_token` dari meta itu → submit bayar dari pantau akan 419 (bug laten, ditemukan saat investigasi).
- **Bukti pipeline server OK (bukan asumsi):** emulasi upload via HTTP nyata (curl, login session admin sementara, header `X-XSRF-TOKEN` — bukan `_token` form) ke proyek uji sementara → HTTP 302 + verifikasi DB: file `project_files/8/BMwfjI1i1Rg5tAywMCv1.webp` (dikonversi WebP oleh `ImageOptimizer`), `project_update_id=8` terisi, `project_updates` = 1, progress 20→30. Proyek/user/file uji **dibersihkan** setelah verifikasi (projects kembali 4, files 0).
- **File diubah:**
  - `resources/js/Pages/Admin/Projects.tsx` — form upload jadi `<div>` (bukan form ter-nested), tombol Upload jadi `type="button"` + `onClick={uploadFile}`, `uploadFile()` tanpa `preventDefault`/argument event.
  - `resources/views/app.blade.php` — tambah `<meta name="csrf-token" content="{{ csrf_token() }}" />` (memperbaiki form bayar native pantau yang selama ini akan 419).
  - `tests/Feature/TrackOrderTest.php` — test noindex di-rename `test_track_page_sends_noindex_header_and_csrf_meta` + assert `name="csrf-token"` tampil.
- **Perintah test + hasil aktual:**
  ```powershell
  php artisan test --compact   # 64 passed, 1 skipped (251 assertions) — assertion baru csrf meta
  npm run build                # ✓ built in 20.82s (exit 0)
  npx tsc --noEmit             # Admin/Projects.tsx bersih
  # Emulasi HTTP curl: login 302 → upload 302 → DB file+timeline+progress terverifikasi → data uji dibersihkan
  ```
- **Unresolved:**
  - User diminta hard-refresh `/admin/projects` lalu coba Upload File lagi (form sudah diperbaiki).
  - Verifikasi browser pembayaran dari pantau (meta csrf baru) belum dijalankan manual.

### Follow-up 9 (sesi yang sama) — Deploy batch ke GitHub (branch `feature/admin-improvements-phase-2`)

- **Permintaan user:** "sekarang deploy".
- **Kondisi repo sebelum deploy:** HEAD lokal == `origin/feature/admin-improvements-phase-2` == `6d84c0a`; `origin/main` masih `6d5b1e7` (initial). Commit deploy sebelumnya (`bc8fca2 Fix production assets`, `6d84c0a hapus gambar unused`) ada di **branch feature ini** → disimpulkan jalur deploy = branch `feature/admin-improvements-phase-2` (bukan main).
- **Artefak build:** `public/build` di-gitignore; user mengupload manual `public/build.zip` ke hosting (layout zip = `build/...` → ekstrak di `public/`). `build.zip` lama (15/10 20:26) **stale** → di-regenerate dari build terbaru. `public/build.rar` tidak diperbarui (jangan dipakai). Keduanya ditambahkan ke `.gitignore` (`3cd76a0`).
- **Commit batch 2026-10-16 (6 commit):**
  1. `3cd76a0` chore: ignore manual build deploy archives (build.zip/rar)
  2. `ae472f2` feat: restrict login to admin only, disable registration, hide login CTA
  3. `6b4ae8f` feat: blog cover upload with strict image optimization (WebP, whitelist)
  4. `9abf82e` fix: admin portfolios paginator + PUT multipart, services hover fill light/dark
  5. `a26a02b` feat(pantau): per-invoice payment, file download/preview/zip, WA notifications, progress timeline, admin upload fixes
  6. docs commit (PROJECT_STATUS + WORKLOG + catatan deploy)
- **Verifikasi sebelum push:** `php artisan test --compact` → 64 passed, 1 skipped (251 assertions); `npm run build` exit 0 (manifest 16/10 10:54); `pint --test` passed.
- **Langkah produksi (wajib dijalankan user di hosting — dari lokal tidak ada akses server):**
  1. `git pull` branch `feature/admin-improvements-phase-2`
  2. `php artisan migrate --force` — **WAJIB**: migrasi `2026_10_16_000000_add_project_update_id_to_project_files` (kolom `project_files.project_update_id`; tanpa ini upload foto admin error di production)
  3. Upload `public/build.zip` → ekstrak ke `public/` (replace `public/build/`)
  4. `php artisan optimize:clear` (view cache — ada perubahan `app.blade.php` meta csrf)
  5. Cek `php artisan storage:link` (unduh/preview file hasil butuh symlink `public/storage`)
  6. Opsional: pastikan `php-zip` aktif untuk tombol "Unduh semua (.zip)" (tanpa itu muncul fallback pesan)
- **Unresolved:**
  - Migrasi + build di produksi belum dijalankan (menunggu user di hosting).
  - WA notif otomatis production bergantung gateway Fonnte di `.env` hosting (di lokal hanya log/no-op bila kosong).
  - `public/hot` jangan ikut terupload (dev only); pastikan tidak ada di server.

---

### Follow-up 10 (sesi yang sama) — Deploy ke hosting raycode.my.id + fix halaman putih + script deploy satu perintah

- **Klarifikasi domain (VERIFIED via fetch eksternal):** situs ray-code live di `https://raycode.my.id` (title "Raycode — Studio Pengembangan Web"). `https://raypurba.my.id` adalah aplikasi **portfolio-laravel** (John Doe, Laravel Breeze) — proyek berbeda, jangan disamakan.
- **Divergence branch:** `origin/main` = `40180ec` (merge PR #1 `b7ad6da` + PR #2 `40180ec` dari feature). `main` bukan ancestor feature → `git pull origin feature/...` di branch main gagal (divergent). Solusi: di server `git stash` → `git checkout feature/admin-improvements-phase-2` → `git pull`.
- **Halaman putih + "build tidak cocok":** saat kejadian, manifest live (`app-B2Xl5R0S.js`) ≠ build lokal (`app-wvz0w5UM.js`) — karena ada **dua sumber build** (Windows vs `npm run build` di server). Pelajaran: `manifest.json` + folder `assets/` wajib dari **satu build yang sama**; jangan campur. User memulihkan dengan copy build lamanya (situs kembali normal; verifikasi eksternal: semua route 200, semua asset 200, halaman login tanpa string `admin@raycode.dev`).
- **Fix keamanan terpisah (commit `b73d792`):** kotak kredensial demo (`admin@raycode.dev / password` dan `client@raycode.dev / password`) dihapus dari `resources/js/Pages/Auth/Login.tsx` + build ulang. **Reminder: ganti password admin production bila masih `password`.**
- **Script deploy (commit `f538e4d`):** `deploy.sh` di root repo — `git pull --ff-only` → `npm install` → `npm run build` → `rm -f public/hot` → `php artisan migrate --force` → `php artisan optimize:clear`. Jalur deploy yang dipilih: **build di server** (menghindari mismatch hash Windows vs Linux dan upload manual zip). `.gitattributes` sudah `* text=auto eol=lf` sehingga `deploy.sh` LF.
- **Cara pakai di hosting:** `cd ~/ray-code && bash deploy.sh` (setelah checkout branch deploy). Pengembangan berikutnya: push/merge di GitHub → SSH → `bash deploy.sh`.
- **Auto-deploy (workflow `0c2b1ed+`):** `.github/workflows/deploy.yml` — GitHub Actions `appleboy/ssh-action` menjalankan `bash deploy.sh` di `~/ray-code` setiap push ke `main` / `feature/admin-improvements-phase-2` + tombol `workflow_dispatch`. Butuh 4 repo secrets: `SSH_HOST`, `SSH_USER`, `SSH_PORT`, `SSH_PRIVATE_KEY` (key ed25519 dari server, pubkey di `~/.ssh/authorized_keys`). Belum aktif sampai secrets diisi user.
- **Unresolved:**
  - Server saat ini di branch `feature/admin-improvements-phase-2`; disarankan PR feature → main lalu pindahkan server ke `main` agar alur deploy seragam (sekali setup, belum dikerjakan).
  - Jalankan `bash deploy.sh` sekali di server agar build live konsisten dengan kode terbaru (saat ini user masih memakai build lama yang disimpan).
  - Verifikasi manual browser di raycode.my.id: upload foto admin → timeline pantau, tombol bayar, countdown/salin.

---

### Follow-up 11 (sesi yang sama) — Auto-deploy pindah jalur: cron pull-based (SSH dari luar diblokir hosting)

- **Temuan:** GitHub Actions SSH gagal: `ssh.ParsePrivateKey: no key found` (paste secret salah) + `dial tcp 202.155.137.39:22 connect: connection refused`. Verifikasi independen dari komputer lokal: TCP 202.155.137.39 / toscana.id.rapidplex.com port **22, 2222, 65002 semuanya tertutup**. Kesimpulan: hosting (rapidplex) tidak menerima SSH dari luar — user selama ini memakai **Terminal cPanel** (bukti: `echo $SSH_CONNECTION` kosong). Jalur GitHub-Actions-SSH **tidak bisa dipakai**.
- **Solusi pengganti:** model cron pull-based, tanpa SSH masuk:
  - `auto-deploy.sh` (baru, root repo) — untuk cron: lock via `mkdir` (anti tumpang-tindih), PATH bootstrap (`/usr/local/bin`, `nodevenv`, `ea-php`), cek `git fetch` + bandingkan HEAD vs `origin/<branch>`, kalau beda jalankan `deploy.sh`, log ke `~/raycode-deploy.log`.
  - `.github/workflows/deploy.yml` **dihapus** (commit) — run SSH tidak dipakai lagi; secrets GitHub boleh dihapus.
- **Cara aktivasi (user, di cPanel):** `cd ~/ray-code && git pull` → test `bash ~/ray-code/auto-deploy.sh` → cPanel → **Cron Jobs** → setiap 5 menit → `bash /home/raycodem/ray-code/auto-deploy.sh`. Verifikasi: cek `~/raycode-deploy.log`; `which git php npm node` untuk memastikan PATH.
- **Unresolved:** aktivasi cron + test build server belum dikonfirmasi (`which npm` belum ada datanya); setelah cron jalan, alur deploy = push ke GitHub → hosting update ≤5 menit.

---

### Follow-up 12 (sesi yang sama) — Server tanpa node: build di-track di git + cron auto-deploy final

- **Verifikasi server (Terminal cPanel):** `which git php npm node` → git `/usr/local/cpanel/3rdparty/lib/path-bin/git` ✓, php `/usr/local/bin/php` (ea-php83) ✓, **npm/node TIDAK ADA**; tidak ada `/opt/cpanel/ea-nodejs*`; log `auto-deploy.sh` menangkap: `ERROR: git/php/npm tidak ketemu ... npm: -`. Artinya build frontend di server mustahil.
- **Keputusan strategi (disepakati user):** `public/build` **di-track di git** — baris `/public/build` di `.gitignore` dinonaktifkan (dikomentari). Build dikerjakan di komputer lokal (`npm run build`) lalu ikut di-commit; server tanpa node cukup `git pull` (build sudah ikut). Menyimpang dari konvensi umum (artefak di repo) — konsekuensi: **setiap perubahan FE wajib `npm run build` + commit `public/build` sebelum push**; repo bertambah ±1 MB per build.
- **`deploy.sh` disederhanakan (tanpa npm):** `git pull --ff-only` → `rm -f public/hot` → `php artisan migrate --force` → `php artisan optimize:clear`.
- **`auto-deploy.sh` disesuaikan:** cek PATH hanya `git` + `php` (tanpa npm); PATH bootstrap tetap (`/usr/local/bin`, `ea-php*`, `nodevenv*`).
- **Migrasi server sekali (dilakukan user):** `cd ~/ray-code && rm -rf public/build && git pull && bash deploy.sh` (hapus build lama manual dulu karena `public/build` sekarang tracked → pull akan menolak overwrite untracked).
- **Unresolved:** cron job cPanel (tiap 5 menit, `bash /home/raycodem/ray-code/auto-deploy.sh`) belum dikonfirmasi user; test push → tunggu ≤5 menit → cek `~/raycode-deploy.log`.

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
