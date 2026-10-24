# Panduan Deploy Raycode dari Lokal ke Hosting

Panduan ini dibuat untuk proyek **Raycode** dengan kondisi saat ini:
- Lokal: `D:\FORTOFOLIO\raycode`
- Repository GitHub: `raypurba12/ray-code`
- Hosting project: `/home/raycodem/ray-code`
- Folder aset yang dilayani domain: `/home/raycodem/public_html`
- Domain: `https://raycode.my.id`
- Stack: Laravel + Inertia React + Vite
- Hosting menggunakan PHP 8.2; build frontend dilakukan di komputer lokal karena build di hosting tidak selalu tersedia/andal.

> **Penting:** `public_html/index.php` saat ini menjalankan Laravel dari `/home/raycodem/ray-code`, tetapi aset publik berada di `/home/raycodem/public_html`. Karena itu, setiap deploy frontend harus memastikan file di `public/build` lokal/proyek tersinkron ke `public_html/build` di hosting. Jangan menganggap folder `ray-code/public` otomatis menjadi folder publik domain.

---

## 1. Aturan aman sebelum deploy

1. Pastikan aplikasi berjalan baik di lokal.
2. Jangan menjalankan `php artisan migrate:fresh`, `migrate:refresh`, atau `db:seed` di production kecuali memang direncanakan dan sudah ada backup serta persetujuan.
3. Jangan menimpa `.env` production dengan `.env` lokal.
4. Jangan menghapus folder aset lama saat menyalin build baru. Aset lama mungkin masih diminta browser/cache.
5. Jangan mengubah `public_html/index.php`, `.htaccess`, atau konfigurasi document root jika tidak diperlukan.
6. Pastikan file sensitif seperti `.env`, kredensial, backup database, dan token tidak ikut masuk Git.

---

## 2. Di komputer lokal — uji perubahan

Buka PowerShell:

```powershell
cd D:\FORTOFOLIO\raycode
```

Periksa perubahan Git:

```powershell
git status
```

Jalankan aplikasi lokal dan uji halaman/fitur yang diubah. Jika perubahan menyentuh backend, periksa log dan alur terkait. Jangan lanjut deploy jika masih ada error penting.

### Build frontend

Jalankan:

```powershell
npm install
npm run build
```

Jika proyek menggunakan lockfile dan dependensi sudah terpasang, `npm ci` bisa dipakai sebagai pengganti `npm install` untuk instalasi yang konsisten:

```powershell
npm ci
npm run build
```

Pakai salah satu metode instalasi saja; jangan menjalankan keduanya tanpa alasan. Pastikan `npm run build` selesai tanpa error.

Periksa hasil build:

```powershell
Test-Path .\public\build\manifest.json
Get-ChildItem .\public\build\assets | Select-Object -First 10 Name, Length
```

Jika `manifest.json` atau folder `assets` tidak ada, **berhenti** dan perbaiki build dahulu.

### Cek status Git dan commit

```powershell
git status
git diff --stat
```

Pastikan hasil build memang ikut dilacak Git (karena proses deploy saat ini bergantung pada aset build yang dikirim ke hosting). Periksa `.gitignore` dan `git status` bila `public/build` tidak muncul.

Setelah meninjau file yang berubah:

```powershell
git add .
git status
git commit -m "Update Raycode"
git push origin main
```

**Catatan:** `git add .` akan memasukkan semua perubahan yang tidak diabaikan Git. Sebelum commit, pastikan tidak ada `.env`, file rahasia, file backup, atau file sementara yang ikut. Jika ada, gunakan `git add` dengan nama file/folder yang memang ingin dikirim, bukan `git add .`.

Jika branch utama bukan `main`, cek nama branch dengan `git branch --show-current` dan gunakan branch yang benar.

---

## 3. Di terminal hosting — backup sebelum update

Masuk ke terminal/SSH hosting sebagai `raycodem`, lalu:

```bash
cd ~/ray-code
pwd
git status --short
```

Jika direktori Git punya perubahan lokal yang belum disimpan, **jangan langsung `git reset --hard`**. Periksa dan selamatkan perubahan tersebut dahulu.

Buat backup manifest dan aset yang sedang aktif:

```bash
BACKUP="$HOME/raycode-deploy-backup-$(date +%Y%m%d-%H%M%S)"
mkdir -p "$BACKUP"
cp -a ~/public_html/build "$BACKUP/build-public_html"
cp -a ~/ray-code/public/build "$BACKUP/build-project"
echo "Backup tersimpan di: $BACKUP"
```

Pastikan perintah backup selesai tanpa error sebelum melanjutkan.

---

## 4. Tarik perubahan terbaru dari GitHub

Di hosting:

```bash
cd ~/ray-code
git fetch origin
git pull --ff-only origin main
```

Jika branch production bukan `main`, sesuaikan dengan branch yang memang digunakan.

