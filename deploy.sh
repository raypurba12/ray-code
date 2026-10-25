#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"

echo "==> 1/7 Pull kode terbaru (termasuk build frontend)"
git pull --ff-only

echo "==> 2/7 Sinkronkan aset build ke folder publik"
PUBLIC_HTML_DIR="${PUBLIC_HTML_DIR:-$HOME/public_html}"
if [ ! -f public/build/manifest.json ]; then
  echo "ERROR: public/build/manifest.json tidak ditemukan. Deploy dibatalkan." >&2
  exit 1
fi
mkdir -p "$PUBLIC_HTML_DIR/build/assets"
cp -an public/build/assets/. "$PUBLIC_HTML_DIR/build/assets/"
cp -f public/build/manifest.json "$PUBLIC_HTML_DIR/build/manifest.json"

# Domain melayani file dari public_html, sedangkan repo ada di folder proyek, jadi
# aset non-build (logo/ikon/gambar) harus disalin eksplisit. Hanya file statis
# ber-ekstensi gambar + robots.txt; index.php, .htaccess, dan storage tidak disentuh.
echo "==> 3/7 Sinkronkan aset statis (logo, ikon, gambar) ke folder publik"
STATIC_BACKUP_DIR="$HOME/raycode-deploy-backup/$(date +%Y%m%d-%H%M%S)"
sync_static() {
  local src="$1" rel dest backup_dir
  rel="${src#public/}"
  dest="$PUBLIC_HTML_DIR/$rel"
  mkdir -p "$PUBLIC_HTML_DIR/$(dirname "$rel")"
  if [ -f "$dest" ] && ! cmp -s "$src" "$dest"; then
    backup_dir="$STATIC_BACKUP_DIR/$(dirname "$rel")"
    mkdir -p "$backup_dir"
    cp -p "$dest" "$backup_dir/"
    echo "    backup (docroot berbeda dari repo): $rel"
  fi
  cp -f "$src" "$dest"
  echo "    $rel"
}
for pattern in '*.png' '*.webp' '*.jpg' '*.jpeg' '*.gif' '*.svg' '*.ico' 'robots.txt'; do
  for src in public/$pattern; do
    if [ -f "$src" ]; then
      sync_static "$src"
    fi
  done
done
for src in public/images/*; do
  if [ -f "$src" ]; then
    sync_static "$src"
  fi
done

echo "==> 4/7 Hapus sisa dev-server (kalau ada)"
rm -f public/hot

echo "==> 5/7 Migrasi database"
php artisan migrate --force

echo "==> 6/7 Bersihkan cache"
php artisan optimize:clear

# Cache dibangun ulang tepat setelah clear agar setiap request tidak perlu
# mem-parsing .env dan mendaftarkan seluruh route — memangkas waktu bootstrap/TTFB.
echo "==> 7/7 Cache config + route"
php artisan config:cache
php artisan route:cache

echo ""
echo "==> SELESAI. Buka https://raycode.my.id lalu hard refresh (Ctrl+Shift+R)"