Jika `git pull` gagal karena diverged branch atau perubahan lokal, **berhenti**. Jangan langsung memakai `reset --hard`, `git clean -fd`, atau memaksa merge sebelum memeriksa keadaan repository.

---

## 5. Sinkronkan aset ke folder domain

Karena domain melayani file dari `~/public_html`, sedangkan repository proyek berada di `~/ray-code`, salin aset build terbaru ke folder publik.

> **Sejak 23 Oktober 2026**, `deploy.sh` menjalankan langkah ini otomatis (default `PUBLIC_HTML_DIR=~/public_html`, bisa dioverride lewat environment variable). Langkah manual di bawah tetap dipakai jika deploy tanpa `deploy.sh` atau untuk verifikasi.

### 5A. Periksa file build di proyek

```bash
ls -lah ~/ray-code/public/build
ls -lah ~/ray-code/public/build/assets | head
test -f ~/ray-code/public/build/manifest.json && echo "Manifest tersedia" || echo "MANIFEST TIDAK ADA"
```

Jika manifest tidak ada, **berhenti**. Pastikan build lokal `public/build` sudah ikut dipush dan berhasil ditarik dari GitHub.

### 5B. Salin aset tanpa menghapus aset lama

```bash
mkdir -p ~/public_html/build/assets
cp -an ~/ray-code/public/build/assets/. ~/public_html/build/assets/
cp -f ~/ray-code/public/build/manifest.json ~/public_html/build/manifest.json
```

`cp -an` hanya menambahkan file yang belum ada; ia **tidak mengganti file lama yang namanya sama**. `cp -f` untuk manifest menimpa manifest publik agar sesuai dengan build terbaru.

Untuk nama aset Vite yang memiliki hash, file baru biasanya memiliki nama baru. Jika ada file dengan nama yang sama tetapi isinya berubah, periksa secara manual dan buat backup sebelum menimpanya. Jangan menjalankan `rm -rf ~/public_html/build/assets`.

**Penting:** `cp -an` tidak akan memperbarui file lama bernama sama. Jika suatu hari build menghasilkan nama file yang sama dengan konten berubah, lakukan backup dan penyalinan terkontrol untuk file tersebut.

### 5C. Aset statis non-build (logo, ikon, gambar) — sejak 24 Oktober 2026

File di root `public/` selain `build/` (logo navbar, favicon, watermark, `images/`, `robots.txt`) **tidak ikut tersalin oleh langkah 5B**. Sebelum 24 Oktober, file-file ini ada di `~/public_html` hanya karena pernah diupload manual pada deploy 15–16 Oktober, sehingga aset yang baru ditambahkan di repo tidak pernah muncul di domain (mis. `ray-logo.png` → 404, navbar hanya menampilkan teks alt "Raycode").

`deploy.sh` kini menyalinnya otomatis: pola `*.png *.webp *.jpg *.jpeg *.gif *.svg *.ico robots.txt` di root `public/` plus seluruh isi `public/images/`. Berbeda dengan aset build, file-file ini **boleh ditimpa** (`cp -f`) karena namanya tidak ber-hash, sehingga penggantian logo ikut ter-deploy. `index.php`, `.htaccess`, `storage`, dan `build.zip|rar` sengaja tidak disentuh.

Jika isi file di docroot berbeda dari repo, versi docroot dibackup lebih dulu ke `~/raycode-deploy-backup/<YYYYMMDD-HHMMSS>/` sebelum ditimpa. Backup hanya dibuat saat benar-benar ada perbedaan, jadi direktori ini tidak membesar pada deploy berulang.

Langkah manual setara (untuk deploy di luar `deploy.sh` atau verifikasi):

```bash
cd ~/ray-code
for f in public/*.png public/*.webp public/*.jpg public/*.jpeg public/*.gif public/*.svg public/*.ico public/robots.txt; do
  [ -f "$f" ] && cp -f "$f" ~/public_html/"${f#public/}"
done
mkdir -p ~/public_html/images && cp -af public/images/. ~/public_html/images/
```

Verifikasi dari komputer lokal (tanpa SSH):

```bash
curl -sI https://raycode.my.id/ray-logo.png | head -1     # harus 200
cmp -s <(curl -s https://raycode.my.id/ray-logo.png) public/ray-logo.png && echo "byte identik"
```

---

## 6. Backend Laravel — jalankan hanya bila relevan

Tidak semua perubahan perlu menjalankan perintah Artisan. Jika hanya mengubah tampilan/JS/CSS, biasanya cukup build lokal, push, pull, dan sinkronkan aset.

Jika perubahan backend memerlukan cache dibersihkan, jalankan hanya perintah yang sesuai dan setelah backup:

```bash
cd ~/ray-code
php artisan optimize:clear
```

Perintah ini membersihkan cache optimasi Laravel, sehingga aplikasi dapat membangun ulang cache saat diperlukan. Jalankan hanya jika memang perlu dan pastikan aplikasi punya izin tulis ke folder cache.

### Jika ada migration database

1. Baca migration dan pahami dampaknya.
2. Backup database production melalui fasilitas hosting/phpMyAdmin.
3. Jalankan migration hanya setelah memastikan migration aman untuk data yang ada:

```bash
php artisan migrate --force
```

Jangan gunakan `migrate:fresh`, `migrate:refresh`, atau seeder sembarangan di production. Jika ragu, berhenti dan tinjau migration terlebih dahulu.

---

## 7. Verifikasi setelah deploy

### Cek HTTP status aset

Ganti nama file jika manifest build terbaru memakai nama berbeda:

```bash
curl -s -o /dev/null -w "JS: %{http_code}\n" \
https://raycode.my.id/build/assets/app-CXzNRZyn.js

curl -s -o /dev/null -w "CSS: %{http_code}\n" \
https://raycode.my.id/build/assets/app-lVJzhAvQ.css
```

Nama di atas hanya contoh dari build 23 Oktober 2026. Gunakan nama file terbaru dari HTML/manifest saat melakukan deploy berikutnya.

Target: `200` untuk JS dan CSS. Jika `404`, jangan langsung mengubah kode aplikasi. Periksa apakah file yang diminta ada di `~/public_html/build/assets`, apakah manifest sesuai, dan apakah document root/domain benar.

### Tes browser

1. Buka `https://raycode.my.id`.
2. Tekan `Ctrl + F5` untuk memuat ulang tanpa cache lama.
3. Uji halaman yang diubah, navigasi, form, login/admin bila relevan, dan animasi.
4. Buka Developer Tools → Console dan Network. Periksa error JS serta aset `404`.
5. Uji juga halaman lain agar perubahan tidak merusak fitur yang sebelumnya berfungsi.

### Jika tampilan putih atau aset 404

- Ambil nama JS/CSS yang diminta HTML.
- Cek apakah file itu ada di `~/public_html/build/assets/`.
- Bandingkan dengan `~/ray-code/public/build/assets/`.
- Jika ada di project tetapi tidak di `public_html`, sinkronkan file tersebut secara aman.
- Jika file ada di kedua tempat tetapi URL tetap 404, periksa document root, `.htaccess`, permission, dan cache hosting sebelum mengubah konfigurasi.

---

## 8. Checklist singkat setiap deploy

- [ ] Aplikasi dan fitur yang diubah sudah diuji di lokal.
- [ ] `npm run build` sukses.
- [ ] `public/build/manifest.json` dan aset terbaru tersedia.
- [ ] Tidak ada rahasia atau `.env` lokal masuk Git.
- [ ] Perubahan sudah di-commit dan di-push ke branch yang benar.
- [ ] Backup `public_html/build` dan `ray-code/public/build` berhasil dibuat.
- [ ] `git pull --ff-only` berhasil di hosting.
- [ ] Aset baru tersalin ke `public_html/build/assets` (otomatis oleh `deploy.sh`, atau langkah manual 5).
- [ ] Manifest di `public_html/build/manifest.json` cocok dengan build terbaru.
- [ ] Aset statis non-build (logo, ikon, `images/`, `robots.txt`) tersalin ke `public_html` (langkah 5C) — cek `curl -sI https://raycode.my.id/ray-logo.png` = `200`.
- [ ] `index.php` dan `.htaccess` di `public_html` tidak berubah.
- [ ] URL JS/CSS mengembalikan HTTP 200.
- [ ] Website dan fitur terkait lolos uji browser.

---

## Catatan penting untuk perbaikan deploy jangka panjang

Saat ini ada dua lokasi publik (`~/ray-code/public` dan `~/public_html`) yang tidak otomatis tersinkron. Sejak 23 Oktober 2026, `deploy.sh` sudah menyalin `public/build/assets` dan `manifest.json` ke `~/public_html/build` setiap deploy, sehingga risiko HTML meminta aset baru yang belum ada di folder publik sudah ditutup untuk alur deploy normal. Sejak 24 Oktober 2026, langkah 5C menutup celah yang sama untuk aset statis non-build (logo/ikon/gambar) — penyebab `ray-logo.png` 404 di navbar production sementara `ray.png` tetap hidup hanya karena pernah diupload manual.

Dua lokasi ini tetap bisa berbeda jika ada deploy di luar `deploy.sh` atau perubahan manual di `public_html`, jadi verifikasi langkah 7 tetap wajib. Contoh penyimpangan yang masih ada: `favicon.png` di docroot pernah berukuran 1,67 MB padahal versi repo 1 KB (file tersebut tidak dirujuk kode, dan kini ditimpa oleh versi repo dengan backup otomatis).

Solusi jangka panjang yang lebih rapi adalah menjadikan document root domain langsung mengarah ke `~/ray-code/public`, jika hosting mengizinkan, atau membuat prosedur deploy otomatis yang menyalin **seluruh build secara konsisten dan atomik** ke `public_html`. Jangan mengubah document root tanpa memeriksa dukungan hosting dan konfigurasi Laravel terlebih dahulu.
